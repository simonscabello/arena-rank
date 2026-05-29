import {
  getBetHistory,
  getHistoryFilterOptions,
  getMatchHistory,
  type HistoryFilters,
} from '#helpers/player_history'
import { historyFiltersValidator } from '#validators/history'
import type { HttpContext } from '@adonisjs/core/http'

function normalizeFilters(raw: Record<string, unknown>): HistoryFilters {
  return {
    tab: raw.tab === 'bets' ? 'bets' : 'matches',
    groupId: raw.groupId ? Number(raw.groupId) : undefined,
    arenaId: raw.arenaId ? Number(raw.arenaId) : undefined,
    partnerId: raw.partnerId ? Number(raw.partnerId) : undefined,
    from: raw.from ? String(raw.from) : undefined,
    to: raw.to ? String(raw.to) : undefined,
    page: raw.page ? Number(raw.page) : undefined,
  }
}

export default class HistoryController {
  async show({ inertia, auth, request }: HttpContext) {
    const user = auth.user!
    const validated = await request.validateUsing(historyFiltersValidator, {
      data: request.qs(),
    })
    const filters = normalizeFilters(validated)
    const filterOptions = await getHistoryFilterOptions(user.id)
    const history =
      filters.tab === 'bets'
        ? await getBetHistory(user.id, filters)
        : await getMatchHistory(user.id, filters)

    return inertia.render('history/show', {
      filters,
      filterOptions,
      items: history.items,
      summary: history.summary,
      pagination: history.pagination,
      currentUserId: user.id,
    })
  }
}
