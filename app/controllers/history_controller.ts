import { buildHistoryPagePayload, normalizeHistoryFilters } from '#helpers/history_page'
import { historyFiltersValidator } from '#validators/history'
import type { HttpContext } from '@adonisjs/core/http'

export default class HistoryController {
  async show({ inertia, auth, request }: HttpContext) {
    const user = auth.user!
    const validated = await request.validateUsing(historyFiltersValidator, {
      data: request.qs(),
    })
    const filters = normalizeHistoryFilters(validated)
    const history = await buildHistoryPagePayload(user.id, filters)

    return inertia.render('history/show', { history })
  }
}
