import {
  compactPlayerName,
  formatMatchPlayersLabel,
  playerDisplayName,
} from '#helpers/match_players'
import type MatchPlayer from '#models/match_player'
import { test } from '@japa/runner'

function mockPlayer(
  partial: Pick<MatchPlayer, 'side' | 'displayName' | 'userId'> & {
    user?: MatchPlayer['user']
  }
): MatchPlayer {
  return partial as MatchPlayer
}

test.group('match_players', () => {
  test('compactPlayerName uses first word for multi-word names', ({ assert }) => {
    assert.equal(compactPlayerName('Simon Scabello'), 'Simon')
    assert.equal(compactPlayerName('Jennifer Duarte'), 'Jennifer')
  })

  test('compactPlayerName keeps single-word names', ({ assert }) => {
    assert.equal(compactPlayerName('Jennifer'), 'Jennifer')
    assert.equal(compactPlayerName('apelido'), 'apelido')
    assert.equal(compactPlayerName('  trimmed  '), 'trimmed')
  })

  test('formatMatchPlayersLabel groups by side with compact names', ({ assert }) => {
    const players = [
      mockPlayer({
        side: 1,
        userId: 1,
        user: {
          nickname: null,
          fullName: 'Simon Scabello',
          email: 'simon@test.com',
        } as MatchPlayer['user'],
      }),
      mockPlayer({
        side: 1,
        userId: 2,
        user: {
          nickname: null,
          fullName: 'Paula Silva',
          email: 'paula@test.com',
        } as MatchPlayer['user'],
      }),
      mockPlayer({
        side: 2,
        userId: null,
        displayName: 'Jennifer Duarte',
      }),
      mockPlayer({
        side: 2,
        userId: null,
        displayName: 'Maria',
      }),
    ]

    assert.equal(formatMatchPlayersLabel(players), 'Simon & Paula vs Jennifer & Maria')
  })

  test('playerDisplayName prefers nickname over full name', ({ assert }) => {
    const player = mockPlayer({
      side: 1,
      userId: 1,
      user: {
        nickname: 'apelido',
        fullName: 'Nome Completo',
        email: 'user@test.com',
      } as MatchPlayer['user'],
    })

    assert.equal(playerDisplayName(player), 'apelido')
    assert.equal(compactPlayerName(playerDisplayName(player)), 'apelido')
  })
})
