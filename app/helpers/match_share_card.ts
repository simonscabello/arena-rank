import { appBaseUrl } from '#helpers/app_url'
import { DEFAULT_FRAME_INSET } from '#helpers/cosmetic_display'
import { compactPlayerName } from '#helpers/match_players'
import { buildMatchShareText } from '#helpers/match_share'
import type { MatchScore } from '#helpers/match_score'
import { getStreaksForUser } from '#helpers/match_streaks'
import type MatchPlayer from '#models/match_player'
import db from '@adonisjs/lucid/services/db'
import type { DateTime } from 'luxon'

export type ShareCardAchievement = {
  icon: string
  name: string
  category: string
}

export type ShareCardEquippedTitle = {
  icon: string
  name: string
}

export type ShareCardViewer = {
  displayName: string
  initials: string
  avatarUrl: string | null
  avatarFrameSrc: string | null
  avatarFrameInset: number
  equippedTitle: ShareCardEquippedTitle | null
  funLabel: string | null
  isWinner: boolean
  xpAwarded: number
  eloDelta: number
  eloAfter: number
  rankPosition: number | null
  winStreak: number
  lossStreak: number
  achievements: ShareCardAchievement[]
}

export type ShareCardTeamPlayer = {
  displayName: string
  initials: string
  avatarUrl: string | null
  avatarFrameSrc: string | null
  avatarFrameInset: number
  equippedTitle: ShareCardEquippedTitle | null
  funLabel: string | null
  xpAwarded: number | null
  eloDelta: number | null
  achievements: ShareCardAchievement[]
}

export type ShareCardTeam = {
  side: 1 | 2
  isWinner: boolean
  label: string
  players: ShareCardTeamPlayer[]
}

export type MatchShareCardPayload = {
  mode: 'personal' | 'match'
  playName: string
  arenaName: string
  scoreLabel: string
  winnerSide: 1 | 2
  appUrl: string
  shareText: string
  teams: ShareCardTeam[]
  viewer?: ShareCardViewer
}

export type ShareCardSerializedPlayer = {
  userId: number | null
  side: number
  displayName: string
  initials: string
  avatarUrl: string | null
  funLabel: string | null
  xpAwarded: number | null
  eloDelta: number | null
  eloAfter: number | null
  equippedTitles?: ShareCardEquippedTitle[]
  avatarFrameSrc?: string | null
  avatarFrameInset?: number
}

type AchievementRow = {
  userId: number
  icon: string
  name: string
  category: string
}

export function resolveShareCardMode(
  viewerUserId: number,
  players: ShareCardSerializedPlayer[]
): 'personal' | 'match' {
  const participated = players.some((player) => player.userId === viewerUserId)
  return participated ? 'personal' : 'match'
}

function teamLabelFromPlayers(players: ShareCardSerializedPlayer[], side: number) {
  return players
    .filter((player) => player.side === side)
    .map((player) => compactPlayerName(player.displayName))
    .join(' & ')
}

function shareCardCosmetics(player: ShareCardSerializedPlayer) {
  return {
    equippedTitle: player.equippedTitles?.[0] ?? null,
    avatarFrameSrc: player.avatarFrameSrc ?? null,
    avatarFrameInset: player.avatarFrameInset ?? DEFAULT_FRAME_INSET,
  }
}

export async function getAchievementsUnlockedInMatch(
  playerUserIds: number[],
  statusChangedAt: DateTime | null
): Promise<Map<number, ShareCardAchievement[]>> {
  const byUserId = new Map<number, ShareCardAchievement[]>()

  if (!statusChangedAt || playerUserIds.length === 0) {
    return byUserId
  }

  const from = statusChangedAt.minus({ seconds: 5 })
  const to = statusChangedAt.plus({ minutes: 1 })

  const rows = await db
    .from('user_achievements as ua')
    .innerJoin('achievements as a', 'ua.achievement_id', 'a.id')
    .whereIn('ua.user_id', playerUserIds)
    .where('ua.unlocked_at', '>=', from.toSQL()!)
    .where('ua.unlocked_at', '<=', to.toSQL()!)
    .select('ua.user_id as userId', 'a.icon as icon', 'a.name as name', 'a.category as category')

  for (const row of rows as AchievementRow[]) {
    const list = byUserId.get(row.userId) ?? []
    list.push({ icon: row.icon, name: row.name, category: row.category })
    byUserId.set(row.userId, list)
  }

  return byUserId
}

export async function buildMatchShareCard(params: {
  viewerUserId: number
  playName: string
  arenaName: string
  scoreLabel: string
  winnerSide: number
  score: MatchScore | null
  players: MatchPlayer[]
  serializedPlayers: ShareCardSerializedPlayer[]
  statusChangedAt: DateTime | null
  rankPosition: number | null
}): Promise<MatchShareCardPayload | null> {
  const winnerSide = params.winnerSide as 1 | 2
  if (!params.scoreLabel) {
    return null
  }

  const shareText = buildMatchShareText({
    score: params.score,
    winnerSide,
    players: params.players,
  })

  const playerUserIds = params.serializedPlayers
    .map((player) => player.userId)
    .filter((userId): userId is number => userId !== null)

  const achievementsByUserId = await getAchievementsUnlockedInMatch(
    playerUserIds,
    params.statusChangedAt
  )

  const mode = resolveShareCardMode(params.viewerUserId, params.serializedPlayers)

  const teams: ShareCardTeam[] = [1, 2].map((side) => {
    const sidePlayers = params.serializedPlayers.filter((player) => player.side === side)

    return {
      side: side as 1 | 2,
      isWinner: side === winnerSide,
      label: teamLabelFromPlayers(params.serializedPlayers, side),
      players: sidePlayers.map((player) => ({
        displayName: player.displayName,
        initials: player.initials,
        avatarUrl: player.avatarUrl,
        ...shareCardCosmetics(player),
        funLabel: player.funLabel,
        xpAwarded: player.xpAwarded,
        eloDelta: player.eloDelta,
        achievements: player.userId ? (achievementsByUserId.get(player.userId) ?? []) : [],
      })),
    }
  })

  const base: MatchShareCardPayload = {
    mode,
    playName: params.playName,
    arenaName: params.arenaName,
    scoreLabel: params.scoreLabel,
    winnerSide,
    appUrl: appBaseUrl(),
    shareText,
    teams,
  }

  if (mode === 'personal') {
    const viewer = params.serializedPlayers.find((player) => player.userId === params.viewerUserId)
    if (!viewer || viewer.userId === null) {
      return null
    }

    const streaks = await getStreaksForUser(viewer.userId)
    const cosmetics = shareCardCosmetics(viewer)

    base.viewer = {
      displayName: viewer.displayName,
      initials: viewer.initials,
      avatarUrl: viewer.avatarUrl,
      ...cosmetics,
      funLabel: viewer.funLabel,
      isWinner: viewer.side === winnerSide,
      xpAwarded: viewer.xpAwarded ?? 0,
      eloDelta: viewer.eloDelta ?? 0,
      eloAfter: viewer.eloAfter ?? 0,
      rankPosition: params.rankPosition,
      winStreak: streaks.winStreak,
      lossStreak: streaks.lossStreak,
      achievements: achievementsByUserId.get(viewer.userId) ?? [],
    }
  }

  return base
}
