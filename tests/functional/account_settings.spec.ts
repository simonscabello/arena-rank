import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Account settings', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  async function createUser(email: string, fullName?: string) {
    return User.create({
      email,
      password: 'password123',
      fullName: fullName ?? email.split('@')[0],
    })
  }

  test('updates full name', async ({ client, assert }) => {
    const user = await createUser('name@test.com', 'Antigo Nome')

    const response = await client.post('/perfil/conta').loginAs(user).form({
      fullName: 'Novo Nome',
      email: user.email,
    })

    response.assertRedirectsTo('/perfil')

    await user.refresh()
    assert.equal(user.fullName, 'Novo Nome')
  })

  test('updates email to unique address', async ({ client, assert }) => {
    const user = await createUser('old-email@test.com')

    const response = await client.post('/perfil/conta').loginAs(user).form({
      fullName: user.fullName,
      email: 'new-email@test.com',
    })

    response.assertRedirectsTo('/perfil')

    await user.refresh()
    assert.equal(user.email, 'new-email@test.com')
  })

  test('rejects duplicate email', async ({ client, assert }) => {
    const user = await createUser('user-a@test.com')
    await createUser('user-b@test.com')

    const response = await client.post('/perfil/conta').loginAs(user).form({
      fullName: user.fullName,
      email: 'user-b@test.com',
    })

    response.assertRedirectsTo('/perfil')

    await user.refresh()
    assert.equal(user.email, 'user-a@test.com')
  })

  test('rejects password change with wrong current password', async ({ client, assert }) => {
    const user = await createUser('wrong-pass@test.com')

    const response = await client.post('/perfil/conta').loginAs(user).form({
      fullName: user.fullName,
      email: user.email,
      currentPassword: 'wrong-password',
      password: 'newpassword99',
      passwordConfirmation: 'newpassword99',
    })

    response.assertRedirectsTo('/perfil')

    await assert.rejects(async () => {
      await User.verifyCredentials(user.email, 'newpassword99')
    })
  })

  test('updates password with correct current password', async ({ client, assert }) => {
    const user = await createUser('change-pass@test.com')

    const response = await client.post('/perfil/conta').loginAs(user).form({
      fullName: user.fullName,
      email: user.email,
      currentPassword: 'password123',
      password: 'newpassword99',
      passwordConfirmation: 'newpassword99',
    })

    response.assertRedirectsTo('/perfil')

    const verified = await User.verifyCredentials(user.email, 'newpassword99')
    assert.equal(verified.id, user.id)
  })
})
