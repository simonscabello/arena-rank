import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async show({ auth, inertia, response }: HttpContext) {
    if (auth.user) {
      return response.redirect().toRoute('groups.index')
    }

    return inertia.render('home', {})
  }
}
