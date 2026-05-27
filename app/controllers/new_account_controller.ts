import User from '#models/user'
import { consumePendingInvite } from '#helpers/group_access'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class NewAccountController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/signup', {})
  }

  async store({ request, response, auth, session }: HttpContext) {
    const payload = await request.validateUsing(signupValidator)
    const user = await User.create({ ...payload })

    await auth.use('web').login(user)

    if (await consumePendingInvite(session, user, response)) return

    response.redirect().toRoute('groups.index')
  }
}
