import { formatMatchScore, parseMatchScore } from '#helpers/match_score'
import db from '@adonisjs/lucid/services/db'

export type HeadToHeadMatch = {
  matchId: number
  arenaName: string
  scoreLabel: string | null
  playedAt: string
  viewerWon: boolean
}

export type HeadToHeadSummary = {
  played: number
  winsForViewer: number
  winsForOpponent: number
  recentMatches: HeadToHeadMatch[]
}

export async function getHeadToHead(
  groupId: number,
  viewerId: number,
  opponentId: number
): Promise<HeadToHeadSummary> {
  const rows = await db
    .from('match_players as mp_viewer')
    .innerJoin('matches as m', 'mp_viewer.match_id', 'm.id')
    .innerJoin('match_players as mp_opponent', (join) => {
      join
        .on('mp_opponent.match_id', 'mp_viewer.match_id')
        .andOnVal('mp_opponent.user_id', opponentId)
    })
    .innerJoin('arenas as a', 'm.arena_id', 'a.id')
    .where('m.group_id', groupId)
    .where('m.status', 'finalizada')
    .where('mp_viewer.user_id', viewerId)
    .whereRaw('mp_viewer.side != mp_opponent.side')
    .select(
      'm.id as matchId',
      'a.name as arenaName',
      'm.score as score',
      'm.winner_side as winnerSide',
      'mp_viewer.side as viewerSide',
      'm.created_at as playedAt'
    )
    .orderBy('m.created_at', 'desc')

  let winsForViewer = 0
  let winsForOpponent = 0

  for (const row of rows) {
    if (Number(row.winnerSide) === Number(row.viewerSide)) winsForViewer++
    else winsForOpponent++
  }

  const recentMatches: HeadToHeadMatch[] = rows.slice(0, 5).map((row) => ({
    matchId: Number(row.matchId),
    arenaName: String(row.arenaName),
    scoreLabel: formatMatchScore(parseMatchScore(row.score)),
    playedAt: String(row.playedAt),
    viewerWon: Number(row.winnerSide) === Number(row.viewerSide),
  }))

  return {
    played: rows.length,
    winsForViewer,
    winsForOpponent,
    recentMatches,
  }
}
