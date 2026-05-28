export const DOMINANT_HANDS = ['direita', 'esquerda'] as const
export type DominantHand = (typeof DOMINANT_HANDS)[number]

export const COURT_SIDES = ['direita', 'esquerda'] as const
export type CourtSide = (typeof COURT_SIDES)[number]

export const SKILL_LEVELS = ['cone', 'iniciante', 'intermediario', 'avancado', 'pro'] as const
export type SkillLevel = (typeof SKILL_LEVELS)[number]

export const DOMINANT_HAND_LABELS: Record<DominantHand, string> = {
  direita: 'Destro',
  esquerda: 'Canhoto',
}

export const COURT_SIDE_LABELS: Record<CourtSide, string> = {
  direita: 'Lado direito',
  esquerda: 'Lado esquerdo',
}

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  cone: 'Cone',
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  pro: 'PRO',
}
