import {
  avatarStoragePath,
  saveUserAvatarFromRemoteUrl,
  syncGoogleAvatarIfMissing,
} from '#helpers/avatar_storage'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { existsSync } from 'node:fs'
import { unlink } from 'node:fs/promises'

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

function mockFetch(options?: {
  body?: Buffer
  contentType?: string
  contentLength?: string | null
}) {
  const body = options?.body ?? PNG_1X1
  const contentType = options?.contentType ?? 'image/png'
  const contentLength = options?.contentLength ?? null
  const originalFetch = global.fetch

  global.fetch = (async () =>
    ({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': contentType,
        ...(contentLength ? { 'content-length': contentLength } : {}),
      }),
      arrayBuffer: async () =>
        body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
    }) as Response) as typeof fetch

  return () => {
    global.fetch = originalFetch
  }
}

test.group('avatar_storage remote', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  async function createUser() {
    return User.create({
      email: `avatar-remote-${crypto.randomUUID()}@test.com`,
      googleId: `google-${crypto.randomUUID()}`,
      fullName: 'Avatar Remote',
      password: null,
    })
  }

  group.each.teardown(async () => {
    const users = await User.query().whereNotNull('avatar_path')
    for (const user of users) {
      if (user.avatarPath && existsSync(avatarStoragePath(user.avatarPath))) {
        await unlink(avatarStoragePath(user.avatarPath))
      }
    }
  })

  test('saveUserAvatarFromRemoteUrl stores png and sets avatarPath', async ({ assert }) => {
    const restoreFetch = mockFetch({ body: PNG_1X1 })
    const user = await createUser()

    await saveUserAvatarFromRemoteUrl(user, 'https://example.com/avatar.png')

    restoreFetch()
    await user.refresh()

    assert.isNotNull(user.avatarPath)
    assert.match(user.avatarPath!, new RegExp(`user-${user.id}\\.png$`))
    assert.isTrue(existsSync(avatarStoragePath(user.avatarPath!)))
  })

  test('saveUserAvatarFromRemoteUrl rejects files larger than 2 MB', async ({ assert }) => {
    const restoreFetch = mockFetch({ body: Buffer.alloc(2 * 1024 * 1024 + 1) })
    const user = await createUser()

    await assert.rejects(
      () => saveUserAvatarFromRemoteUrl(user, 'https://example.com/large.png'),
      /2 MB/
    )

    restoreFetch()
  })

  test('saveUserAvatarFromRemoteUrl rejects unsupported content type', async ({ assert }) => {
    const restoreFetch = mockFetch({ contentType: 'image/gif' })
    const user = await createUser()

    await assert.rejects(
      () => saveUserAvatarFromRemoteUrl(user, 'https://example.com/avatar.gif'),
      /Formato de imagem não suportado/
    )

    restoreFetch()
  })

  test('syncGoogleAvatarIfMissing skips when user already has avatar', async ({ assert }) => {
    let fetchCalled = false
    const originalFetch = global.fetch
    global.fetch = async () => {
      fetchCalled = true
      throw new Error('fetch should not be called')
    }

    const user = await createUser()
    user.avatarPath = 'uploads/avatars/user-999.png'
    await user.save()

    await syncGoogleAvatarIfMissing(user, 'https://example.com/avatar.png')

    global.fetch = originalFetch
    assert.isFalse(fetchCalled)
  })

  test('syncGoogleAvatarIfMissing skips when remote url is null', async ({ assert }) => {
    let fetchCalled = false
    const originalFetch = global.fetch
    global.fetch = async () => {
      fetchCalled = true
      throw new Error('fetch should not be called')
    }

    const user = await createUser()
    await syncGoogleAvatarIfMissing(user, null)

    global.fetch = originalFetch
    assert.isFalse(fetchCalled)
  })

  test('syncGoogleAvatarIfMissing saves avatar when missing', async ({ assert }) => {
    const restoreFetch = mockFetch({ body: PNG_1X1 })
    const user = await createUser()

    await syncGoogleAvatarIfMissing(user, 'https://example.com/avatar.png')

    restoreFetch()
    await user.refresh()

    assert.isNotNull(user.avatarPath)
    assert.match(user.avatarPath!, new RegExp(`user-${user.id}\\.png$`))
  })

  test('syncGoogleAvatarIfMissing ignores download failures', async ({ assert }) => {
    const originalFetch = global.fetch
    global.fetch = async () => {
      throw new Error('network error')
    }

    const user = await createUser()
    await syncGoogleAvatarIfMissing(user, 'https://example.com/avatar.png')

    global.fetch = originalFetch
    await user.refresh()
    assert.isNull(user.avatarPath)
  })
})
