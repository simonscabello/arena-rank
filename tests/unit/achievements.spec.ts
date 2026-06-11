import { evaluateAchievementsForUser } from '#helpers/achievements'
import { getLossStreak } from '#helpers/match_streaks'
import { generateInviteCode } from '#helpers/group_access'
import Achievement from '#models/achievement'
import Arena from '#models/arena'
import GameMatch from '#models/game_match'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import MatchPlayer from '#models/match_player'
import User from '#models/user'
import UserAchievement from '#models/user_achievement'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('achievements', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('unlocks level-based achievement when user reaches threshold', async ({ assert }) => {
    const suffix = crypto.randomUUID()
    const user = await User.create({
      email: `ach-${suffix}@test.com`,
      password: 'password123',
      fullName: 'ach',
      level: 5,
      xp: 300,
      elo: 1000,
    })

    const achievement = await Achievement.create({
      slug: `level-5-test-${suffix}`,
      name: 'Nível 5',
      description: 'Alcançou nível 5',
      icon: 'star',
      category: 'progression',
      criteriaType: 'level',
      criteriaValue: { level: 5 },
      sortOrder: 999,
    })

    await db.transaction(async (trx) => {
      await evaluateAchievementsForUser(user.id, trx, { margin: 0, won: true })
    })

    const unlocked = await UserAchievement.query()
      .where('user_id', user.id)
      .where('achievement_id', achievement.id)
      .first()

    assert.isNotNull(unlocked)
  })

  test('unlocks loss streak achievement after consecutive defeats', async ({ assert }) => {
    const suffix = crypto.randomUUID()
    const loser = await User.create({
      email: `loser-${suffix}@test.com`,
      password: 'password123',
      fullName: 'Loser',
      level: 1,
      xp: 0,
      elo: 1000,
    })
    const winner = await User.create({
      email: `winner-${suffix}@test.com`,
      password: 'password123',
      fullName: 'Winner',
      level: 1,
      xp: 0,
      elo: 1000,
    })
    const partner = await User.create({
      email: `partner-${suffix}@test.com`,
      password: 'password123',
      fullName: 'Partner',
      level: 1,
      xp: 0,
      elo: 1000,
    })
    const extra = await User.create({
      email: `extra-${suffix}@test.com`,
      password: 'password123',
      fullName: 'Extra',
      level: 1,
      xp: 0,
      elo: 1000,
    })

    const play = await Group.create({ name: 'Play', inviteCode: generateInviteCode() })
    const arena = await Arena.create({ name: 'Arena' })

    for (const member of [loser, winner, partner, extra]) {
      await GroupMember.create({
        groupId: play.id,
        userId: member.id,
        role: 'membro',
      })
    }

    async function createLossMatch() {
      const match = await GameMatch.create({
        groupId: play.id,
        arenaId: arena.id,
        createdByUserId: winner.id,
        status: 'finalizada',
        winnerSide: 1,
      })

      await MatchPlayer.create({ matchId: match.id, userId: winner.id, side: 1 })
      await MatchPlayer.create({ matchId: match.id, userId: partner.id, side: 1 })
      await MatchPlayer.create({ matchId: match.id, userId: loser.id, side: 2 })
      await MatchPlayer.create({ matchId: match.id, userId: extra.id, side: 2 })

      return match
    }

    await createLossMatch()
    await createLossMatch()
    await createLossMatch()

    const streak = await getLossStreak(loser.id)
    assert.equal(streak, 3)

    const achievement = await Achievement.create({
      slug: `loss-streak-3-${suffix}`,
      name: 'Modo Avião',
      description: 'Três quedas seguidas.',
      icon: '✈️',
      category: 'troll',
      criteriaType: 'loss_streak',
      criteriaValue: { count: 3 },
      sortOrder: 999,
    })

    let unlockedSummary: Awaited<ReturnType<typeof evaluateAchievementsForUser>> = []
    await db.transaction(async (trx) => {
      unlockedSummary = await evaluateAchievementsForUser(loser.id, trx, { margin: 0, won: false })
    })

    assert.lengthOf(unlockedSummary, 1)
    assert.equal(unlockedSummary[0].name, 'Modo Avião')
    assert.equal(unlockedSummary[0].category, 'troll')

    const unlocked = await UserAchievement.query()
      .where('user_id', loser.id)
      .where('achievement_id', achievement.id)
      .first()

    assert.isNotNull(unlocked)
  })
})
