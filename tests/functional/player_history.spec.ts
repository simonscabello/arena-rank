import { generateInviteCode } from '#helpers/group_access'
import { getMatchHistory } from '#helpers/player_history'
import { getSharedGroupIds, usersShareGroup } from '#helpers/player_history_access'
import Arena from '#models/arena'
import GameMatch from '#models/game_match'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import MatchPlayer from '#models/match_player'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Player history', (suite) => {
  suite.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  async function createUser(email: string) {
    return User.create({
      email,
      password: 'password123',
      fullName: email.split('@')[0],
    })
  }

  async function createFinalizedMatch(
    groupId: number,
    ownerId: number,
    arena: Arena,
    players: { userId: number; side: number }[],
    winnerSide: number
  ) {
    const match = await GameMatch.create({
      groupId,
      arenaId: arena.id,
      createdByUserId: ownerId,
      status: 'finalizada',
      winnerSide,
    })

    for (const player of players) {
      await MatchPlayer.create({
        matchId: match.id,
        userId: player.userId,
        side: player.side,
      })
    }

    return match
  }

  test('denies access without shared play', async ({ client, assert }) => {
    const viewer = await createUser('viewer@test.com')
    const stranger = await createUser('stranger@test.com')

    const response = await client.get(`/jogadores/${stranger.id}/historico`).loginAs(viewer)
    response.assertStatus(403)

    const shares = await usersShareGroup(viewer.id, stranger.id)
    assert.isFalse(shares)
  })

  test('redirects to own history when viewing self', async ({ client }) => {
    const user = await createUser('self@test.com')

    const response = await client
      .get(`/jogadores/${user.id}/historico`)
      .qs({ groupId: 1 })
      .loginAs(user)
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/historico?groupId=1')
  })

  test('lists matches from shared plays only', async ({ client, assert }) => {
    const viewer = await createUser('viewer2@test.com')
    const target = await createUser('target@test.com')
    const ownerShared = await createUser('owner-shared@test.com')
    const ownerOther = await createUser('owner-other@test.com')
    const extra = await createUser('extra@test.com')
    const outsider = await createUser('outsider@test.com')

    const sharedPlay = await Group.create({
      name: 'Play Compartilhada',
      inviteCode: generateInviteCode(),
    })
    const otherPlay = await Group.create({
      name: 'Play Privada',
      inviteCode: generateInviteCode(),
    })
    const arenaShared = await Arena.create({ name: 'Arena Compartilhada' })
    const arenaOther = await Arena.create({ name: 'Arena Privada' })

    for (const [play, members] of [
      [sharedPlay, [ownerShared, viewer, target, extra]],
      [otherPlay, [ownerOther, target, extra, outsider]],
    ] as const) {
      for (const member of members) {
        await GroupMember.create({
          groupId: play.id,
          userId: member.id,
          role: member.id === members[0].id ? 'organizador' : 'membro',
        })
      }
    }

    await createFinalizedMatch(
      sharedPlay.id,
      ownerShared.id,
      arenaShared,
      [
        { userId: target.id, side: 1 },
        { userId: viewer.id, side: 1 },
        { userId: ownerShared.id, side: 2 },
        { userId: extra.id, side: 2 },
      ],
      1
    )

    await createFinalizedMatch(
      otherPlay.id,
      ownerOther.id,
      arenaOther,
      [
        { userId: target.id, side: 1 },
        { userId: extra.id, side: 1 },
        { userId: ownerOther.id, side: 2 },
        { userId: outsider.id, side: 2 },
      ],
      1
    )

    const sharedGroupIds = await getSharedGroupIds(viewer.id, target.id)
    assert.deepEqual(sharedGroupIds, [sharedPlay.id])

    const helperResult = await getMatchHistory(target.id, {}, sharedGroupIds)
    assert.equal(helperResult.items.length, 1)
    assert.equal(helperResult.items[0].groupName, 'Play Compartilhada')

    const response = await client.get(`/jogadores/${target.id}/historico`).loginAs(viewer)
    response.assertStatus(200)
    response.assertTextIncludes('data-page')
    response.assertTextIncludes('Play Compartilhada')
    response.assertTextIncludes('Arena Compartilhada')
  })
})
