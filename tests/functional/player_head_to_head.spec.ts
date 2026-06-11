import { generateInviteCode } from '#helpers/group_access'
import { getHeadToHead } from '#helpers/player_head_to_head'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import User from '#models/user'
import { finalizePayload } from '#tests/helpers/finalize_match'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Player head to head', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  async function createUser(email: string) {
    return User.create({
      email,
      password: 'password123',
      fullName: email.split('@')[0],
    })
  }

  test('counts wins between opponents in same play', async ({ client, assert }) => {
    const owner = await createUser('owner-h2h@test.com')
    const alice = await createUser('alice-h2h@test.com')
    const bob = await createUser('bob-h2h@test.com')
    const carol = await createUser('carol-h2h@test.com')
    const dave = await createUser('dave-h2h@test.com')

    const play = await Group.create({ name: 'H2H Play', inviteCode: generateInviteCode() })
    for (const user of [owner, alice, bob, carol, dave]) {
      await GroupMember.create({
        groupId: play.id,
        userId: user.id,
        role: user.id === owner.id ? 'organizador' : 'membro',
      })
    }

    async function createAndFinalize(
      players: { userId: number; side: number }[],
      winnerSide: 1 | 2
    ) {
      const response = await client
        .post(`/grupos/${play.id}/partidas`)
        .loginAs(owner)
        .json({ arenaName: 'Arena H2H', players })

      const matchId = Number(response.redirects().at(-1)!.split('/').pop())
      await client
        .post(`/partidas/${matchId}/finalizar`)
        .loginAs(owner)
        .json(finalizePayload(winnerSide))
    }

    await createAndFinalize(
      [
        { userId: alice.id, side: 1 },
        { userId: carol.id, side: 1 },
        { userId: bob.id, side: 2 },
        { userId: dave.id, side: 2 },
      ],
      1
    )

    await createAndFinalize(
      [
        { userId: alice.id, side: 1 },
        { userId: carol.id, side: 2 },
        { userId: bob.id, side: 2 },
        { userId: dave.id, side: 1 },
      ],
      2
    )

    const summary = await getHeadToHead(play.id, alice.id, bob.id)
    assert.equal(summary.played, 2)
    assert.equal(summary.winsForViewer, 1)
    assert.equal(summary.winsForOpponent, 1)
  })
})
