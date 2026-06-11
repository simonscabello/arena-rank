export const ACHIEVEMENT_CRITERIA_TYPES = [
  'match_count',
  'win_streak',
  'loss_streak',
  'recent_form',
  'shutout_win',
  'elo_tier',
  'level',
  'manual',
] as const

export type AchievementCriteriaType = (typeof ACHIEVEMENT_CRITERIA_TYPES)[number]

export const ACHIEVEMENT_CATEGORY_LABELS: Record<string, string> = {
  competitive: 'Competitivo',
  meme: 'Meme / Resenha',
  skill: 'Skill',
  troll: 'Resenha / Azar',
}
