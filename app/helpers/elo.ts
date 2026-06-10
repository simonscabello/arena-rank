const ELO_K = 32
const MARGIN_MULTIPLIER = 0.5

export function calculateExpectedScore(teamElo: number, opponentElo: number): number {
  return 1 / (1 + 10 ** ((opponentElo - teamElo) / 400))
}

export function calculateEloDelta(
  teamElo: number,
  opponentElo: number,
  won: boolean,
  margin: number
): number {
  const expected = calculateExpectedScore(teamElo, opponentElo)
  const actual = won ? 1 : 0
  const marginFactor = 1 + margin * MARGIN_MULTIPLIER
  return Math.round(ELO_K * marginFactor * (actual - expected))
}

export function averageElo(elos: number[]): number {
  if (elos.length === 0) return 1000
  return elos.reduce((sum, elo) => sum + elo, 0) / elos.length
}

export { ELO_K, MARGIN_MULTIPLIER }
