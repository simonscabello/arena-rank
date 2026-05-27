import { avatarUrl } from '#helpers/avatar_storage'
import GameMatch from '#models/game_match'
import MatchPlayer from '#models/match_player'
import db from '@adonisjs/lucid/services/db'

export type RankingEntry = {
  userId: number
  fullName: string | null
  email: string
  avatarUrl: string | null
  totalPoints: number
}

export async function getGroupRanking(groupId: number): Promise<RankingEntry[]> {
  const rows = await db
    .from('bets')
    .innerJoin('matches', 'bets.match_id', 'matches.id')
    .innerJoin('users', 'bets.user_id', 'users.id')
    .where('matches.group_id', groupId)
    .whereNotNull('bets.points_awarded')
    .groupBy('bets.user_id', 'users.full_name', 'users.email', 'users.avatar_path')
    .select(
      'bets.user_id as userId',
      'users.full_name as fullName',
      'users.email as email',
      'users.avatar_path as avatarPath',
      db.raw('COALESCE(SUM(bets.points_awarded), 0) as totalPoints')
    )
    .orderBy('totalPoints', 'desc')

  return rows.map((row) => ({
    userId: Number(row.userId),
    fullName: row.fullName,
    email: row.email,
    avatarUrl: avatarUrl(row.avatarPath),
    totalPoints: Number(row.totalPoints),
  }))
}

export async function getMatchWithRelations(matchId: number) {
  return GameMatch.query()
    .where('id', matchId)
    .preload('arena')
    .preload('players', (query) => query.preload('user'))
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
