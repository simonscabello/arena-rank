import { getGlobalRanking } from '#helpers/ranking'
import type { HttpContext } from '@adonisjs/core/http'

export default class RankingController {
  async index({ inertia, auth, request }: HttpContext) {
    const page = Number(request.input('page', 1))
    const { entries, meta } = await getGlobalRanking(page)

    return inertia.render('ranking/index', {
      ranking: entries,
      meta,
      currentUserId: auth.user!.id,
    })
  }
}
