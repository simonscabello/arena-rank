import { generateInviteCode } from '#helpers/group_access'
import { getPlayerStats } from '#helpers/player_stats'
import Arena from '#models/arena'
import GameMatch from '#models/game_match'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import MatchPlayer from '#models/match_player'
import User from '#models/user'
import { finalizePayload } from '#tests/helpers/finalize_match'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Player stats and profile', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  async function createUser(email: string, nickname?: string) {
    return User.create({
      email,
      password: 'password123',
      fullName: email.split('@')[0],
      nickname: nickname ?? null,
    })
  }

  test('stats count win for player on winning side', async ({ assert }) => {
    const owner = await createUser('owner@test.com')
    const winner1 = await createUser('w1@test.com')
    const winner2 = await createUser('w2@test.com')
    const loser1 = await createUser('l1@test.com')
    const loser2 = await createUser('l2@test.com')

    const groupRecord = await Group.create({ name: 'Play Teste', inviteCode: generateInviteCode() })
    await GroupMember.create({
      groupId: groupRecord.id,
      userId: owner.id,
      role: 'organizador',
    })
    for (const user of [winner1, winner2, loser1, loser2]) {
      await GroupMember.create({ groupId: groupRecord.id, userId: user.id, role: 'membro' })
    }

    const arena = await Arena.create({ name: 'Arena Teste' })

    const match = await GameMatch.create({
      groupId: groupRecord.id,
      arenaId: arena.id,
      createdByUserId: owner.id,
      status: 'finalizada',
      winnerSide: 1,
    })

    for (const [userId, side] of [
      [winner1.id, 1],
      [winner2.id, 1],
      [loser1.id, 2],
      [loser2.id, 2],
    ] as const) {
      await MatchPlayer.create({ matchId: match.id, userId, side })
    }

    const winnerStats = await getPlayerStats(groupRecord.id, winner1.id)
    const loserStats = await getPlayerStats(groupRecord.id, loser1.id)

    assert.equal(winnerStats.wins, 1)
    assert.equal(winnerStats.losses, 0)
    assert.equal(loserStats.wins, 0)
    assert.equal(loserStats.losses, 1)
  })

  test('profile update persists nickname and fun label', async ({ client, assert }) => {
    const user = await createUser('profile@test.com')

    const response = await client.post('/perfil').loginAs(user).form({
      nickname: 'BeachKing',
      funLabel: 'Mestre do Lob',
      dominantHand: 'direita',
      courtSide: 'esquerda',
      skillLevel: 'intermediario',
    })

    response.assertRedirectsTo('/perfil')

    await user.refresh()
    assert.equal(user.nickname, 'BeachKing')
    assert.equal(user.funLabel, 'Mestre do Lob')
    assert.equal(user.dominantHand, 'direita')
    assert.equal(user.courtSide, 'esquerda')
    assert.equal(user.skillLevel, 'intermediario')
    assert.equal(user.initials, 'BE')
  })

  test('finalize match updates stats via http flow', async ({ client, assert }) => {
    const owner = await createUser('owner2@test.com')
    const p1 = await createUser('p1@test.com')
    const p2 = await createUser('p2@test.com')
    const p3 = await createUser('p3@test.com')
    const p4 = await createUser('p4@test.com')

    const groupRecord = await Group.create({ name: 'Stats', inviteCode: generateInviteCode() })
    await GroupMember.create({
      groupId: groupRecord.id,
      userId: owner.id,
      role: 'organizador',
    })
    for (const user of [p1, p2, p3, p4]) {
      await GroupMember.create({ groupId: groupRecord.id, userId: user.id, role: 'membro' })
    }

    const createResponse = await client
      .post(`/grupos/${groupRecord.id}/partidas`)
      .loginAs(owner)
      .json({
        arenaName: 'Arena Stats',
        players: [
          { userId: p1.id, side: 1 },
          { userId: p2.id, side: 1 },
          { userId: p3.id, side: 2 },
          { userId: p4.id, side: 2 },
        ],
      })

    const matchUrl = createResponse.redirects().pop()!
    const matchId = Number(matchUrl.split('/').pop())

    await client.post(`/partidas/${matchId}/finalizar`).loginAs(owner).json(finalizePayload(1))

    const playerStats = await getPlayerStats(groupRecord.id, p1.id)

    assert.equal(playerStats.wins, 1)
    assert.equal(playerStats.matchesPlayed, 1)
  })
})
