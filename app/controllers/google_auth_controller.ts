import { completeAuthLogin } from '#helpers/auth_login'
import { findOrCreateGoogleUser, GoogleAuthError } from '#helpers/google_auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class GoogleAuthController {
  async redirect({ ally, session }: HttpContext) {
    session.put('redirect.previousUrl', '/login')
    return ally.use('google').redirect()
  }

  async callback({ ally, auth, session, response }: HttpContext) {
    const google = ally.use('google')

    if (google.accessDenied()) {
      session.flash('error', 'Login com Google cancelado')
      return response.redirect().toRoute('session.create')
    }

    try {
      const googleUser = await google.user()
      const user = await findOrCreateGoogleUser({
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        emailVerificationState: googleUser.emailVerificationState,
      })

      await completeAuthLogin(auth, session, user, response)
    } catch (error) {
      const message =
        error instanceof GoogleAuthError
          ? error.message
          : 'Não foi possível entrar com Google. Tente novamente.'

      session.flash('error', message)
      return response.redirect().toRoute('session.create')
    }
  }
}
