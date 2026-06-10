import { generateInviteCode } from '#helpers/group_access'
import { getGroupRanking, getRankContext } from '#helpers/ranking'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Ranking', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  async function createUser(email: string, elo: number) {
    return User.create({
      email,
      password: 'password123',
      fullName: email.split('@')[0],
      elo,
      level: 1,
      xp: 0,
    })
  }

  test('orders members by global elo', async ({ assert }) => {
    const low = await createUser('low@test.com', 980)
    const high = await createUser('high@test.com', 1120)

    const groupRecord = await Group.create({ name: 'Play', inviteCode: generateInviteCode() })
    await GroupMember.create({ groupId: groupRecord.id, userId: low.id, role: 'membro' })
    await GroupMember.create({ groupId: groupRecord.id, userId: high.id, role: 'membro' })

    const ranking = await getGroupRanking(groupRecord.id)

    assert.equal(ranking[0].userId, high.id)
    assert.equal(ranking[1].userId, low.id)
    assert.equal(ranking[0].elo, 1120)
  })

  test('rank context for leader and chaser', async ({ assert }) => {
    const leader = await createUser('leader@test.com', 1200)
    const chaser = await createUser('chaser@test.com', 1100)

    const groupRecord = await Group.create({ name: 'Play', inviteCode: generateInviteCode() })
    await GroupMember.create({ groupId: groupRecord.id, userId: leader.id, role: 'membro' })
    await GroupMember.create({ groupId: groupRecord.id, userId: chaser.id, role: 'membro' })

    const ranking = await getGroupRanking(groupRecord.id)
    const leaderContext = getRankContext(ranking, leader.id)
    const chaserContext = getRankContext(ranking, chaser.id)

    assert.equal(leaderContext.position, 1)
    assert.isNull(leaderContext.eloToNext)
    assert.equal(chaserContext.eloToNext, 100)
    assert.equal(chaserContext.nextRankPosition, 1)
  })
})
