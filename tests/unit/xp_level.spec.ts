import { calculateEloDelta, calculateExpectedScore } from '#helpers/elo'
import { calculateLossXp, calculateWinXp, levelFromXp, xpForLevel } from '#helpers/level'
import { getMatchMargin } from '#helpers/match_score'
import { test } from '@japa/runner'

test.group('elo', () => {
  test('favorite win yields smaller gain than upset', ({ assert }) => {
    const favoriteWin = calculateEloDelta(1200, 1000, true, 0.5)
    const upsetWin = calculateEloDelta(1000, 1200, true, 0.5)
    assert.isBelow(favoriteWin, upsetWin)
  })

  test('dominant win moves more points than close win', ({ assert }) => {
    const dominant = calculateEloDelta(1000, 1000, true, 1)
    const close = calculateEloDelta(1000, 1000, true, 0.2)
    assert.isAbove(dominant, close)
  })

  test('expected score favors higher rated team', ({ assert }) => {
    assert.isAbove(calculateExpectedScore(1200, 1000), 0.5)
    assert.isBelow(calculateExpectedScore(1000, 1200), 0.5)
  })
})

test.group('xp and level', () => {
  test('shutout awards more win xp and less loss xp than close match', ({ assert }) => {
    const shutoutWin = calculateWinXp(1)
    const closeWin = calculateWinXp(0.2)
    const shutoutLoss = calculateLossXp(1)
    const closeLoss = calculateLossXp(0.2)

    assert.isAbove(shutoutWin, closeWin)
    assert.isBelow(shutoutLoss, closeLoss)
  })

  test('level curve thresholds', ({ assert }) => {
    assert.equal(xpForLevel(2), 100)
    assert.equal(xpForLevel(3), 300)
    assert.equal(levelFromXp(0), 1)
    assert.equal(levelFromXp(100), 2)
    assert.equal(levelFromXp(350), 3)
  })

  test('getMatchMargin returns 1 for 6x0', ({ assert }) => {
    assert.equal(getMatchMargin({ sets: [{ side1: 6, side2: 0 }] }, 1), 1)
  })
})
