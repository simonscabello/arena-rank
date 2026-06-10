import { generateInviteCode, PENDING_INVITE_SESSION_KEY } from '#helpers/group_access'
import GameMatch from '#models/game_match'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { inertiaPropsFromHtml } from '#tests/helpers/inertia_page'
import { test } from '@japa/runner'

test.group('Groups', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  async function createUser(email: string) {
    return User.create({
      email,
      password: 'password123',
      fullName: email.split('@')[0],
    })
  }

  async function createPlayWithOrganizer() {
    const organizer = await createUser('organizer@test.com')
    const member = await createUser('member@test.com')
    const inviteCode = generateInviteCode()

    const play = await Group.create({ name: 'Play Original', inviteCode })
    await GroupMember.create({ groupId: play.id, userId: organizer.id, role: 'organizador' })
    await GroupMember.create({ groupId: play.id, userId: member.id, role: 'membro' })

    return { organizer, member, play, inviteCode }
  }

  test('organizer renames play successfully', async ({ client, assert }) => {
    const { organizer, play } = await createPlayWithOrganizer()

    const response = await client.post(`/grupos/${play.id}`).loginAs(organizer).form({
      name: 'Play Renomeada',
    })

    response.assertRedirectsTo(`/grupos/${play.id}`)

    await play.refresh()
    assert.equal(play.name, 'Play Renomeada')
  })

  test('regular member gets 403 when renaming play', async ({ client }) => {
    const { member, play } = await createPlayWithOrganizer()

    const response = await client.post(`/grupos/${play.id}`).loginAs(member).form({
      name: 'Tentativa',
    })

    response.assertStatus(403)
  })

  test('logged in user joins play via invite link', async ({ client, assert }) => {
    const organizer = await createUser('owner@test.com')
    const guest = await createUser('guest@test.com')
    const inviteCode = generateInviteCode()
    const play = await Group.create({ name: 'Play Convite', inviteCode })
    await GroupMember.create({ groupId: play.id, userId: organizer.id, role: 'organizador' })

    const response = await client.get(`/convite/${inviteCode}`).loginAs(guest)

    response.assertRedirectsTo(`/grupos/${play.id}`)

    const membership = await GroupMember.query()
      .where('group_id', play.id)
      .where('user_id', guest.id)
      .first()
    assert.isNotNull(membership)
  })

  test('guest invite link plus signup joins play automatically', async ({ client, assert }) => {
    const organizer = await createUser('owner@test.com')
    const inviteCode = generateInviteCode()
    const play = await Group.create({ name: 'Play Auto Join', inviteCode })
    await GroupMember.create({ groupId: play.id, userId: organizer.id, role: 'organizador' })

    const inviteResponse = await client.get(`/convite/${inviteCode}`)
    inviteResponse.assertSession(PENDING_INVITE_SESSION_KEY, inviteCode)

    const response = await client.post('/signup').withSession(inviteResponse.session()).form({
      fullName: 'Novo Jogador',
      email: 'novo@test.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    })

    response.assertRedirectsTo(`/grupos/${play.id}`)

    const user = await User.findByOrFail('email', 'novo@test.com')
    const membership = await GroupMember.query()
      .where('group_id', play.id)
      .where('user_id', user.id)
      .first()
    assert.isNotNull(membership)
  })

  test('invalid invite code returns 404', async ({ client }) => {
    const response = await client.get('/convite/ZZZZZZ')

    response.assertStatus(404)
  })

  test('active matches list shows compact player names', async ({ client, assert }) => {
    const organizer = await createUser('organizer@test.com')
    const simon = await User.create({
      email: 'simon@test.com',
      password: 'password123',
      fullName: 'Simon Scabello',
    })
    const paula = await User.create({
      email: 'paula@test.com',
      password: 'password123',
      fullName: 'Paula Silva',
    })
    const jennifer = await User.create({
      email: 'jennifer@test.com',
      password: 'password123',
      fullName: 'Jennifer Duarte',
    })
    const maria = await User.create({
      email: 'maria@test.com',
      password: 'password123',
      fullName: 'Maria',
    })

    const inviteCode = generateInviteCode()
    const play = await Group.create({ name: 'Play Partidas', inviteCode })
    await GroupMember.create({ groupId: play.id, userId: organizer.id, role: 'organizador' })
    for (const user of [simon, paula, jennifer, maria]) {
      await GroupMember.create({ groupId: play.id, userId: user.id, role: 'membro' })
    }

    const createResponse = await client
      .post(`/grupos/${play.id}/partidas`)
      .loginAs(organizer)
      .json({
        arenaName: 'Arena Teste',
        players: [
          { userId: simon.id, side: 1 },
          { userId: paula.id, side: 1 },
          { userId: jennifer.id, side: 2 },
          { userId: maria.id, side: 2 },
        ],
      })

    createResponse.assertStatus(200)

    const activeMatch = await GameMatch.query()
      .where('group_id', play.id)
      .where('status', 'em_andamento')
      .first()
    assert.isNotNull(activeMatch)

    const response = await client.get(`/grupos/${play.id}`).loginAs(organizer)
    response.assertStatus(200)

    const props = inertiaPropsFromHtml<{ matches: { playersLabel: string; arenaName: string }[] }>(
      response.text()
    )
    assert.lengthOf(props.matches, 1)
    assert.equal(props.matches[0].playersLabel, 'Simon & Paula vs Jennifer & Maria')
    assert.equal(props.matches[0].arenaName, 'Arena Teste')
  })
})
