export type MatchStatus = 'palpites_abertos' | 'em_andamento' | 'finalizada'

export const statusLabel: Record<MatchStatus, string> = {
  palpites_abertos: 'Palpites abertos',
  em_andamento: 'Em andamento',
  finalizada: 'Finalizada',
}

export type StatusVariant = 'open' | 'live' | 'done'

export function statusVariant(status: string): StatusVariant {
  if (status === 'palpites_abertos') return 'open'
  if (status === 'em_andamento') return 'live'
  return 'done'
}

export function displayName(person: {
  fullName: string | null
  email: string
  nickname?: string | null
}) {
  return person.nickname || person.fullName || person.email.split('@')[0]
}

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
