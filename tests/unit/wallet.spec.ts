import { isUniqueConstraintError } from '#helpers/db_errors'
import { test } from '@japa/runner'

test.group('wallet helpers', () => {
  test('isUniqueConstraintError detects mysql duplicate key', ({ assert }) => {
    assert.isTrue(isUniqueConstraintError({ code: 'ER_DUP_ENTRY', errno: 1062 }))
  })

  test('isUniqueConstraintError detects sqlite unique violation', ({ assert }) => {
    assert.isTrue(isUniqueConstraintError({ code: 'SQLITE_CONSTRAINT_UNIQUE' }))
  })

  test('isUniqueConstraintError ignores other errors', ({ assert }) => {
    assert.isFalse(isUniqueConstraintError(new Error('other')))
    assert.isFalse(isUniqueConstraintError(null))
  })
})
