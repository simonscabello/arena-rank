export type MatchCelebrationPayload = {
  xpAwarded: number
  eloDelta: number
  levelUp: { previousLevel: number; newLevel: number } | null
  achievements: { name: string; icon: string }[]
  rankPosition: number | null
  previousRankPosition: number | null
}

export function parseCelebrationFlash(raw: unknown): MatchCelebrationPayload | null {
  if (!raw) return null
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as MatchCelebrationPayload
    } catch {
      return null
    }
  }
  if (typeof raw === 'object') {
    return raw as MatchCelebrationPayload
  }
  return null
}
