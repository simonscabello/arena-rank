import type { ShopItemType } from '#enums/shop_item_type'
import { getLifetimeBetPoints } from '#helpers/wallet'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

export const DEFAULT_FRAME_INSET = 18

export type ShopItemPayload = {
  icon?: string
  category?: string
  frameSrc?: string
  inset?: number
}

export type EquippedTitle = { icon: string; name: string }

export type EquippedRewards = {
  equippedTitles: EquippedTitle[]
  avatarFrameSrc: string | null
  avatarFrameInset: number
  lifetimeBetPoints: number
}

function parsePayload(payload: unknown): ShopItemPayload {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload) as ShopItemPayload
    } catch {
      return {}
    }
  }
  if (Buffer.isBuffer(payload)) {
    try {
      return JSON.parse(payload.toString('utf8')) as ShopItemPayload
    } catch {
      return {}
    }
  }
  if (payload && typeof payload === 'object') {
    return payload as ShopItemPayload
  }
  return {}
}

function rowItemType(row: Record<string, unknown>): string {
  return String(row.itemType ?? row.item_type ?? '')
}

export async function getEquippedAvatarFrame(userId: number): Promise<{
  avatarFrameSrc: string | null
  avatarFrameInset: number
}> {
  const row = await db
    .from('user_equipped_items as uei')
    .leftJoin('shop_items as si', 'uei.shop_item_id', 'si.id')
    .where('uei.user_id', userId)
    .where('uei.item_type', 'avatar_frame')
    .whereNotNull('uei.shop_item_id')
    .select('si.payload as payload')
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

export async function getEquippedRewards(userId: number): Promise<EquippedRewards> {
  const lifetimeBetPoints = await getLifetimeBetPoints(userId)

  const rows = await db
    .from('user_equipped_items as uei')
    .leftJoin('shop_items as si', 'uei.shop_item_id', 'si.id')
    .where('uei.user_id', userId)
    .whereNotNull('uei.shop_item_id')
    .select(
      'uei.item_type as itemType',
      'uei.slot as slot',
      'si.name as name',
      'si.payload as payload'
    )
    .orderBy('uei.slot', 'asc')

  const equippedTitles: EquippedTitle[] = []
  let avatarFrameSrc: string | null = null
  let avatarFrameInset = DEFAULT_FRAME_INSET

  for (const row of rows) {
    const payload = parsePayload(row.payload)
    const itemType = rowItemType(row as Record<string, unknown>) as ShopItemType

    if (itemType === 'title' && payload.icon) {
      equippedTitles.push({ icon: payload.icon, name: String(row.name) })
    }

    if (itemType === 'avatar_frame' && payload.frameSrc) {
      avatarFrameSrc = payload.frameSrc
      avatarFrameInset = payload.inset ?? DEFAULT_FRAME_INSET
    }
  }

  return {
    equippedTitles,
    avatarFrameSrc,
    avatarFrameInset,
    lifetimeBetPoints,
  }
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
  const rewardsMap = new Map<number, EquippedRewards>()

  await Promise.all(
    userIds.map(async (userId) => {
      rewardsMap.set(userId, await getEquippedRewards(userId))
    })
  )

  return entries.map((entry) => {
    const rewards = rewardsMap.get(entry.userId)!
    return {
      ...entry,
      avatarUrl: entry.avatarUrl,
      equippedTitles: rewards.equippedTitles,
      avatarFrameSrc: rewards.avatarFrameSrc,
      avatarFrameInset: rewards.avatarFrameInset,
    }
  })
}

export async function getMemberDisplayWithRewards(userId: number) {
  const user = await User.findOrFail(userId)
  const rewards = await getEquippedRewards(userId)

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
    equippedTitles: rewards.equippedTitles,
    avatarFrameSrc: rewards.avatarFrameSrc,
    avatarFrameInset: rewards.avatarFrameInset,
    lifetimeBetPoints: rewards.lifetimeBetPoints,
  }
}
