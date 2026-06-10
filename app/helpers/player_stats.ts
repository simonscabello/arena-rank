import {
  applyFinalizedPlayerMatchScope,
  joinTeammateForUser,
  mapMatchOutcome,
  partnerNameSelectColumns,
  resolvePartnerName,
  winLossAggregation,
} from '#helpers/match_partner_queries'
import { formatMatchScore, parseMatchScore } from '#helpers/match_score'
import { getMemberDisplayWithCosmetics } from '#helpers/cosmetic_display'
import db from '@adonisjs/lucid/services/db'

const RECENT_LIMIT = 10
const MIN_GAMES_FOR_WORST_PARTNER = 3

export type PartnerSummary = {
  userId: number
  fullName: string | null
  email: string
  nickname: string | null
  winsTogether: number
  gamesTogether: number
}

export type ArenaPerformance = {
  arenaId: number
  arenaName: string
  city: string | null
  wins: number
  losses: number
  played: number
}

export type RecentMatch = {
  matchId: number
  arenaName: string
  city: string | null
  won: boolean
  playedAt: string
  partnerName: string | null
  scoreLabel: string | null
}

export type PlayerStats = {
  wins: number
  losses: number
  matchesPlayed: number
  bestPartner: PartnerSummary | null
  worstPartner: PartnerSummary | null
  byArena: ArenaPerformance[]
  recentMatches: RecentMatch[]
}

type PartnerRow = {
  userId: number
  fullName: string | null
  email: string
  nickname: string | null
  winsTogether: number
  gamesTogether: number
}

function mapPartnerRow(row: PartnerRow): PartnerSummary {
  return {
    userId: Number(row.userId),
    fullName: row.fullName,
    email: row.email,
    nickname: row.nickname,
    winsTogether: Number(row.winsTogether),
    gamesTogether: Number(row.gamesTogether),
  }
}

async function getPartnerRows(groupId: number, userId: number): Promise<PartnerRow[]> {
  const rows = await db
    .from('match_players as mp')
    .innerJoin('matches as m', 'mp.match_id', 'm.id')
    .innerJoin('match_players as teammate', (join) => {
      join
        .on('teammate.match_id', 'mp.match_id')
        .andOn('teammate.side', 'mp.side')
        .andOnVal('teammate.user_id', '!=', userId)
    })
    .innerJoin('users', 'teammate.user_id', 'users.id')
    .where('m.group_id', groupId)
    .where('m.status', 'finalizada')
    .where('mp.user_id', userId)
    .groupBy('users.id', 'users.full_name', 'users.email', 'users.nickname')
    .select(
      'users.id as userId',
      'users.full_name as fullName',
      'users.email as email',
      'users.nickname as nickname',
      db.raw('COUNT(*) as gamesTogether'),
      db.raw('SUM(CASE WHEN mp.side = m.winner_side THEN 1 ELSE 0 END) as winsTogether')
    )
    .orderBy('winsTogether', 'desc')

  return rows as PartnerRow[]
}

export async function getPlayerStats(groupId: number, userId: number): Promise<PlayerStats> {
  const wlQuery = db.from('match_players as mp')
  applyFinalizedPlayerMatchScope(wlQuery, groupId, userId)
  const aggregation = winLossAggregation()
  const wl = await wlQuery.select(aggregation.wins, aggregation.losses, aggregation.played).first()

  const partnerRows = await getPartnerRows(groupId, userId)
  const bestPartner = partnerRows[0] ? mapPartnerRow(partnerRows[0]) : null

  const worstCandidate = partnerRows
    .filter((row) => Number(row.gamesTogether) >= MIN_GAMES_FOR_WORST_PARTNER)
    .map((row) => ({
      row,
      winRate: Number(row.winsTogether) / Number(row.gamesTogether),
    }))
    .sort((a, b) => a.winRate - b.winRate)[0]

  const worstPartner = worstCandidate ? mapPartnerRow(worstCandidate.row) : null

  const arenaRows = await db
    .from('match_players as mp')
    .innerJoin('matches as m', 'mp.match_id', 'm.id')
    .innerJoin('arenas as a', 'm.arena_id', 'a.id')
    .where('m.group_id', groupId)
    .where('m.status', 'finalizada')
    .where('mp.user_id', userId)
    .groupBy('a.id', 'a.name', 'a.city')
    .select(
      'a.id as arenaId',
      'a.name as arenaName',
      'a.city as city',
      db.raw('COUNT(*) as played'),
      db.raw('SUM(CASE WHEN mp.side = m.winner_side THEN 1 ELSE 0 END) as wins'),
      db.raw('SUM(CASE WHEN mp.side != m.winner_side THEN 1 ELSE 0 END) as losses')
    )
    .orderBy('played', 'desc')

  const recentQuery = db.from('match_players as mp')
  joinTeammateForUser(recentQuery, userId)
  applyFinalizedPlayerMatchScope(recentQuery, groupId, userId)
  recentQuery.innerJoin('arenas as a', 'm.arena_id', 'a.id')

  const recentRows = await recentQuery
    .select(
      'm.id as matchId',
      'a.name as arenaName',
      'a.city as city',
      'mp.side as side',
      'm.winner_side as winnerSide',
      'm.score as score',
      'm.created_at as playedAt',
      ...partnerNameSelectColumns()
    )
    .orderBy('m.created_at', 'desc')
    .limit(RECENT_LIMIT)

  return {
    wins: Number(wl?.wins ?? 0),
    losses: Number(wl?.losses ?? 0),
    matchesPlayed: Number(wl?.played ?? 0),
    bestPartner,
    worstPartner,
    byArena: arenaRows.map((row) => ({
      arenaId: Number(row.arenaId),
      arenaName: row.arenaName,
      city: row.city,
      wins: Number(row.wins),
      losses: Number(row.losses),
      played: Number(row.played),
    })),
    recentMatches: recentRows.map((row) => ({
      matchId: Number(row.matchId),
      arenaName: row.arenaName,
      city: row.city,
      won: mapMatchOutcome(row),
      playedAt: String(row.playedAt),
      partnerName: resolvePartnerName(row),
      scoreLabel: formatMatchScore(parseMatchScore(row.score)),
    })),
  }
}

export async function getMemberDisplay(userId: number) {
  return getMemberDisplayWithCosmetics(userId)
}
