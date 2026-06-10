import { consumePendingGuestInvite } from '#helpers/guest_player_invite'
import { consumePendingInvite } from '#helpers/group_access'
import type User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export async function completeAuthLogin(
  auth: HttpContext['auth'],
  session: HttpContext['session'],
  user: User,
  response: HttpContext['response']
) {
  await auth.use('web').login(user)

  if (await consumePendingGuestInvite(session, user, response)) return
  if (await consumePendingInvite(session, user, response)) return

  response.redirect().toRoute('groups.index')
}
