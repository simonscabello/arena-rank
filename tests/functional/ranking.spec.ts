import { generateInviteCode } from '#helpers/group_access'
import { getBetParticipation, getGroupRanking, getRankContext } from '#helpers/ranking'
import Arena from '#models/arena'
import Bet from '#models/bet'
import GameMatch from '#models/game_match'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import MatchPlayer from '#models/match_player'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Ranking', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  async function createUser(email: string) {
    return User.create({
      email,
      password: 'password123',
      fullName: email.split('@')[0],
    })
  }

  async function createFinalizedMatchWithBet(
    groupId: number,
    ownerId: number,
    bettorId: number,
    arena: Arena,
    correct: boolean
  ) {
    const match = await GameMatch.create({
      groupId,
      arenaId: arena.id,
      createdByUserId: ownerId,
      status: 'finalizada',
      winnerSide: correct ? 1 : 2,
    })

    for (const [userId, side] of [
      [ownerId, 1],
      [bettorId, 2],
    ] as const) {
      await MatchPlayer.create({ matchId: match.id, userId, side })
    }

    await Bet.create({
      matchId: match.id,
      userId: bettorId,
      predictedSide: correct ? 1 : 2,
      pointsAwarded: correct ? 10 : 0,
    })

    return match
  }

  test('includes members with zero bets', async ({ assert }) => {
    const owner = await createUser('owner@test.com')
    const member = await createUser('member@test.com')

    const groupRecord = await Group.create({ name: 'Play', inviteCode: generateInviteCode() })
    await GroupMember.create({ groupId: groupRecord.id, userId: owner.id, role: 'organizador' })
    await GroupMember.create({ groupId: groupRecord.id, userId: member.id, role: 'membro' })

    const ranking = await getGroupRanking(groupRecord.id)

    assert.equal(ranking.length, 2)
    assert.equal(ranking.find((entry) => entry.userId === member.id)?.betsPlaced, 0)
    assert.equal(ranking.find((entry) => entry.userId === member.id)?.accuracyPercent, null)
  })

  test('breaks ties by correct bets count', async ({ assert }) => {
    const owner = await createUser('owner@test.com')
    const bettorA = await createUser('a@test.com')
    const bettorB = await createUser('b@test.com')
    const arena = await Arena.create({ name: 'Arena' })

    const groupRecord = await Group.create({ name: 'Play', inviteCode: generateInviteCode() })
    for (const user of [owner, bettorA, bettorB]) {
      await GroupMember.create({
        groupId: groupRecord.id,
        userId: user.id,
        role: user.id === owner.id ? 'organizador' : 'membro',
      })
    }

    await createFinalizedMatchWithBet(groupRecord.id, owner.id, bettorA.id, arena, true)
    await createFinalizedMatchWithBet(groupRecord.id, owner.id, bettorA.id, arena, true)
    await createFinalizedMatchWithBet(groupRecord.id, owner.id, bettorA.id, arena, false)
    await createFinalizedMatchWithBet(groupRecord.id, owner.id, bettorB.id, arena, true)
    await createFinalizedMatchWithBet(groupRecord.id, owner.id, bettorB.id, arena, true)

    const ranking = await getGroupRanking(groupRecord.id)
    const entryA = ranking.find((entry) => entry.userId === bettorA.id)!
    const entryB = ranking.find((entry) => entry.userId === bettorB.id)!

    assert.equal(entryA.totalPoints, entryB.totalPoints)
    assert.equal(entryA.betsCorrect, entryB.betsCorrect)
    assert.isBelow(ranking.indexOf(entryB), ranking.indexOf(entryA))
  })

  test('resets streak after a wrong bet', async ({ assert }) => {
    const owner = await createUser('owner@test.com')
    const bettor = await createUser('bettor@test.com')
    const arena = await Arena.create({ name: 'Arena' })

    const groupRecord = await Group.create({ name: 'Play', inviteCode: generateInviteCode() })
    await GroupMember.create({ groupId: groupRecord.id, userId: owner.id, role: 'organizador' })
    await GroupMember.create({ groupId: groupRecord.id, userId: bettor.id, role: 'membro' })

    await createFinalizedMatchWithBet(groupRecord.id, owner.id, bettor.id, arena, true)
    await createFinalizedMatchWithBet(groupRecord.id, owner.id, bettor.id, arena, true)

    const wrongMatch = await GameMatch.create({
      groupId: groupRecord.id,
      arenaId: arena.id,
      createdByUserId: owner.id,
      status: 'finalizada',
      winnerSide: 1,
    })
    await MatchPlayer.create({ matchId: wrongMatch.id, userId: owner.id, side: 1 })
    await MatchPlayer.create({ matchId: wrongMatch.id, userId: bettor.id, side: 2 })
    await Bet.create({
      matchId: wrongMatch.id,
      userId: bettor.id,
      predictedSide: 2,
      pointsAwarded: 0,
    })

    const ranking = await getGroupRanking(groupRecord.id)
    const entry = ranking.find((item) => item.userId === bettor.id)!

    assert.equal(entry.currentStreak, 0)
  })

  test('bet participation excludes players', async ({ assert }) => {
    const owner = await createUser('owner@test.com')
    const member = await createUser('member@test.com')
    const p1 = await createUser('p1@test.com')
    const p2 = await createUser('p2@test.com')

    const groupRecord = await Group.create({ name: 'Play', inviteCode: generateInviteCode() })
    for (const user of [owner, member, p1, p2]) {
      await GroupMember.create({ groupId: groupRecord.id, userId: user.id, role: 'membro' })
    }

    const arena = await Arena.create({ name: 'Arena' })
    const match = await GameMatch.create({
      groupId: groupRecord.id,
      arenaId: arena.id,
      createdByUserId: owner.id,
      status: 'palpites_abertos',
    })

    for (const [userId, side] of [
      [owner.id, 1],
      [p1.id, 1],
      [p2.id, 2],
      [member.id, 2],
    ] as const) {
      await MatchPlayer.create({ matchId: match.id, userId, side })
    }

    const participation = await getBetParticipation(match.id, groupRecord.id, [
      owner.id,
      p1.id,
      p2.id,
      member.id,
    ])

    assert.equal(participation.eligibleCount, 0)
    assert.equal(participation.pendingMembers.length, 0)
  })

  test('rank context for leader and chaser', async ({ assert }) => {
    const owner = await createUser('owner@test.com')
    const leader = await createUser('leader@test.com')
    const chaser = await createUser('chaser@test.com')
    const arena = await Arena.create({ name: 'Arena' })

    const groupRecord = await Group.create({ name: 'Play', inviteCode: generateInviteCode() })
    for (const user of [owner, leader, chaser]) {
      await GroupMember.create({ groupId: groupRecord.id, userId: user.id, role: 'membro' })
    }

    await createFinalizedMatchWithBet(groupRecord.id, owner.id, leader.id, arena, true)
    await createFinalizedMatchWithBet(groupRecord.id, owner.id, leader.id, arena, true)
    await createFinalizedMatchWithBet(groupRecord.id, owner.id, chaser.id, arena, true)

    const ranking = await getGroupRanking(groupRecord.id)
    const leaderContext = getRankContext(ranking, leader.id)
    const chaserContext = getRankContext(ranking, chaser.id)

    assert.equal(leaderContext.position, 1)
    assert.isNull(leaderContext.pointsToNext)
    assert.equal(chaserContext.pointsToNext, 10)
    assert.equal(chaserContext.nextRankPosition, 1)
  })
})
