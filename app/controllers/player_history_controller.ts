import { buildHistoryPagePayload, normalizeHistoryFilters } from '#helpers/history_page'
import { displayPerson } from '#helpers/person_display'
import { getSharedGroupIds } from '#helpers/player_history_access'
import User from '#models/user'
import { historyFiltersValidator } from '#validators/history'
import type { HttpContext } from '@adonisjs/core/http'

export default class PlayerHistoryController {
  async show({ inertia, auth, params, request, response }: HttpContext) {
    const viewer = auth.user!
    const targetUserId = Number(params.userId)

    if (targetUserId === viewer.id) {
      return response.redirect().toRoute('history.show', {}, { qs: request.qs() })
    }

    const sharedGroupIds = await getSharedGroupIds(viewer.id, targetUserId)
    if (sharedGroupIds.length === 0) {
      return response.forbidden({ error: 'Você não compartilha nenhuma Play com este jogador.' })
    }

    const targetUser = await User.findOrFail(targetUserId)
    const validated = await request.validateUsing(historyFiltersValidator, {
      data: request.qs(),
    })
    const filters = normalizeHistoryFilters(validated)

    if (filters.groupId && !sharedGroupIds.includes(filters.groupId)) {
      filters.groupId = undefined
    }

    const history = await buildHistoryPagePayload(targetUserId, filters, sharedGroupIds)

    return inertia.render('players/history', {
      player: {
        id: targetUser.id,
        name: displayPerson(targetUser),
      },
      history,
    })
  }
}
