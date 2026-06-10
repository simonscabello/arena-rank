import { findOrCreateGoogleUser, GoogleAuthError } from '#helpers/google_auth'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('google_auth', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('creates a new user from google profile', async ({ assert }) => {
    const user = await findOrCreateGoogleUser({
      id: 'google-new',
      email: 'novo@test.com',
      name: 'Novo Jogador',
      emailVerificationState: 'verified',
    })

    assert.equal(user.googleId, 'google-new')
    assert.equal(user.email, 'novo@test.com')
    assert.equal(user.fullName, 'Novo Jogador')
    assert.isNull(user.password)
  })

  test('returns existing user by google id', async ({ assert }) => {
    const existing = await User.create({
      googleId: 'google-existing',
      email: 'existing@test.com',
      fullName: 'Existente',
      password: null,
    })

    const user = await findOrCreateGoogleUser({
      id: 'google-existing',
      email: 'other@test.com',
      name: 'Outro Nome',
      emailVerificationState: 'verified',
    })

    assert.equal(user.id, existing.id)
    assert.equal(user.email, 'existing@test.com')
  })

  test('rejects unverified email', async ({ assert }) => {
    await assert.rejects(
      () =>
        findOrCreateGoogleUser({
          id: 'google-unverified',
          email: 'unverified@test.com',
          name: 'Sem Verificação',
          emailVerificationState: 'unverified',
        }),
      GoogleAuthError
    )
  })

  test('rejects missing email', async ({ assert }) => {
    await assert.rejects(
      () =>
        findOrCreateGoogleUser({
          id: 'google-no-email',
          email: null,
          name: 'Sem Email',
          emailVerificationState: 'verified',
        }),
      GoogleAuthError
    )
  })
})
