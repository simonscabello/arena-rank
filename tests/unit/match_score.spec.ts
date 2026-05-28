import {
  formatMatchScore,
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

  test('validateSets requires winner to match set count', ({ assert }) => {
    const sets = [
      { side1: 4, side2: 6 },
      { side1: 3, side2: 6 },
    ]
    assert.isTrue(validateSets(sets, 2).ok)
    assert.isFalse(validateSets(sets, 1).ok)
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
