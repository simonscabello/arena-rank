export const STREAK_STATUS_MIN = 3

export const AUTO_FUN_LABELS = [
  'On Fire',
  'Imbatível',
  'De mal a pior',
  'Grande jornada, belos fracassos no fim.',
  'Novo trauma supera os antigos.',
  'O "não" você já tem. Vá atrás da humilhação.',
] as const

const WIN_LABELS: { min: number; label: string }[] = [
  { min: 5, label: 'Imbatível' },
  { min: 3, label: 'On Fire' },
]

const LOSS_LABELS: { min: number; labels: readonly string[] }[] = [
  { min: 5, labels: ['O "não" você já tem. Vá atrás da humilhação.', 'De mal a pior'] },
  { min: 4, labels: ['Novo trauma supera os antigos.'] },
  { min: 3, labels: ['De mal a pior', 'Grande jornada, belos fracassos no fim.'] },
]

export function isAutoFunLabel(label: string | null | undefined): boolean {
  if (!label) return false
  return AUTO_FUN_LABELS.includes(label as (typeof AUTO_FUN_LABELS)[number])
}

export function resolveStreakFunLabel(
  winStreak: number,
  lossStreak: number,
  userId?: number
): string | null {
  if (winStreak >= STREAK_STATUS_MIN && winStreak >= lossStreak) {
    for (const tier of WIN_LABELS) {
      if (winStreak >= tier.min) {
        return tier.label
      }
    }
  }

  if (lossStreak >= STREAK_STATUS_MIN) {
    for (const tier of LOSS_LABELS) {
      if (lossStreak >= tier.min) {
        const index = userId ? userId % tier.labels.length : 0
        return tier.labels[index]!
      }
    }
  }

  return null
}

export function resolveDisplayFunLabel(
  storedFunLabel: string | null | undefined,
  winStreak: number,
  lossStreak: number,
  userId?: number
): string | null {
  const streakLabel = resolveStreakFunLabel(winStreak, lossStreak, userId)
  if (streakLabel) {
    return streakLabel
  }
  return storedFunLabel ?? null
}
