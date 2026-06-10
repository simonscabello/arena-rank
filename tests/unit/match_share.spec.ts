import { buildMatchShareText, formatShareScore } from '#helpers/match_share'
import type MatchPlayer from '#models/match_player'
import { test } from '@japa/runner'

function mockPlayer(
  partial: Pick<MatchPlayer, 'side' | 'displayName' | 'userId'> & {
    user?: MatchPlayer['user']
  }
): MatchPlayer {
  return partial as MatchPlayer
}

test.group('match_share', () => {
  test('formatShareScore uses x separator between sets', ({ assert }) => {
    assert.equal(
      formatShareScore({
        sets: [
          { side1: 7, side2: 5 },
          { side1: 6, side2: 4 },
        ],
      }),
      '7x5 6x4'
    )
  })

  test('formatShareScore handles single set', ({ assert }) => {
    assert.equal(formatShareScore({ sets: [{ side1: 6, side2: 4 }] }), '6x4')
    assert.isNull(formatShareScore(null))
  })

  test('buildMatchShareText formats winners', ({ assert }) => {
    const players = [
      mockPlayer({
        side: 1,
        userId: 1,
        displayName: null,
        user: {
          nickname: null,
          fullName: 'João Silva',
          email: 'joao@test.com',
        } as MatchPlayer['user'],
      }),
      mockPlayer({
        side: 1,
        userId: 2,
        displayName: null,
        user: {
          nickname: null,
          fullName: 'Maria Santos',
          email: 'maria@test.com',
        } as MatchPlayer['user'],
      }),
    ]

    const text = buildMatchShareText({
      score: {
        sets: [
          { side1: 7, side2: 5 },
          { side1: 6, side2: 4 },
        ],
      },
      winnerSide: 1,
      players,
    })

    assert.equal(text, '🏓 Resultado: 7x5 6x4\n🥇 Vencedores: João, Maria')
  })
})
