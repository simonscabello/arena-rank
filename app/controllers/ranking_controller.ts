import { getGlobalRanking } from '#helpers/ranking'
import { getSharedUserIds } from '#helpers/player_history_access'
import type { HttpContext } from '@adonisjs/core/http'

export default class RankingController {
  async index({ inertia, auth, request }: HttpContext) {
    const viewerId = auth.user!.id
    const page = Number(request.input('page', 1))
    const { entries, meta } = await getGlobalRanking(page)

    const otherUserIds = entries
      .filter((entry) => entry.userId !== viewerId)
      .map((entry) => entry.userId)
    const sharedUserIds = await getSharedUserIds(viewerId, otherUserIds)

    const ranking = entries.map((entry) => {
      if (entry.userId === viewerId) {
        return { ...entry, historyPath: '/historico' as const }
      }
      if (sharedUserIds.has(entry.userId)) {
        return { ...entry, historyPath: `/jogadores/${entry.userId}/historico` as const }
      }
      return { ...entry, historyPath: null }
    })

    return inertia.render('ranking/index', {
      ranking,
      meta,
      currentUserId: viewerId,
    })
  }
}
