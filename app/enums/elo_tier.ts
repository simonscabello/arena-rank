export const ELO_TIERS = ['bronze', 'prata', 'ouro', 'diamante', 'mestre'] as const

export type EloTier = (typeof ELO_TIERS)[number]

export const ELO_TIER_THRESHOLDS: Record<EloTier, number> = {
  bronze: 0,
  prata: 1000,
  ouro: 1200,
  diamante: 1400,
  mestre: 1600,
}

export const ELO_TIER_LABELS: Record<EloTier, string> = {
  bronze: 'Bronze',
  prata: 'Prata',
  ouro: 'Ouro',
  diamante: 'Diamante',
  mestre: 'Mestre',
}

export const DEFAULT_ELO = 1000

export function eloTierFromRating(elo: number): EloTier {
  if (elo >= ELO_TIER_THRESHOLDS.mestre) return 'mestre'
  if (elo >= ELO_TIER_THRESHOLDS.diamante) return 'diamante'
  if (elo >= ELO_TIER_THRESHOLDS.ouro) return 'ouro'
  if (elo >= ELO_TIER_THRESHOLDS.prata) return 'prata'
  return 'bronze'
}
