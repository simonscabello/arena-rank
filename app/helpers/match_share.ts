import { compactPlayerName, displayPersonFromUser, playerDisplayName } from '#helpers/match_players'
import type { MatchScore } from '#helpers/match_score'
import type Bet from '#models/bet'
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

function correctBettorNames(bets: Bet[]): string {
  return bets
    .filter((bet) => bet.pointsAwarded !== null && bet.pointsAwarded > 0)
    .map((bet) => compactPlayerName(displayPersonFromUser(bet.user)))
    .join(', ')
}

export function buildMatchShareText(params: {
  score: MatchScore | null
  winnerSide: number
  players: MatchPlayer[]
  bets: Bet[]
  skipsBets: boolean
}): string {
  const scoreText = formatShareScore(params.score) ?? '—'
  const winners = winnerNames(params.players, params.winnerSide)

  const lines = [`🏓 Resultado: ${scoreText}`, `🥇 Vencedores: ${winners}`]

  if (!params.skipsBets) {
    const correct = correctBettorNames(params.bets)
    lines.push(`✅ Palpiteiros certos: ${correct || 'Nenhum'}`)
  }

  return lines.join('\n')
}
