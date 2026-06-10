export type MatchStatus = 'em_andamento' | 'finalizada' | 'cancelada'

export const statusLabel: Record<MatchStatus, string> = {
  em_andamento: 'Em andamento',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
}

export type StatusVariant = 'live' | 'done' | 'cancelled'

export function statusVariant(status: string): StatusVariant {
  if (status === 'em_andamento') return 'live'
  if (status === 'cancelada') return 'cancelled'
  return 'done'
}

export function displayName(person: {
  fullName: string | null
  email: string
  nickname?: string | null
}) {
  return person.nickname || person.fullName || person.email.split('@')[0]
}

export function compactPlayerName(name: string) {
  const trimmed = name.trim()
  if (!trimmed.includes(' ')) {
    return trimmed
  }

  return trimmed.split(/\s+/)[0]
}

export function teamLabel(players: { displayName: string }[]) {
  return players.map((player) => compactPlayerName(player.displayName)).join(' & ')
}

export type SetScore = { side1: number; side2: number }

export function inferWinnerSideFromSets(sets: SetScore[]): 1 | 2 | null {
  let side1Sets = 0
  let side2Sets = 0

  for (const set of sets) {
    if (set.side1 > set.side2) side1Sets++
    else if (set.side2 > set.side1) side2Sets++
  }

  if (side1Sets > side2Sets) return 1
  if (side2Sets > side1Sets) return 2
  return null
}

export function initialsFromName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatEloDelta(delta: number) {
  if (delta > 0) return `+${delta}`
  return String(delta)
}
