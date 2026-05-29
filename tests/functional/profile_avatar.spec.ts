import { avatarStoragePath } from '#helpers/avatar_storage'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'
import { existsSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

test.group('Profile avatar', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  async function createUser(email: string) {
    return User.create({
      email,
      password: 'password123',
      fullName: email.split('@')[0],
    })
  }

  test('upload saves avatar and serves it publicly', async ({ client, assert }) => {
    const user = await createUser('avatar@test.com')
    const fixturePath = path.join(app.tmpPath(), `avatar-${user.id}.png`)
    await writeFile(fixturePath, PNG_1X1)

    const response = await client.post('/perfil').loginAs(user).file('avatar', fixturePath)

    response.assertRedirectsTo('/perfil')

    await user.refresh()
    assert.isNotNull(user.avatarPath)
    assert.match(user.avatarPath!, new RegExp(`user-${user.id}\\.png$`))

    const filename = path.basename(user.avatarPath!)
    const avatarResponse = await client.get(`/uploads/avatars/${filename}`)
    avatarResponse.assertStatus(200)

    await unlink(fixturePath)
  })

  test('removeAvatar clears path and deletes file', async ({ client, assert }) => {
    const user = await createUser('remove-avatar@test.com')
    const fixturePath = path.join(app.tmpPath(), `avatar-remove-${user.id}.png`)
    await writeFile(fixturePath, PNG_1X1)

    await client.post('/perfil').loginAs(user).file('avatar', fixturePath)
    await user.refresh()

    const absolutePath = avatarStoragePath(user.avatarPath!)
    assert.isTrue(existsSync(absolutePath))

    const removeResponse = await client.post('/perfil').loginAs(user).field('removeAvatar', '1')

    removeResponse.assertRedirectsTo('/perfil')

    await user.refresh()
    assert.isNull(user.avatarPath)
    assert.isFalse(existsSync(absolutePath))

    await unlink(fixturePath)
  })
})
