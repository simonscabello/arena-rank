import { router } from '@inertiajs/react'
import type { HistoryFilters, ProfileSection } from '~/components/profile/types'

export function navigateProfileSection(section: ProfileSection) {
  router.get('/perfil', { section }, { preserveState: true, preserveScroll: true })
}

export function navigateProfileHub() {
  router.get('/perfil', {}, { preserveState: true, preserveScroll: true })
}

export function navigateHistory(next: HistoryFilters) {
  router.get('/historico', next, { preserveState: true, preserveScroll: true })
}

export function navigatePlayerHistory(userId: number, next: HistoryFilters) {
  router.get(`/jogadores/${userId}/historico`, next, { preserveState: true, preserveScroll: true })
}
