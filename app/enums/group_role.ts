export const GROUP_ROLES = ['membro', 'organizador'] as const
export type GroupRole = (typeof GROUP_ROLES)[number]

export const GROUP_ROLE_LABELS: Record<GroupRole, string> = {
  membro: 'Membro',
  organizador: 'Organizador',
}

export function isOrganizer(role: string) {
  return role === 'organizador'
}
