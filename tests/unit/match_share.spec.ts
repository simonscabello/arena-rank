import { buildMatchShareText, formatShareScore } from '#helpers/match_share'
import type Bet from '#models/bet'
import type MatchPlayer from '#models/match_player'
import { test } from '@japa/runner'

function mockPlayer(
  partial: Pick<MatchPlayer, 'side' | 'displayName' | 'userId'> & {
    user?: MatchPlayer['user']
  }
): MatchPlayer {
  return partial as MatchPlayer
}

function mockBet(
  partial: Pick<Bet, 'pointsAwarded' | 'predictedSide' | 'userId'> & {
    user: Bet['user']
  }
): Bet {
  return partial as Bet
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

  test('buildMatchShareText formats winners and correct bettors', ({ assert }) => {
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
      mockPlayer({
        side: 2,
        userId: 3,
        displayName: null,
        user: {
          nickname: null,
          fullName: 'Pedro Costa',
          email: 'pedro@test.com',
        } as MatchPlayer['user'],
      }),
    ]

    const bets = [
      mockBet({
        userId: 4,
        predictedSide: 1,
        pointsAwarded: 10,
        user: {
          nickname: null,
          fullName: 'Pedro Alves',
          email: 'pedro2@test.com',
        } as Bet['user'],
      }),
      mockBet({
        userId: 5,
        predictedSide: 1,
        pointsAwarded: 10,
        user: {
          nickname: null,
          fullName: 'Ana Lima',
          email: 'ana@test.com',
        } as Bet['user'],
      }),
      mockBet({
        userId: 6,
        predictedSide: 2,
        pointsAwarded: 0,
        user: {
          nickname: null,
          fullName: 'Carlos',
          email: 'carlos@test.com',
        } as Bet['user'],
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
      bets,
      skipsBets: false,
    })

    assert.equal(
      text,
      '🏓 Resultado: 7x5 6x4\n🥇 Vencedores: João, Maria\n✅ Palpiteiros certos: Pedro, Ana'
    )
  })

  test('buildMatchShareText omits bettors line when skipsBets', ({ assert }) => {
    const text = buildMatchShareText({
      score: { sets: [{ side1: 6, side2: 4 }] },
      winnerSide: 1,
      players: [
        mockPlayer({
          side: 1,
          userId: null,
          displayName: 'João',
        }),
      ],
      bets: [],
      skipsBets: true,
    })

    assert.equal(text, '🏓 Resultado: 6x4\n🥇 Vencedores: João')
    assert.notInclude(text, 'Palpiteiros')
  })

  test('buildMatchShareText shows Nenhum when no correct bets', ({ assert }) => {
    const text = buildMatchShareText({
      score: { sets: [{ side1: 6, side2: 4 }] },
      winnerSide: 1,
      players: [
        mockPlayer({
          side: 1,
          userId: null,
          displayName: 'João',
        }),
      ],
      bets: [
        mockBet({
          userId: 2,
          predictedSide: 2,
          pointsAwarded: 0,
          user: {
            nickname: null,
            fullName: 'Pedro',
            email: 'pedro@test.com',
          } as Bet['user'],
        }),
      ],
      skipsBets: false,
    })

    assert.include(text, '✅ Palpiteiros certos: Nenhum')
  })
})
