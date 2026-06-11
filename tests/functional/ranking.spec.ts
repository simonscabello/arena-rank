import { generateInviteCode } from '#helpers/group_access'
import { getGroupRanking, getRankContext } from '#helpers/ranking'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import User from '#models/user'
import { inertiaPropsFromHtml } from '#tests/helpers/inertia_page'
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

  test('includes historyPath for self and shared play members', async ({ client, assert }) => {
    const viewer = await createUser('viewer-rank@test.com', 1050)
    const shared = await createUser('shared-rank@test.com', 1100)
    const stranger = await createUser('stranger-rank@test.com', 1150)

    const play = await Group.create({ name: 'Play Ranking', inviteCode: generateInviteCode() })
    await GroupMember.create({ groupId: play.id, userId: viewer.id, role: 'membro' })
    await GroupMember.create({ groupId: play.id, userId: shared.id, role: 'membro' })

    const response = await client.get('/ranking').loginAs(viewer)
    response.assertStatus(200)

    const props = inertiaPropsFromHtml<{
      ranking: { userId: number; historyPath: string | null }[]
    }>(response.text())

    const selfEntry = props.ranking.find((entry) => entry.userId === viewer.id)
    const sharedEntry = props.ranking.find((entry) => entry.userId === shared.id)
    const strangerEntry = props.ranking.find((entry) => entry.userId === stranger.id)

    assert.equal(selfEntry?.historyPath, '/historico')
    assert.equal(sharedEntry?.historyPath, `/jogadores/${shared.id}/historico`)
    assert.isNull(strangerEntry?.historyPath)
  })
})
