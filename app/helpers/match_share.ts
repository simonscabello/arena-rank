import { compactPlayerName, playerDisplayName } from '#helpers/match_players'
import type { MatchScore } from '#helpers/match_score'
import type MatchPlayer from '#models/match_player'

export function formatShareScore(score: MatchScore | null): string | null {
  if (!score?.sets.length) return null
  return score.sets.map((set) => `${set.side1}x${set.side2}`).join(' ')
}

function winnerNames(players: MatchPlayer[], winnerSide: number): string {
  return players
    .filter((player) => player.side === winnerSide)
    .map((player) => compactPlayerName(playerDisplayName(player)))
    .join(', ')
}

export function buildMatchShareText(params: {
  score: MatchScore | null
  winnerSide: number
  players: MatchPlayer[]
}): string {
  const scoreText = formatShareScore(params.score) ?? '—'
  const winners = winnerNames(params.players, params.winnerSide)

  return [`🏓 Resultado: ${scoreText}`, `🥇 Vencedores: ${winners}`].join('\n')
}
