import { formatAchievementCriteriaLabel, getAchievementTarget } from '#helpers/achievement_progress'
import { test } from '@japa/runner'

test.group('achievement progress', () => {
  test('formatAchievementCriteriaLabel for match count', ({ assert }) => {
    assert.equal(formatAchievementCriteriaLabel('match_count', { count: 5 }), 'Jogue 5 partidas')
    assert.equal(formatAchievementCriteriaLabel('match_count', { count: 1 }), 'Jogue 1 partida')
  })

  test('formatAchievementCriteriaLabel for win streak', ({ assert }) => {
    assert.equal(
      formatAchievementCriteriaLabel('win_streak', { count: 3 }),
      'Ganhe 3 partidas seguidas'
    )
  })

  test('formatAchievementCriteriaLabel for loss streak', ({ assert }) => {
    assert.equal(
      formatAchievementCriteriaLabel('loss_streak', { count: 3 }),
      'Perdeu 3 partidas seguidas'
    )
    assert.equal(
      formatAchievementCriteriaLabel('loss_streak', { count: 1 }),
      'Perdeu 1 partida seguida'
    )
  })

  test('formatAchievementCriteriaLabel for recent form', ({ assert }) => {
    assert.equal(
      formatAchievementCriteriaLabel('recent_form', { window: 5, minLosses: 4 }),
      'Jogou 5, perdeu 4'
    )
  })

  test('formatAchievementCriteriaLabel for elo tier', ({ assert }) => {
    assert.equal(
      formatAchievementCriteriaLabel('elo_tier', { tier: 'ouro' }),
      'Alcance o tier Ouro'
    )
  })

  test('getAchievementTarget returns expected values', ({ assert }) => {
    assert.equal(getAchievementTarget('match_count', { count: 10 }), 10)
    assert.equal(getAchievementTarget('shutout_win', {}), 1)
    assert.equal(getAchievementTarget('level', { level: 5 }), 5)
    assert.equal(getAchievementTarget('loss_streak', { count: 5 }), 5)
    assert.equal(getAchievementTarget('recent_form', { window: 5, minLosses: 4 }), 4)
  })
})
