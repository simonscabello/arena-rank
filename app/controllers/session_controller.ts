import User from '#models/user'
import { consumePendingGuestInvite } from '#helpers/guest_player_invite'
import { consumePendingInvite } from '#helpers/group_access'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { email, password } = request.all()
    const user = await User.verifyCredentials(email, password)

    await auth.use('web').login(user)

    if (await consumePendingGuestInvite(session, user, response)) return
    if (await consumePendingInvite(session, user, response)) return

    response.redirect().toRoute('groups.index')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('session.create')
  }
}
