import { DateTime } from 'luxon'
import { displayPerson } from '#helpers/person_display'
import { getGroupRanking } from '#helpers/ranking'
import db from '@adonisjs/lucid/services/db'

export type GroupActivitySummary = {
  matchesThisWeek: number
  activePlayersThisWeek: number
  leaderName: string | null
  leaderElo: number | null
}

function weekStartIso() {
  return DateTime.now().startOf('week').toISO()!
}

export async function getGroupActivitySummary(groupId: number): Promise<GroupActivitySummary> {
  const weekStart = weekStartIso()

  const weeklyRow = await db
    .from('matches')
    .where('group_id', groupId)
    .where('status', 'finalizada')
    .where('created_at', '>=', weekStart)
    .count('* as total')
    .first()

  const activeRow = await db
    .from('match_players as mp')
    .innerJoin('matches as m', 'mp.match_id', 'm.id')
    .where('m.group_id', groupId)
    .where('m.status', 'finalizada')
    .where('m.created_at', '>=', weekStart)
    .whereNotNull('mp.user_id')
    .select(db.raw('COUNT(DISTINCT mp.user_id) as total'))
    .first()

  const ranking = await getGroupRanking(groupId)
  const leader = ranking[0]

  return {
    matchesThisWeek: Number(weeklyRow?.total ?? 0),
    activePlayersThisWeek: Number(activeRow?.total ?? 0),
    leaderName: leader ? displayPerson(leader) : null,
    leaderElo: leader?.elo ?? null,
  }
}
