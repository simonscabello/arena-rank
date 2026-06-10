import { formatMatchPlayersLabel } from '#helpers/match_players'
import { formatMatchScore, parseMatchScore } from '#helpers/match_score'
import GameMatch from '#models/game_match'

export const GROUP_RECENT_MATCHES_LIMIT = 10

export type GroupRecentMatch = {
  id: number
  playersLabel: string
  arenaName: string
  scoreLabel: string | null
  playedAt: string
}

export async function getGroupRecentMatches(groupId: number): Promise<GroupRecentMatch[]> {
  const matches = await GameMatch.query()
    .where('group_id', groupId)
    .where('status', 'finalizada')
    .preload('arena')
    .preload('players', (query) => query.preload('user').preload('guestInvite'))
    .orderBy('created_at', 'desc')
    .limit(GROUP_RECENT_MATCHES_LIMIT)

  return matches.map((match) => ({
    id: match.id,
    playersLabel: formatMatchPlayersLabel(match.players),
    arenaName: match.arena.name,
    scoreLabel: formatMatchScore(parseMatchScore(match.score)),
    playedAt: match.createdAt.toISO() ?? match.createdAt.toString(),
  }))
}
