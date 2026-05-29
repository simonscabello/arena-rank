import {
  formatMatchScore,
  inferWinnerSideFromSets,
  normalizeSets,
  setsHavePartialInput,
  validateSets,
} from '#helpers/match_score'
import { test } from '@japa/runner'

test.group('match_score', () => {
  test('normalizeSets ignores empty rows', ({ assert }) => {
    assert.deepEqual(
      normalizeSets([
        { side1: 6, side2: 4 },
        { side1: '', side2: '' },
        { side1: 6, side2: 2 },
      ]),
      [
        { side1: 6, side2: 4 },
        { side1: 6, side2: 2 },
      ]
    )
  })

  test('setsHavePartialInput detects incomplete row', ({ assert }) => {
    assert.isTrue(setsHavePartialInput([{ side1: 6, side2: '' }]))
    assert.isFalse(setsHavePartialInput([{ side1: 6, side2: 4 }]))
  })

  test('inferWinnerSideFromSets counts set wins', ({ assert }) => {
    assert.equal(
      inferWinnerSideFromSets([
        { side1: 4, side2: 6 },
        { side1: 3, side2: 6 },
      ]),
      2
    )
    assert.equal(inferWinnerSideFromSets([{ side1: 6, side2: 4 }]), 1)
    assert.isNull(
      inferWinnerSideFromSets([
        { side1: 6, side2: 4 },
        { side1: 4, side2: 6 },
      ])
    )
  })

  test('validateSets requires at least one set', ({ assert }) => {
    assert.isFalse(validateSets(null).ok)
  })

  test('validateSets rejects tied match', ({ assert }) => {
    const sets = [
      { side1: 6, side2: 4 },
      { side1: 4, side2: 6 },
    ]
    assert.isFalse(validateSets(sets).ok)
  })

  test('formatMatchScore joins sets', ({ assert }) => {
    assert.equal(
      formatMatchScore({
        sets: [
          { side1: 6, side2: 4 },
          { side1: 6, side2: 3 },
        ],
      }),
      '6-4 · 6-3'
    )
  })
})
