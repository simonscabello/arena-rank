import { generateInviteCode } from '#helpers/group_access'
import { getMatchHistory } from '#helpers/player_history'
import MatchReward from '#models/match_reward'
import GameMatch from '#models/game_match'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import User from '#models/user'
import { finalizePayload } from '#tests/helpers/finalize_match'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Match flow', (suite) => {
  suite.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  async function createUser(email: string) {
    return User.create({
      email,
      password: 'password123',
      fullName: email.split('@')[0],
    })
  }

  async function createGroupWithMembers() {
    const owner = await createUser('owner@test.com')
    const member = await createUser('member@test.com')
    const player1 = await createUser('p1@test.com')
    const player2 = await createUser('p2@test.com')
    const player3 = await createUser('p3@test.com')
    const player4 = await createUser('p4@test.com')

    const groupRecord = await Group.create({ name: 'Play Teste', inviteCode: generateInviteCode() })
    await GroupMember.create({
      groupId: groupRecord.id,
      userId: owner.id,
      role: 'organizador',
    })
    for (const user of [member, player1, player2, player3, player4]) {
      await GroupMember.create({ groupId: groupRecord.id, userId: user.id, role: 'membro' })
    }

    return { owner, member, player1, player2, player3, player4, group: groupRecord }
  }

  async function createMatchViaHttp(
    client: any,
    owner: User,
    groupId: number,
    players: { userId: number; side: number }[]
  ) {
    const response = await client
      .post(`/grupos/${groupId}/partidas`)
      .loginAs(owner)
      .json({ arenaName: 'Arena Teste', players })

    const redirects = response.redirects()
    const matchUrl = redirects[redirects.length - 1]
    return Number(matchUrl.split('/').pop())
  }

  async function expireManageWindow(matchId: number) {
    const match = await GameMatch.findOrFail(matchId)
    match.statusChangedAt = DateTime.now().minus({ minutes: 3 })
    await match.save()
  }

  test('member creates match in em_andamento', async ({ client, assert }) => {
    const { owner, player1, player2, player3, player4, group } = await createGroupWithMembers()

    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'em_andamento')
    assert.equal(match.groupId, group.id)
  })

  test('regular member can create and finalize own match', async ({ client, assert }) => {
    const { owner, member, player1, player2, player3, player4, group } =
      await createGroupWithMembers()

    const matchId = await createMatchViaHttp(client, member, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.createdByUserId, member.id)

    const ownerFinalize = await client
      .post(`/partidas/${matchId}/finalizar`)
      .loginAs(owner)
      .json(finalizePayload(1))
    ownerFinalize.assertStatus(403)

    await client.post(`/partidas/${matchId}/finalizar`).loginAs(member).json(finalizePayload(1))
    await match.refresh()
    assert.equal(match.status, 'finalizada')
  })

  test('finalize awards xp and elo to players', async ({ client, assert }) => {
    const { owner, player1, player2, player3, player4, group } = await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await client.post(`/partidas/${matchId}/finalizar`).loginAs(owner).json(finalizePayload(1))

    const rewards = await MatchReward.query().where('match_id', matchId)
    assert.lengthOf(rewards, 4)

    const winner = await User.findOrFail(player1.id)
    const loser = await User.findOrFail(player3.id)
    assert.isAbove(winner.xp, 0)
    assert.isAbove(loser.xp, 0)
    assert.isAbove(winner.elo, 1000)
    assert.isBelow(loser.elo, 1000)
  })

  test('finalize with sets persists score', async ({ client, assert }) => {
    const { owner, player1, player2, player3, player4, group } = await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await client
      .post(`/partidas/${matchId}/finalizar`)
      .loginAs(owner)
      .json({
        sets: [
          { side1: 6, side2: 4 },
          { side1: 6, side2: 3 },
        ],
      })

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'finalizada')
    assert.equal(match.winnerSide, 1)
    assert.deepEqual(match.score, {
      sets: [
        { side1: 6, side2: 4 },
        { side1: 6, side2: 3 },
      ],
    })
  })

  test('finalize rejects tied sets', async ({ client, assert }) => {
    const { owner, player1, player2, player3, player4, group } = await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await client
      .post(`/partidas/${matchId}/finalizar`)
      .loginAs(owner)
      .json({
        sets: [
          { side1: 6, side2: 4 },
          { side1: 4, side2: 6 },
        ],
      })

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'em_andamento')
    assert.isNull(match.winnerSide)
    assert.isNull(match.score)
  })

  test('creator can undo finalize and revert progression', async ({ client, assert }) => {
    const { owner, player1, player2, player3, player4, group } = await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    const playerBefore = await User.findOrFail(player1.id)
    const xpBefore = playerBefore.xp
    const eloBefore = playerBefore.elo

    await client.post(`/partidas/${matchId}/finalizar`).loginAs(owner).json(finalizePayload(1))
    await client.post(`/partidas/${matchId}/desfazer-resultado`).loginAs(owner)

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'em_andamento')
    assert.isNull(match.winnerSide)
    assert.isNull(match.score)

    const rewards = await MatchReward.query().where('match_id', matchId)
    assert.lengthOf(rewards, 0)

    const playerAfter = await User.findOrFail(player1.id)
    assert.equal(playerAfter.xp, xpBefore)
    assert.equal(playerAfter.elo, eloBefore)
  })

  test('cancelled finalized match is removed from history', async ({ client, assert }) => {
    const { owner, player1, player2, player3, player4, group } = await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await client.post(`/partidas/${matchId}/finalizar`).loginAs(owner).json(finalizePayload(1))
    await client.post(`/partidas/${matchId}/cancelar`).loginAs(owner)

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'cancelada')

    const matchHistory = await getMatchHistory(player1.id, {})
    assert.isFalse(matchHistory.items.some((entry) => entry.matchId === matchId))
  })

  test('non-creator cannot undo or cancel match', async ({ client }) => {
    const { owner, member, player1, player2, player3, player4, group } =
      await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await client.post(`/partidas/${matchId}/finalizar`).loginAs(owner).json(finalizePayload(1))

    const undo = await client.post(`/partidas/${matchId}/desfazer-resultado`).loginAs(member)
    undo.assertStatus(403)

    const cancel = await client.post(`/partidas/${matchId}/cancelar`).loginAs(member)
    cancel.assertStatus(403)
  })

  test('manage window blocks undo after expiry', async ({ client, assert }) => {
    const { owner, player1, player2, player3, player4, group } = await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await client.post(`/partidas/${matchId}/finalizar`).loginAs(owner).json(finalizePayload(1))
    await expireManageWindow(matchId)

    await client.post(`/partidas/${matchId}/desfazer-resultado`).loginAs(owner)

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'finalizada')
  })
})
