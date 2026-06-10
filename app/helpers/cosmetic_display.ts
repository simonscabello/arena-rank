import { eloTierFromRating, ELO_TIER_LABELS } from '#enums/elo_tier'
import { levelFromXp, xpProgressInLevel, xpToNextLevel } from '#helpers/level'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

export const DEFAULT_FRAME_INSET = 18

export type FramePayload = {
  frameSrc?: string
  inset?: number
}

export type EquippedTitle = { icon: string; name: string }

export type UserEquippedDisplay = {
  equippedTitles: EquippedTitle[]
  avatarFrameSrc: string | null
  avatarFrameInset: number
}

export type UserProgressionDisplay = {
  xp: number
  level: number
  xpToNextLevel: number
  xpProgressCurrent: number
  xpProgressNeeded: number
  elo: number
  eloTier: string
  eloTierLabel: string
}

export type EquippedCosmetics = UserEquippedDisplay & UserProgressionDisplay

function parsePayload(payload: unknown): FramePayload {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload) as FramePayload
    } catch {
      return {}
    }
  }
  if (Buffer.isBuffer(payload)) {
    try {
      return JSON.parse(payload.toString('utf8')) as FramePayload
    } catch {
      return {}
    }
  }
  if (payload && typeof payload === 'object') {
    return payload as FramePayload
  }
  return {}
}

function rowItemType(row: Record<string, unknown>): string {
  return String(row.itemType ?? row.item_type ?? '')
}

export function buildProgressionDisplay(user: User): UserProgressionDisplay {
  const level = user.level || levelFromXp(user.xp)
  const progress = xpProgressInLevel(user.xp, level)
  const tier = eloTierFromRating(user.elo)

  return {
    xp: user.xp,
    level,
    xpToNextLevel: xpToNextLevel(user.xp, level),
    xpProgressCurrent: progress.current,
    xpProgressNeeded: progress.needed,
    elo: user.elo,
    eloTier: tier,
    eloTierLabel: ELO_TIER_LABELS[tier],
  }
}

export async function getEquippedAvatarFrame(userId: number): Promise<{
  avatarFrameSrc: string | null
  avatarFrameInset: number
}> {
  const row = await db
    .from('user_equipped_items as uei')
    .leftJoin('avatar_frames as af', 'uei.avatar_frame_id', 'af.id')
    .where('uei.user_id', userId)
    .where('uei.item_type', 'avatar_frame')
    .whereNotNull('uei.avatar_frame_id')
    .select('af.payload as payload')
    .first()

  if (!row) {
    return { avatarFrameSrc: null, avatarFrameInset: DEFAULT_FRAME_INSET }
  }

  const payload = parsePayload(row.payload)
  return {
    avatarFrameSrc: payload.frameSrc ?? null,
    avatarFrameInset: payload.inset ?? DEFAULT_FRAME_INSET,
  }
}

export async function getEquippedCosmetics(userId: number): Promise<EquippedCosmetics> {
  const user = await User.findOrFail(userId)
  const progression = buildProgressionDisplay(user)

  const rows = await db
    .from('user_equipped_items as uei')
    .leftJoin('achievements as a', 'uei.achievement_id', 'a.id')
    .leftJoin('avatar_frames as af', 'uei.avatar_frame_id', 'af.id')
    .where('uei.user_id', userId)
    .where((query) => {
      query.whereNotNull('uei.achievement_id').orWhereNotNull('uei.avatar_frame_id')
    })
    .select(
      'uei.item_type as itemType',
      'uei.slot as slot',
      'a.name as achievementName',
      'a.icon as achievementIcon',
      'af.payload as framePayload'
    )
    .orderBy('uei.slot', 'asc')

  const equippedTitles: EquippedTitle[] = []
  let avatarFrameSrc: string | null = null
  let avatarFrameInset = DEFAULT_FRAME_INSET

  for (const row of rows) {
    const itemType = rowItemType(row as Record<string, unknown>)

    if (itemType === 'title' && row.achievementIcon) {
      equippedTitles.push({
        icon: String(row.achievementIcon),
        name: String(row.achievementName),
      })
    }

    if (itemType === 'avatar_frame') {
      const payload = parsePayload(row.framePayload)
      if (payload.frameSrc) {
        avatarFrameSrc = payload.frameSrc
        avatarFrameInset = payload.inset ?? DEFAULT_FRAME_INSET
      }
    }
  }

  return {
    equippedTitles,
    avatarFrameSrc,
    avatarFrameInset,
    ...progression,
  }
}

export async function getEquippedDisplayByUserIds(
  userIds: number[]
): Promise<Map<number, UserEquippedDisplay>> {
  const uniqueUserIds = [...new Set(userIds)]
  const emptyDisplay = (): UserEquippedDisplay => ({
    equippedTitles: [],
    avatarFrameSrc: null,
    avatarFrameInset: DEFAULT_FRAME_INSET,
  })

  if (uniqueUserIds.length === 0) {
    return new Map()
  }

  const rows = await db
    .from('user_equipped_items as uei')
    .leftJoin('achievements as a', 'uei.achievement_id', 'a.id')
    .leftJoin('avatar_frames as af', 'uei.avatar_frame_id', 'af.id')
    .whereIn('uei.user_id', uniqueUserIds)
    .where((query) => {
      query.whereNotNull('uei.achievement_id').orWhereNotNull('uei.avatar_frame_id')
    })
    .whereIn('uei.item_type', ['title', 'avatar_frame'])
    .select(
      'uei.user_id as userId',
      'uei.item_type as itemType',
      'uei.slot as slot',
      'a.name as achievementName',
      'a.icon as achievementIcon',
      'af.payload as framePayload'
    )
    .orderBy('uei.slot', 'asc')

  const displayByUserId = new Map<number, UserEquippedDisplay>(
    uniqueUserIds.map((userId) => [userId, emptyDisplay()])
  )

  for (const row of rows) {
    const userId = Number(row.userId)
    const display = displayByUserId.get(userId) ?? emptyDisplay()
    const itemType = rowItemType(row as Record<string, unknown>)

    if (itemType === 'title' && row.achievementIcon) {
      display.equippedTitles.push({
        icon: String(row.achievementIcon),
        name: String(row.achievementName),
      })
    }

    if (itemType === 'avatar_frame') {
      const payload = parsePayload(row.framePayload)
      if (payload.frameSrc) {
        display.avatarFrameSrc = payload.frameSrc
        display.avatarFrameInset = payload.inset ?? DEFAULT_FRAME_INSET
      }
    }

    displayByUserId.set(userId, display)
  }

  return displayByUserId
}

export async function enrichRankingEntries<T extends { userId: number; avatarUrl: string | null }>(
  entries: T[]
): Promise<
  (T & {
    equippedTitles: EquippedTitle[]
    avatarFrameSrc: string | null
    avatarFrameInset: number
  })[]
> {
  if (entries.length === 0) return []

  const userIds = entries.map((entry) => entry.userId)
  const displayMap = await getEquippedDisplayByUserIds(userIds)

  return entries.map((entry) => {
    const display = displayMap.get(entry.userId) ?? {
      equippedTitles: [],
      avatarFrameSrc: null,
      avatarFrameInset: DEFAULT_FRAME_INSET,
    }

    return {
      ...entry,
      avatarUrl: entry.avatarUrl,
      equippedTitles: display.equippedTitles,
      avatarFrameSrc: display.avatarFrameSrc,
      avatarFrameInset: display.avatarFrameInset,
    }
  })
}

export async function getMemberDisplayWithCosmetics(userId: number) {
  const user = await User.findOrFail(userId)
  const cosmetics = await getEquippedCosmetics(userId)

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    nickname: user.nickname,
    funLabel: user.funLabel,
    avatarUrl: user.avatarUrl,
    initials: user.initials,
    dominantHand: user.dominantHand,
    courtSide: user.courtSide,
    skillLevel: user.skillLevel,
    equippedTitles: cosmetics.equippedTitles,
    avatarFrameSrc: cosmetics.avatarFrameSrc,
    avatarFrameInset: cosmetics.avatarFrameInset,
    xp: cosmetics.xp,
    level: cosmetics.level,
    xpToNextLevel: cosmetics.xpToNextLevel,
    xpProgressCurrent: cosmetics.xpProgressCurrent,
    xpProgressNeeded: cosmetics.xpProgressNeeded,
    elo: cosmetics.elo,
    eloTier: cosmetics.eloTier,
    eloTierLabel: cosmetics.eloTierLabel,
  }
}
