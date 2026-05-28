import { enrichRankingEntries } from '#helpers/shop_rewards'
import Bet from '#models/bet'
import GameMatch from '#models/game_match'
import GroupMember from '#models/group_member'
import MatchPlayer from '#models/match_player'
import db from '@adonisjs/lucid/services/db'

export type RankingEntry = {
  userId: number
  fullName: string | null
  email: string
  nickname: string | null
  avatarUrl: string | null
  totalPoints: number
  betsPlaced: number
  betsCorrect: number
  accuracyPercent: number | null
  currentStreak: number
  equippedTitles?: { icon: string; name: string }[]
  avatarFrameSrc?: string | null
  avatarFrameInset?: number
}

export type RankContext = {
  position: number | null
  totalPoints: number
  pointsToNext: number | null
  leaderPoints: number
  nextRankName: string | null
  nextRankPosition: number | null
}

export type BetParticipation = {
  eligibleCount: number
  betCount: number
  pendingMembers: {
    userId: number
    name: string
    initials: string
    avatarUrl: string | null
  }[]
}

function displayPerson(person: {
  fullName: string | null
  email: string
  nickname?: string | null
}) {
  if (person.nickname) return person.nickname
  if (person.fullName) return person.fullName
  return person.email.split('@')[0]
}

function computeStreak(outcomes: boolean[]) {
  let streak = 0
  for (const correct of outcomes) {
    if (!correct) break
    streak++
  }
  return streak
}

async function buildStreakMap(groupId: number) {
  const rows = await db
    .from('bets')
    .innerJoin('matches', 'bets.match_id', 'matches.id')
    .where('matches.group_id', groupId)
    .where('matches.status', 'finalizada')
    .whereNotNull('bets.points_awarded')
    .select(
      'bets.user_id as userId',
      'bets.points_awarded as pointsAwarded',
      'matches.created_at as playedAt'
    )
    .orderBy('matches.created_at', 'desc')
    .orderBy('matches.id', 'desc')

  const outcomesByUser = new Map<number, boolean[]>()

  for (const row of rows) {
    const userId = Number(row.userId)
    const outcomes = outcomesByUser.get(userId) ?? []
    outcomes.push(Number(row.pointsAwarded) > 0)
    outcomesByUser.set(userId, outcomes)
  }

  const streakMap = new Map<number, number>()
  for (const [userId, outcomes] of outcomesByUser) {
    streakMap.set(userId, computeStreak(outcomes))
  }

  return streakMap
}

function sortRankingEntries(entries: RankingEntry[]) {
  return entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
    if (b.betsCorrect !== a.betsCorrect) return b.betsCorrect - a.betsCorrect

    const accuracyA = a.accuracyPercent ?? -1
    const accuracyB = b.accuracyPercent ?? -1
    if (accuracyB !== accuracyA) return accuracyB - accuracyA

    return a.betsPlaced - b.betsPlaced
  })
}

export async function getGroupRanking(groupId: number): Promise<RankingEntry[]> {
  const members = await GroupMember.query().where('group_id', groupId).preload('user')

  const statsRows = await db
    .from('bets')
    .innerJoin('matches', 'bets.match_id', 'matches.id')
    .where('matches.group_id', groupId)
    .where('matches.status', 'finalizada')
    .whereNotNull('bets.points_awarded')
    .groupBy('bets.user_id')
    .select(
      'bets.user_id as userId',
      db.raw('COALESCE(SUM(bets.points_awarded), 0) as totalPoints'),
      db.raw('COUNT(*) as betsPlaced'),
      db.raw('SUM(CASE WHEN bets.points_awarded > 0 THEN 1 ELSE 0 END) as betsCorrect')
    )

  const statsMap = new Map(
    statsRows.map((row) => [
      Number(row.userId),
      {
        totalPoints: Number(row.totalPoints),
        betsPlaced: Number(row.betsPlaced),
        betsCorrect: Number(row.betsCorrect),
      },
    ])
  )

  const streakMap = await buildStreakMap(groupId)

  const entries = members.map((membership) => {
    const user = membership.user
    const stats = statsMap.get(user.id) ?? {
      totalPoints: 0,
      betsPlaced: 0,
      betsCorrect: 0,
    }

    return {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      totalPoints: stats.totalPoints,
      betsPlaced: stats.betsPlaced,
      betsCorrect: stats.betsCorrect,
      accuracyPercent:
        stats.betsPlaced > 0 ? Math.round((stats.betsCorrect / stats.betsPlaced) * 100) : null,
      currentStreak: streakMap.get(user.id) ?? 0,
    }
  })

  return enrichRankingEntries(sortRankingEntries(entries))
}

export function getRankContext(ranking: RankingEntry[], userId: number): RankContext {
  const leaderPoints = ranking[0]?.totalPoints ?? 0
  const index = ranking.findIndex((entry) => entry.userId === userId)

  if (index === -1) {
    return {
      position: null,
      totalPoints: 0,
      pointsToNext: null,
      leaderPoints,
      nextRankName: null,
      nextRankPosition: null,
    }
  }

  const entry = ranking[index]

  if (entry.betsPlaced === 0) {
    return {
      position: null,
      totalPoints: 0,
      pointsToNext: null,
      leaderPoints,
      nextRankName: null,
      nextRankPosition: null,
    }
  }

  const position = index + 1

  if (position === 1) {
    return {
      position: 1,
      totalPoints: entry.totalPoints,
      pointsToNext: null,
      leaderPoints: entry.totalPoints,
      nextRankName: null,
      nextRankPosition: null,
    }
  }

  const above = ranking[index - 1]

  return {
    position,
    totalPoints: entry.totalPoints,
    pointsToNext: above.totalPoints - entry.totalPoints,
    leaderPoints,
    nextRankName: displayPerson(above),
    nextRankPosition: index,
  }
}

export async function getBetParticipation(
  matchId: number,
  groupId: number,
  playerUserIds: number[]
): Promise<BetParticipation> {
  const members = await GroupMember.query().where('group_id', groupId).preload('user')
  const bets = await Bet.query().where('match_id', matchId).select('user_id')
  const bettorIds = new Set(bets.map((bet) => bet.userId))
  const playerSet = new Set(playerUserIds)

  const eligible = members.filter((membership) => !playerSet.has(membership.userId))
  const pending = eligible.filter((membership) => !bettorIds.has(membership.userId))

  return {
    eligibleCount: eligible.length,
    betCount: eligible.length - pending.length,
    pendingMembers: pending.map((membership) => ({
      userId: membership.userId,
      name: displayPerson(membership.user),
      initials: membership.user.initials,
      avatarUrl: membership.user.avatarUrl,
    })),
  }
}

export async function getMatchWithRelations(matchId: number) {
  return GameMatch.query()
    .where('id', matchId)
    .preload('arena')
    .preload('players', (query) => query.preload('user').preload('guestInvite'))
    .preload('bets', (query) => query.preload('user'))
    .firstOrFail()
}

export async function isMatchPlayer(matchId: number, userId: number) {
  const player = await MatchPlayer.query()
    .where('match_id', matchId)
    .where('user_id', userId)
    .first()
  return player !== null
}
