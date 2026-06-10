import { evaluateAchievementsForUser } from '#helpers/achievements'
import Achievement from '#models/achievement'
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
})
