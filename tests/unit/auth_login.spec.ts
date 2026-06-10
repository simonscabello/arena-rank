import { completeAuthLogin } from '#helpers/auth_login'
import { generateInviteCode, PENDING_INVITE_SESSION_KEY } from '#helpers/group_access'
import { PENDING_GUEST_INVITE_TOKEN_KEY } from '#helpers/guest_player_invite'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

function createMockSession(initial: Record<string, unknown> = {}) {
  const store = new Map(Object.entries(initial))

  return {
    get: (key: string) => store.get(key),
    forget: (key: string) => {
      store.delete(key)
    },
    flash: () => {},
  }
}

function createMockResponse() {
  const redirectTarget = { route: '', params: {} as Record<string, unknown> }

  const response = {
    redirect: () => ({
      toRoute: (name: string, params?: Record<string, unknown>) => {
        redirectTarget.route = name
        redirectTarget.params = params ?? {}
        return response
      },
    }),
  }

  return { response, redirectTarget }
}

function createMockAuth() {
  return {
    use: () => ({
      login: async () => {},
    }),
  }
}

test.group('auth_login', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('consumes pending play invite after login', async ({ assert }) => {
    const organizer = await User.create({
      email: 'owner@test.com',
      googleId: 'google-owner',
      fullName: 'Owner',
      password: null,
    })
    const inviteCode = generateInviteCode()
    const play = await Group.create({ name: 'Play Auto Join', inviteCode })
    await GroupMember.create({ groupId: play.id, userId: organizer.id, role: 'organizador' })

    const user = await User.create({
      email: 'novo@test.com',
      googleId: 'google-novo',
      fullName: 'Novo Jogador',
      password: null,
    })

    const session = createMockSession({ [PENDING_INVITE_SESSION_KEY]: inviteCode })
    const { response, redirectTarget } = createMockResponse()

    await completeAuthLogin(createMockAuth() as never, session as never, user, response as never)

    assert.equal(redirectTarget.route, 'groups.show')
    assert.equal(redirectTarget.params.id, play.id)

    const membership = await GroupMember.query()
      .where('group_id', play.id)
      .where('user_id', user.id)
      .first()
    assert.isNotNull(membership)
  })

  test('consumes pending guest invite after login', async ({ assert }) => {
    const owner = await User.create({
      email: 'owner-guest@test.com',
      googleId: 'google-owner-guest',
      fullName: 'Owner',
      password: null,
    })
    const play = await Group.create({ name: 'Play Guest', inviteCode: generateInviteCode() })
    await GroupMember.create({ groupId: play.id, userId: owner.id, role: 'organizador' })

    const invite = await import('#models/guest_player_invite').then((m) =>
      m.default.create({
        groupId: play.id,
        token: 'guest-token-test',
        displayName: 'Carlos Convidado',
        createdByUserId: owner.id,
      })
    )

    const user = await User.create({
      email: 'carlos@convidado.com',
      googleId: 'google-carlos',
      fullName: 'Carlos Convidado',
      password: null,
    })

    const session = createMockSession({ [PENDING_GUEST_INVITE_TOKEN_KEY]: invite.token })
    const { response, redirectTarget } = createMockResponse()

    await completeAuthLogin(createMockAuth() as never, session as never, user, response as never)

    assert.equal(redirectTarget.route, 'groups.show')
    assert.equal(redirectTarget.params.id, play.id)

    await invite.refresh()
    assert.equal(invite.claimedUserId, user.id)
  })
})
