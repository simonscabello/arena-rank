import { router } from '@inertiajs/react'
import type { HistoryFilters, ProfileSection } from '~/components/profile/types'

export function navigateProfileSection(section: ProfileSection) {
  router.get('/perfil', { section }, { preserveState: true, preserveScroll: true })
}

export function navigateProfileHub() {
  router.get('/perfil', {}, { preserveState: true, preserveScroll: true })
}

export function navigateProfileHistory(next: HistoryFilters) {
  router.get(
    '/perfil',
    { section: 'history', ...next },
    { preserveState: true, preserveScroll: true }
  )
}
