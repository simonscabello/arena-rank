import { historyFiltersValidator } from '#validators/history'
import type { HttpContext } from '@adonisjs/core/http'

function buildProfileHistoryPath(query: Record<string, unknown>) {
  const params = new URLSearchParams()
  params.set('section', 'history')

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    params.set(key, String(value))
  }

  return `/perfil?${params.toString()}`
}

export default class HistoryController {
  async show({ request, response }: HttpContext) {
    const validated = await request.validateUsing(historyFiltersValidator, {
      data: request.qs(),
    })

    return response.redirect().toPath(buildProfileHistoryPath(validated))
  }
}
