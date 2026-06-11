import { DateTime } from 'luxon'
import { formatMatchPlayersLabel } from '#helpers/match_players'
import { getGroupRanking } from '#helpers/ranking'
import GameMatch from '#models/game_match'
import GroupMember from '#models/group_member'
import db from '@adonisjs/lucid/services/db'

export type GroupListSummary = {
  id: number
  name: string
  memberCount: number
  matchesThisWeek: number
  lastMatchAt: string | null
  lastMatchLabel: string | null
  userPosition: number | null
}

function weekStartIso() {
  return DateTime.now().startOf('week').toISO()!
}

export async function getGroupListSummaries(
  userId: number,
  groupIds: number[]
): Promise<GroupListSummary[]> {
  if (groupIds.length === 0) return []

  const memberCounts = await db
    .from('group_members')
    .whereIn('group_id', groupIds)
    .groupBy('group_id')
    .select('group_id as groupId', db.raw('COUNT(*) as count'))

  const memberCountByGroup = new Map(
    memberCounts.map((row) => [Number(row.groupId), Number(row.count)])
  )

  const weekStart = weekStartIso()
  const weeklyMatches = await db
    .from('matches')
    .whereIn('group_id', groupIds)
    .where('status', 'finalizada')
    .where('created_at', '>=', weekStart)
    .groupBy('group_id')
    .select('group_id as groupId', db.raw('COUNT(*) as count'))

  const weeklyByGroup = new Map(
    weeklyMatches.map((row) => [Number(row.groupId), Number(row.count)])
  )

  const summaries: GroupListSummary[] = []

  for (const groupId of groupIds) {
    const lastMatch = await GameMatch.query()
      .where('group_id', groupId)
      .where('status', 'finalizada')
      .preload('players', (query) => query.preload('user').preload('guestInvite'))
      .orderBy('created_at', 'desc')
      .first()

    const ranking = await getGroupRanking(groupId)
    const userIndex = ranking.findIndex((entry) => entry.userId === userId)

    summaries.push({
      id: groupId,
      name: '',
      memberCount: memberCountByGroup.get(groupId) ?? 0,
      matchesThisWeek: weeklyByGroup.get(groupId) ?? 0,
      lastMatchAt: lastMatch?.createdAt.toISO() ?? null,
      lastMatchLabel: lastMatch ? formatMatchPlayersLabel(lastMatch.players) : null,
      userPosition: userIndex === -1 ? null : userIndex + 1,
    })
  }

  return summaries
}

export async function getUserGroupMemberships(userId: number) {
  return GroupMember.query().where('user_id', userId).preload('group').orderBy('created_at', 'desc')
}
