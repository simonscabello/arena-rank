import {
  resolveDisplayFunLabel,
  resolveStreakFunLabel,
  STREAK_STATUS_MIN,
} from '#helpers/streak_fun_label'
import { test } from '@japa/runner'

test.group('streak fun label', () => {
  test('returns On Fire for win streak', ({ assert }) => {
    assert.equal(resolveStreakFunLabel(3, 0), 'On Fire')
    assert.equal(resolveStreakFunLabel(4, 0), 'On Fire')
  })

  test('returns Imbatível for long win streak', ({ assert }) => {
    assert.equal(resolveStreakFunLabel(5, 0), 'Imbatível')
  })

  test('returns loss quote for loss streak', ({ assert }) => {
    assert.equal(resolveStreakFunLabel(0, 3), 'De mal a pior')
    assert.isString(resolveStreakFunLabel(0, 5))
  })

  test('win streak takes priority when both would apply', ({ assert }) => {
    assert.equal(resolveStreakFunLabel(3, 3), 'On Fire')
  })

  test('resolveDisplayFunLabel prefers streak over stored label', ({ assert }) => {
    assert.equal(resolveDisplayFunLabel('Rainha da Rede', 3, 0), 'On Fire')
    assert.equal(resolveDisplayFunLabel('Rainha da Rede', 0, 0), 'Rainha da Rede')
    assert.equal(resolveDisplayFunLabel(null, 0, 3), 'De mal a pior')
  })

  test('does not return streak label below threshold', ({ assert }) => {
    assert.isNull(resolveStreakFunLabel(2, 0))
    assert.isNull(resolveStreakFunLabel(0, 2))
    assert.equal(STREAK_STATUS_MIN, 3)
  })
})
