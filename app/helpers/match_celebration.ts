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

export function buildCelebrationPayload(params: {
  userId: number
  progression: {
    rewards: { userId: number; xpAwarded: number; eloDelta: number }[]
    levelUps: { userId: number; previousLevel: number; newLevel: number }[]
    newAchievements: { userId: number; achievement: { name: string; icon: string } }[]
  }
  rankBefore: number | null
  rankAfter: number | null
}): MatchCelebrationPayload | null {
  const reward = params.progression.rewards.find((item) => item.userId === params.userId)
  if (!reward) return null

  const levelUp = params.progression.levelUps.find((item) => item.userId === params.userId) ?? null
  const achievements = params.progression.newAchievements
    .filter((item) => item.userId === params.userId)
    .map((item) => item.achievement)

  return {
    xpAwarded: reward.xpAwarded,
    eloDelta: reward.eloDelta,
    levelUp: levelUp ? { previousLevel: levelUp.previousLevel, newLevel: levelUp.newLevel } : null,
    achievements,
    rankPosition: params.rankAfter,
    previousRankPosition: params.rankBefore,
  }
}
