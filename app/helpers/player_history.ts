import {
  joinTeammateForUser,
  mapMatchOutcome,
  partnerNameSelectColumns,
  resolvePartnerName,
} from '#helpers/match_partner_queries'
import { formatMatchScore, parseMatchScore } from '#helpers/match_score'
import { displayPerson } from '#helpers/person_display'
import GroupMember from '#models/group_member'
import db from '@adonisjs/lucid/services/db'
import type { DatabaseQueryBuilderContract } from '@adonisjs/lucid/types/querybuilder'
import type { Knex } from 'knex'

export const HISTORY_PAGE_SIZE = 20

export type HistoryFilters = {
  groupId?: number
  arenaId?: number
  partnerId?: number
  from?: string
  to?: string
  page?: number
}

export type HistoryFilterOptions = {
  groups: { id: number; name: string }[]
  arenas: { id: number; name: string; city: string | null; groupId: number }[]
  partners: { userId: number; name: string; groupId: number }[]
}

export type MatchHistoryItem = {
  matchId: number
  groupId: number
  groupName: string
  arenaName: string
  city: string | null
  won: boolean
  partnerName: string | null
  playedAt: string
  scoreLabel: string | null
}

export type MatchHistorySummary = {
  wins: number
  losses: number
  matchesPlayed: number
  winRate: number
}

export type PaginatedResult<TItem, TSummary> = {
  items: TItem[]
  summary: TSummary
  pagination: {
    page: number
    pageSize: number
    total: number
    lastPage: number
  }
}

function pageNumber(filters: HistoryFilters) {
  return Math.max(1, filters.page ?? 1)
}

function applyDateFilters(
  query: DatabaseQueryBuilderContract,
  filters: HistoryFilters,
  column: string
) {
  if (filters.from) {
    query.whereRaw(`DATE(${column}) >= ?`, [filters.from])
  }
  if (filters.to) {
    query.whereRaw(`DATE(${column}) <= ?`, [filters.to])
  }
}

function applyMatchFilters(
  query: DatabaseQueryBuilderContract,
  filters: HistoryFilters,
  userId: number
) {
  query
    .innerJoin('matches as m', 'mp.match_id', 'm.id')
    .innerJoin('group_members as gm', (join: Knex.JoinClause) => {
      join.on('gm.group_id', 'm.group_id').andOnVal('gm.user_id', userId)
    })
    .innerJoin('groups as g', 'g.id', 'm.group_id')
    .innerJoin('arenas as a', 'a.id', 'm.arena_id')
    .where('m.status', 'finalizada')
    .where('mp.user_id', userId)

  if (filters.groupId) {
    query.where('m.group_id', filters.groupId)
  }
  if (filters.arenaId) {
    query.where('m.arena_id', filters.arenaId)
  }
  if (filters.partnerId) {
    query.whereExists((sub: DatabaseQueryBuilderContract) => {
      sub
        .from('match_players as partner_mp')
        .whereRaw('partner_mp.match_id = mp.match_id')
        .whereRaw('partner_mp.side = mp.side')
        .where('partner_mp.user_id', filters.partnerId!)
        .whereRaw('partner_mp.user_id != mp.user_id')
    })
  }

  applyDateFilters(query, filters, 'm.created_at')
}

export async function getHistoryFilterOptions(userId: number): Promise<HistoryFilterOptions> {
  const memberships = await GroupMember.query()
    .where('user_id', userId)
    .preload('group')
    .orderBy('created_at', 'desc')

  const groups = memberships.map((membership) => ({
    id: membership.group.id,
    name: membership.group.name,
  }))

  const arenaRows = await db
    .from('match_players as mp')
    .innerJoin('matches as m', 'mp.match_id', 'm.id')
    .innerJoin('group_members as gm', (join: Knex.JoinClause) => {
      join.on('gm.group_id', 'm.group_id').andOnVal('gm.user_id', userId)
    })
    .innerJoin('arenas as a', 'a.id', 'm.arena_id')
    .where('m.status', 'finalizada')
    .where('mp.user_id', userId)
    .groupBy('a.id', 'a.name', 'a.city', 'm.group_id')
    .select('a.id as id', 'a.name as name', 'a.city as city', 'm.group_id as groupId')

  const partnerRows = await db
    .from('match_players as mp')
    .innerJoin('matches as m', 'mp.match_id', 'm.id')
    .innerJoin('group_members as gm', (join: Knex.JoinClause) => {
      join.on('gm.group_id', 'm.group_id').andOnVal('gm.user_id', userId)
    })
    .innerJoin('match_players as teammate', (join) => {
      join
        .on('teammate.match_id', 'mp.match_id')
        .andOn('teammate.side', 'mp.side')
        .andOnVal('teammate.user_id', '!=', userId)
    })
    .innerJoin('users as partner', 'teammate.user_id', 'partner.id')
    .where('m.status', 'finalizada')
    .where('mp.user_id', userId)
    .groupBy('partner.id', 'partner.full_name', 'partner.email', 'partner.nickname', 'm.group_id')
    .select(
      'partner.id as userId',
      'partner.full_name as fullName',
      'partner.email as email',
      'partner.nickname as nickname',
      'm.group_id as groupId'
    )
    .orderBy('partner.nickname', 'asc')

  const partners = partnerRows.map((row) => ({
    userId: Number(row.userId),
    name: displayPerson({
      fullName: row.fullName,
      email: row.email,
      nickname: row.nickname,
    }),
    groupId: Number(row.groupId),
  }))

  return {
    groups,
    arenas: arenaRows
      .map((row) => ({
        id: Number(row.id),
        name: row.name,
        city: row.city,
        groupId: Number(row.groupId),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    partners,
  }
}

export async function getMatchHistory(
  userId: number,
  filters: HistoryFilters
): Promise<PaginatedResult<MatchHistoryItem, MatchHistorySummary>> {
  const page = pageNumber(filters)
  const offset = (page - 1) * HISTORY_PAGE_SIZE

  const countQuery = db.from('match_players as mp')
  applyMatchFilters(countQuery, filters, userId)
  const countRow = await countQuery.count('* as total').first()
  const total = Number(countRow?.total ?? 0)

  const summaryQuery = db.from('match_players as mp')
  applyMatchFilters(summaryQuery, filters, userId)
  const summaryRow = await summaryQuery
    .select(
      db.raw('SUM(CASE WHEN mp.side = m.winner_side THEN 1 ELSE 0 END) as wins'),
      db.raw('SUM(CASE WHEN mp.side != m.winner_side THEN 1 ELSE 0 END) as losses'),
      db.raw('COUNT(*) as played')
    )
    .first()

  const wins = Number(summaryRow?.wins ?? 0)
  const losses = Number(summaryRow?.losses ?? 0)
  const matchesPlayed = Number(summaryRow?.played ?? 0)

  const listQuery = db.from('match_players as mp')
  joinTeammateForUser(listQuery, userId)
  applyMatchFilters(listQuery, filters, userId)

  const rows = await listQuery
    .select(
      'm.id as matchId',
      'm.group_id as groupId',
      'g.name as groupName',
      'a.name as arenaName',
      'a.city as city',
      'mp.side as side',
      'm.winner_side as winnerSide',
      'm.score as score',
      'm.created_at as playedAt',
      ...partnerNameSelectColumns()
    )
    .orderBy('m.created_at', 'desc')
    .offset(offset)
    .limit(HISTORY_PAGE_SIZE)

  return {
    items: rows.map((row) => ({
      matchId: Number(row.matchId),
      groupId: Number(row.groupId),
      groupName: row.groupName,
      arenaName: row.arenaName,
      city: row.city,
      won: mapMatchOutcome(row),
      partnerName: resolvePartnerName(row),
      playedAt: String(row.playedAt),
      scoreLabel: formatMatchScore(parseMatchScore(row.score)),
    })),
    summary: {
      wins,
      losses,
      matchesPlayed,
      winRate: matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0,
    },
    pagination: {
      page,
      pageSize: HISTORY_PAGE_SIZE,
      total,
      lastPage: Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE)),
    },
  }
}
