import { pickShareTagline, SHARE_TAGLINES } from '#constants/share_taglines'
import { test } from '@japa/runner'

test.group('share_taglines', () => {
  test('pickShareTagline returns one of the known phrases', ({ assert }) => {
    const tagline = pickShareTagline()
    assert.include(SHARE_TAGLINES, tagline)
  })
})
