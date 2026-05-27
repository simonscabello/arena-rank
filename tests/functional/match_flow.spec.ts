import { generateInviteCode } from '#helpers/group_access'
import { canHaveBets } from '#helpers/match_bets'
import { getBetHistory, getMatchHistory } from '#helpers/player_history'
import Bet from '#models/bet'
import GameMatch from '#models/game_match'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Match flow', (suite) => {
  suite.each.setup(() => testUtils.db().truncate())

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

  async function refreshManageWindow(matchId: number) {
    const match = await GameMatch.findOrFail(matchId)
    match.statusChangedAt = DateTime.now()
    await match.save()
  }

  test('member creates match', async ({ client, assert }) => {
    const { owner, player1, player2, player3, player4, group } = await createGroupWithMembers()

    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'palpites_abertos')
    assert.equal(match.groupId, group.id)
  })

  test('regular member can create and manage own match', async ({ client, assert }) => {
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

    const ownerStart = await client.post(`/partidas/${matchId}/iniciar`).loginAs(owner)
    ownerStart.assertStatus(403)

    await client.post(`/partidas/${matchId}/iniciar`).loginAs(member)
    await match.refresh()
    assert.equal(match.status, 'em_andamento')

    const ownerFinalize = await client
      .post(`/partidas/${matchId}/finalizar`)
      .loginAs(owner)
      .json({ winnerSide: 1 })
    ownerFinalize.assertStatus(403)

    await client.post(`/partidas/${matchId}/finalizar`).loginAs(member).json({ winnerSide: 1 })
    await match.refresh()
    assert.equal(match.status, 'finalizada')
  })

  test('non-member cannot create match', async ({ client }) => {
    const { player1, player2, player3, player4, group } = await createGroupWithMembers()
    const outsider = await createUser('outsider@test.com')

    const response = await client
      .post(`/grupos/${group.id}/partidas`)
      .loginAs(outsider)
      .json({
        arenaName: 'Arena',
        players: [
          { userId: player1.id, side: 1 },
          { userId: player2.id, side: 1 },
          { userId: player3.id, side: 2 },
          { userId: player4.id, side: 2 },
        ],
      })

    response.assertStatus(403)
  })

  test('player cannot bet on own match', async ({ client }) => {
    const { owner, player1, player2, player3, player4, group } = await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    const response = await client
      .post(`/partidas/${matchId}/palpite`)
      .loginAs(player1)
      .json({ predictedSide: 1 })

    response.assertStatus(403)
  })

  test('duplicate bet is rejected', async ({ client, assert }) => {
    const { owner, member, player1, player2, player3, player4, group } =
      await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await client.post(`/partidas/${matchId}/palpite`).loginAs(member).json({ predictedSide: 1 })
    await client.post(`/partidas/${matchId}/palpite`).loginAs(member).json({ predictedSide: 2 })

    const bets = await Bet.query().where('match_id', matchId).where('user_id', member.id)
    assert.lengthOf(bets, 1)
  })

  test('four players only can register match without bets', async ({ client, assert }) => {
    const owner = await createUser('quadra@test.com')
    const p1 = await createUser('q1@test.com')
    const p2 = await createUser('q2@test.com')
    const p3 = await createUser('q3@test.com')

    const groupRecord = await Group.create({ name: 'Quadra', inviteCode: generateInviteCode() })
    await GroupMember.create({
      groupId: groupRecord.id,
      userId: owner.id,
      role: 'organizador',
    })
    for (const user of [p1, p2, p3]) {
      await GroupMember.create({ groupId: groupRecord.id, userId: user.id, role: 'membro' })
    }

    const players = [owner.id, p1.id, p2.id, p3.id]
    assert.isFalse(await canHaveBets(groupRecord.id, players))

    const createResponse = await client
      .post(`/grupos/${groupRecord.id}/partidas`)
      .loginAs(owner)
      .json({
        arenaName: 'Arena Quadra',
        players: [
          { userId: owner.id, side: 1 },
          { userId: p1.id, side: 1 },
          { userId: p2.id, side: 2 },
          { userId: p3.id, side: 2 },
        ],
      })

    const matchUrl = createResponse.redirects().pop()!
    const matchId = Number(matchUrl.split('/').pop())
    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'em_andamento')

    await client.post(`/partidas/${matchId}/finalizar`).loginAs(owner).json({ winnerSide: 1 })

    await match.refresh()
    assert.equal(match.status, 'finalizada')
    assert.equal(match.winnerSide, 1)

    const bets = await Bet.query().where('match_id', matchId)
    assert.lengthOf(bets, 0)
  })

  test('finalize awards correct points', async ({ client, assert }) => {
    const { owner, member, player1, player2, player3, player4, group } =
      await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await client.post(`/partidas/${matchId}/palpite`).loginAs(member).json({ predictedSide: 1 })
    await client.post(`/partidas/${matchId}/iniciar`).loginAs(owner)
    await client.post(`/partidas/${matchId}/finalizar`).loginAs(owner).json({ winnerSide: 1 })

    const bet = await Bet.query()
      .where('match_id', matchId)
      .where('user_id', member.id)
      .firstOrFail()
    assert.equal(bet.pointsAwarded, 10)

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'finalizada')
    assert.equal(match.winnerSide, 1)
  })

  test('creator can reopen bets after starting match', async ({ client, assert }) => {
    const { owner, member, player1, player2, player3, player4, group } =
      await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await client.post(`/partidas/${matchId}/iniciar`).loginAs(owner)

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'em_andamento')

    await client.post(`/partidas/${matchId}/reabrir-palpites`).loginAs(owner)
    await match.refresh()
    assert.equal(match.status, 'palpites_abertos')

    await client.post(`/partidas/${matchId}/palpite`).loginAs(member).json({ predictedSide: 2 })

    const bet = await Bet.query()
      .where('match_id', matchId)
      .where('user_id', member.id)
      .firstOrFail()
    assert.equal(bet.predictedSide, 2)
  })

  test('creator can undo finalize and clear awarded points', async ({ client, assert }) => {
    const { owner, member, player1, player2, player3, player4, group } =
      await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await client.post(`/partidas/${matchId}/palpite`).loginAs(member).json({ predictedSide: 1 })
    await client.post(`/partidas/${matchId}/iniciar`).loginAs(owner)
    await client.post(`/partidas/${matchId}/finalizar`).loginAs(owner).json({ winnerSide: 1 })

    await client.post(`/partidas/${matchId}/desfazer-resultado`).loginAs(owner)

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'em_andamento')
    assert.isNull(match.winnerSide)

    const bet = await Bet.query()
      .where('match_id', matchId)
      .where('user_id', member.id)
      .firstOrFail()
    assert.isNull(bet.pointsAwarded)
  })

  test('cancelled open match disappears from active play list', async ({ client, assert }) => {
    const { owner, player1, player2, player3, player4, group } = await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await client.post(`/partidas/${matchId}/cancelar`).loginAs(owner)

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'cancelada')

    const activeMatches = await GameMatch.query()
      .where('group_id', group.id)
      .whereIn('status', ['palpites_abertos', 'em_andamento'])

    assert.lengthOf(activeMatches, 0)
  })

  test('cancelled finalized match is removed from history and clears points', async ({
    client,
    assert,
  }) => {
    const { owner, member, player1, player2, player3, player4, group } =
      await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await client.post(`/partidas/${matchId}/palpite`).loginAs(member).json({ predictedSide: 1 })
    await client.post(`/partidas/${matchId}/iniciar`).loginAs(owner)
    await client.post(`/partidas/${matchId}/finalizar`).loginAs(owner).json({ winnerSide: 1 })

    await client.post(`/partidas/${matchId}/cancelar`).loginAs(owner)

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'cancelada')
    assert.isNull(match.winnerSide)

    const bet = await Bet.query()
      .where('match_id', matchId)
      .where('user_id', member.id)
      .firstOrFail()
    assert.isNull(bet.pointsAwarded)

    const betHistory = await getBetHistory(member.id, { tab: 'bets' })
    assert.isFalse(betHistory.items.some((entry) => entry.matchId === matchId))

    const matchHistory = await getMatchHistory(player1.id, { tab: 'matches' })
    assert.isFalse(matchHistory.items.some((entry) => entry.matchId === matchId))
  })

  test('non-creator cannot reopen undo or cancel match', async ({ client }) => {
    const { owner, member, player1, player2, player3, player4, group } =
      await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await client.post(`/partidas/${matchId}/iniciar`).loginAs(owner)

    const reopen = await client.post(`/partidas/${matchId}/reabrir-palpites`).loginAs(member)
    reopen.assertStatus(403)

    await client.post(`/partidas/${matchId}/finalizar`).loginAs(owner).json({ winnerSide: 1 })

    const undo = await client.post(`/partidas/${matchId}/desfazer-resultado`).loginAs(member)
    undo.assertStatus(403)

    const cancel = await client.post(`/partidas/${matchId}/cancelar`).loginAs(member)
    cancel.assertStatus(403)
  })

  test('manage actions are rejected after window expires', async ({ client, assert }) => {
    const { owner, player1, player2, player3, player4, group } = await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await expireManageWindow(matchId)

    await client.post(`/partidas/${matchId}/iniciar`).loginAs(owner)

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'palpites_abertos')
  })

  test('manage window resets after status change', async ({ client, assert }) => {
    const { owner, player1, player2, player3, player4, group } = await createGroupWithMembers()
    const matchId = await createMatchViaHttp(client, owner, group.id, [
      { userId: player1.id, side: 1 },
      { userId: player2.id, side: 1 },
      { userId: player3.id, side: 2 },
      { userId: player4.id, side: 2 },
    ])

    await client.post(`/partidas/${matchId}/iniciar`).loginAs(owner)

    await expireManageWindow(matchId)

    await client.post(`/partidas/${matchId}/reabrir-palpites`).loginAs(owner)

    let match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'em_andamento')

    await refreshManageWindow(matchId)

    await client.post(`/partidas/${matchId}/reabrir-palpites`).loginAs(owner)

    match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'palpites_abertos')
  })
})
