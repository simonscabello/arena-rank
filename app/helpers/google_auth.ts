import User from '#models/user'

type GoogleProfile = {
  id: string
  email: string | null
  name: string | null
  emailVerificationState: 'verified' | 'unverified' | 'unsupported'
}

export class GoogleAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GoogleAuthError'
  }
}

export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  if (!profile.email) {
    throw new GoogleAuthError('O Google não retornou um email para esta conta')
  }

  if (profile.emailVerificationState !== 'verified') {
    throw new GoogleAuthError('Use uma conta Google com email verificado')
  }

  const existing = await User.findBy('googleId', profile.id)
  if (existing) return existing

  return User.create({
    googleId: profile.id,
    email: profile.email,
    fullName: profile.name,
    password: null,
  })
}
