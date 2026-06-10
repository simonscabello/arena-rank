export const BASE_WIN_XP = 100
export const BASE_LOSS_XP = 40
export const WIN_MARGIN_BONUS = 0.5
export const LOSS_MARGIN_PENALTY = 0.75

export function xpForLevel(level: number): number {
  return (100 * level * (level - 1)) / 2
}

export function levelFromXp(xp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= xp) {
    level++
  }
  return level
}

export function xpToNextLevel(xp: number, level: number): number {
  const nextThreshold = xpForLevel(level + 1)
  return Math.max(0, nextThreshold - xp)
}

export function xpProgressInLevel(xp: number, level: number): { current: number; needed: number } {
  const currentThreshold = xpForLevel(level)
  const nextThreshold = xpForLevel(level + 1)
  return {
    current: xp - currentThreshold,
    needed: nextThreshold - currentThreshold,
  }
}

export function calculateWinXp(margin: number): number {
  return Math.round(BASE_WIN_XP * (1 + margin * WIN_MARGIN_BONUS))
}

export function calculateLossXp(margin: number): number {
  return Math.round(BASE_LOSS_XP * (1 - margin * LOSS_MARGIN_PENALTY))
}
