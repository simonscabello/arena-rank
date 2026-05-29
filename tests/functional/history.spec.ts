import { generateInviteCode } from '#helpers/group_access'
import { getBetHistory, getMatchHistory } from '#helpers/player_history'
import Arena from '#models/arena'
import GameMatch from '#models/game_match'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import MatchPlayer from '#models/match_player'
import User from '#models/user'
import { finalizePayload } from '#tests/helpers/finalize_match'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('History', (suite) => {
  suite.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  async function createUser(email: string, nickname?: string) {
    return User.create({
      email,
      password: 'password123',
      fullName: email.split('@')[0],
      nickname: nickname ?? null,
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

  test('aggregates matches from multiple plays', async ({ client, assert }) => {
    const user = await createUser('player@test.com')
    const partner = await createUser('partner@test.com', 'Parceiro')
    const owner1 = await createUser('owner1@test.com')
    const owner2 = await createUser('owner2@test.com')

    const playA = await Group.create({ name: 'Play A', inviteCode: generateInviteCode() })
    const playB = await Group.create({ name: 'Play B', inviteCode: generateInviteCode() })
    const arenaA = await Arena.create({ name: 'Arena A', city: 'Rio' })
    const arenaB = await Arena.create({ name: 'Arena B', city: 'SP' })

    for (const [play, owner] of [
      [playA, owner1],
      [playB, owner2],
    ] as const) {
      await GroupMember.create({ groupId: play.id, userId: owner.id, role: 'organizador' })
      await GroupMember.create({ groupId: play.id, userId: user.id, role: 'membro' })
      await GroupMember.create({ groupId: play.id, userId: partner.id, role: 'membro' })
    }

    await createFinalizedMatch(
      playA.id,
      owner1.id,
      arenaA,
      [
        { userId: user.id, side: 1 },
        { userId: partner.id, side: 1 },
        { userId: owner1.id, side: 2 },
        { userId: owner2.id, side: 2 },
      ],
      1
    )

    await createFinalizedMatch(
      playB.id,
      owner2.id,
      arenaB,
      [
        { userId: user.id, side: 2 },
        { userId: partner.id, side: 2 },
        { userId: owner1.id, side: 1 },
        { userId: owner2.id, side: 1 },
      ],
      1
    )

    const helperResult = await getMatchHistory(user.id, { tab: 'matches' })
    assert.equal(helperResult.items.length, 2)
    assert.equal(helperResult.summary.matchesPlayed, 2)
    assert.equal(helperResult.summary.wins, 1)
    assert.equal(helperResult.summary.losses, 1)

    const response = await client.get('/historico').loginAs(user)
    response.assertStatus(200)
    response.assertTextIncludes('data-page')
  })

  test('filters matches by group and partner', async ({ assert }) => {
    const user = await createUser('filter@test.com')
    const partnerA = await createUser('pa@test.com', 'Parceiro A')
    const partnerB = await createUser('pb@test.com', 'Parceiro B')
    const owner = await createUser('owner@test.com')
    const extra = await createUser('extra@test.com')

    const play = await Group.create({ name: 'Play Filtro', inviteCode: generateInviteCode() })
    const arena = await Arena.create({ name: 'Arena Filtro' })

    for (const member of [owner, user, partnerA, partnerB, extra]) {
      await GroupMember.create({
        groupId: play.id,
        userId: member.id,
        role: member.id === owner.id ? 'organizador' : 'membro',
      })
    }

    await createFinalizedMatch(
      play.id,
      owner.id,
      arena,
      [
        { userId: user.id, side: 1 },
        { userId: partnerA.id, side: 1 },
        { userId: partnerB.id, side: 2 },
        { userId: extra.id, side: 2 },
      ],
      1
    )

    await createFinalizedMatch(
      play.id,
      owner.id,
      arena,
      [
        { userId: user.id, side: 1 },
        { userId: partnerB.id, side: 1 },
        { userId: partnerA.id, side: 2 },
        { userId: extra.id, side: 2 },
      ],
      1
    )

    const byPartner = await getMatchHistory(user.id, {
      tab: 'matches',
      partnerId: partnerA.id,
    })

    assert.equal(byPartner.items.length, 1)
    assert.equal(byPartner.items[0].partnerName, 'Parceiro A')

    const byGroup = await getMatchHistory(user.id, {
      tab: 'matches',
      groupId: play.id,
    })

    assert.equal(byGroup.items.length, 2)
    assert.equal(byGroup.summary.wins, 2)
  })

  test('lists bets and filters correct predictions', async ({ client, assert }) => {
    const owner = await createUser('owner-bets@test.com')
    const member = await createUser('member-bets@test.com')
    const p1 = await createUser('p1-bets@test.com')
    const p2 = await createUser('p2-bets@test.com')
    const p3 = await createUser('p3-bets@test.com')
    const p4 = await createUser('p4-bets@test.com')

    const groupRecord = await Group.create({ name: 'Play Bets', inviteCode: generateInviteCode() })
    await GroupMember.create({
      groupId: groupRecord.id,
      userId: owner.id,
      role: 'organizador',
    })
    for (const user of [member, p1, p2, p3, p4]) {
      await GroupMember.create({ groupId: groupRecord.id, userId: user.id, role: 'membro' })
    }

    const createResponse = await client
      .post(`/grupos/${groupRecord.id}/partidas`)
      .loginAs(owner)
      .json({
        arenaName: 'Arena Bets',
        players: [
          { userId: p1.id, side: 1 },
          { userId: p2.id, side: 1 },
          { userId: p3.id, side: 2 },
          { userId: p4.id, side: 2 },
        ],
      })

    const matchId = Number(createResponse.redirects().pop()!.split('/').pop())

    await client.post(`/partidas/${matchId}/palpite`).loginAs(member).json({ predictedSide: 1 })
    await client.post(`/partidas/${matchId}/iniciar`).loginAs(owner)
    await client.post(`/partidas/${matchId}/finalizar`).loginAs(owner).json(finalizePayload(1))

    const allBets = await getBetHistory(member.id, { tab: 'bets' })
    assert.equal(allBets.items.length, 1)
    assert.equal(allBets.summary.correctBets, 1)
    assert.equal(allBets.summary.totalPoints, 10)

    const response = await client.get('/historico').qs({ tab: 'bets' }).loginAs(member)
    response.assertStatus(200)
    response.assertTextIncludes('data-page')
  })

  test('renders empty history for user without plays', async ({ client, assert }) => {
    const user = await createUser('lonely@test.com')

    const response = await client.get('/historico').loginAs(user)
    response.assertStatus(200)
    response.assertTextIncludes('data-page')

    const history = await getMatchHistory(user.id, { tab: 'matches' })
    assert.equal(history.items.length, 0)
    assert.equal(history.summary.matchesPlayed, 0)
  })
})
