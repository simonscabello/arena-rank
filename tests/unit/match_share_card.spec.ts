import {
  buildMatchShareCard,
  getAchievementsUnlockedInMatch,
  resolveShareCardMode,
  type ShareCardSerializedPlayer,
} from '#helpers/match_share_card'
import { generateInviteCode } from '#helpers/group_access'
import Achievement from '#models/achievement'
import Arena from '#models/arena'
import GameMatch from '#models/game_match'
import Group from '#models/group'
import MatchPlayer from '#models/match_player'
import User from '#models/user'
import UserAchievement from '#models/user_achievement'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

function serializedPlayer(
  partial: Partial<ShareCardSerializedPlayer> & Pick<ShareCardSerializedPlayer, 'userId' | 'side'>
): ShareCardSerializedPlayer {
  return {
    displayName: 'Jogador',
    initials: 'JO',
    avatarUrl: null,
    funLabel: null,
    xpAwarded: 100,
    eloDelta: 12,
    eloAfter: 1012,
    ...partial,
  }
}

test.group('match_share_card', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('resolveShareCardMode returns personal when viewer played', ({ assert }) => {
    const players = [
      serializedPlayer({ userId: 1, side: 1 }),
      serializedPlayer({ userId: 2, side: 2 }),
    ]

    assert.equal(resolveShareCardMode(1, players), 'personal')
    assert.equal(resolveShareCardMode(99, players), 'match')
  })

  test('getAchievementsUnlockedInMatch returns achievements near finalize time', async ({
    assert,
  }) => {
    const suffix = crypto.randomUUID()
    const user = await User.create({
      email: `share-${suffix}@test.com`,
      password: 'password123',
      fullName: 'Share User',
    })

    const achievement = await Achievement.create({
      slug: `share-ach-${suffix}`,
      name: 'On Fire',
      description: 'Test',
      icon: '🔥',
      category: 'meme',
      criteriaType: 'manual',
      criteriaValue: null,
      sortOrder: 999,
    })

    const finalizedAt = DateTime.now()
    await UserAchievement.create({
      userId: user.id,
      achievementId: achievement.id,
      unlockedAt: finalizedAt,
    })

    const result = await getAchievementsUnlockedInMatch([user.id], finalizedAt)

    assert.lengthOf(result.get(user.id) ?? [], 1)
    assert.equal(result.get(user.id)?.[0].name, 'On Fire')
  })

  test('buildMatchShareCard builds personal payload for participant', async ({ assert }) => {
    const suffix = crypto.randomUUID()
    const viewer = await User.create({
      email: `viewer-${suffix}@test.com`,
      password: 'password123',
      fullName: 'Viewer Silva',
      nickname: 'viewer rei',
    })
    const opponent = await User.create({
      email: `opp-${suffix}@test.com`,
      password: 'password123',
      fullName: 'Opponent',
    })

    const play = await Group.create({ name: 'Play Resenha', inviteCode: generateInviteCode() })
    const arena = await Arena.create({ name: 'Quadra Central' })
    const finalizedAt = DateTime.now()
    const match = await GameMatch.create({
      groupId: play.id,
      arenaId: arena.id,
      createdByUserId: viewer.id,
      status: 'finalizada',
      winnerSide: 1,
      score: { sets: [{ side1: 7, side2: 5 }] },
      statusChangedAt: finalizedAt,
    })

    const viewerPlayer = await MatchPlayer.create({
      matchId: match.id,
      userId: viewer.id,
      side: 1,
      displayName: null,
    })
    const opponentPlayer = await MatchPlayer.create({
      matchId: match.id,
      userId: opponent.id,
      side: 2,
      displayName: null,
    })

    await match.load('players', (query) => query.preload('user'))

    const serializedPlayers: ShareCardSerializedPlayer[] = [
      {
        userId: viewer.id,
        side: 1,
        displayName: 'viewer rei',
        initials: 'VR',
        avatarUrl: null,
        funLabel: 'On Fire',
        xpAwarded: 120,
        eloDelta: 15,
        eloAfter: 1015,
      },
      {
        userId: opponent.id,
        side: 2,
        displayName: 'Opponent',
        initials: 'OP',
        avatarUrl: null,
        funLabel: null,
        xpAwarded: 40,
        eloDelta: -15,
        eloAfter: 985,
      },
    ]

    const payload = await buildMatchShareCard({
      viewerUserId: viewer.id,
      playName: play.name,
      arenaName: arena.name,
      scoreLabel: '7×5',
      winnerSide: 1,
      score: { sets: [{ side1: 7, side2: 5 }] },
      players: [viewerPlayer, opponentPlayer],
      serializedPlayers,
      statusChangedAt: finalizedAt,
      rankPosition: 3,
    })

    assert.isNotNull(payload)
    assert.equal(payload!.mode, 'personal')
    assert.equal(payload!.playName, 'Play Resenha')
    assert.equal(payload!.viewer?.displayName, 'viewer rei')
    assert.isTrue(payload!.viewer?.isWinner)
    assert.equal(payload!.viewer?.rankPosition, 3)
    assert.lengthOf(payload!.teams, 2)
    assert.isTrue(payload!.teams.find((team) => team.side === 1)?.isWinner)
    assert.include(payload!.shareText, '7x5')
  })

  test('buildMatchShareCard builds match payload for spectator', async ({ assert }) => {
    const suffix = crypto.randomUUID()
    const player1 = await User.create({
      email: `p1-${suffix}@test.com`,
      password: 'password123',
      fullName: 'Alice',
    })
    const player2 = await User.create({
      email: `p2-${suffix}@test.com`,
      password: 'password123',
      fullName: 'Bob',
    })
    const spectator = await User.create({
      email: `spec-${suffix}@test.com`,
      password: 'password123',
      fullName: 'Spectator',
    })

    const play = await Group.create({ name: 'Play BT', inviteCode: generateInviteCode() })
    const arena = await Arena.create({ name: 'Arena' })
    const finalizedAt = DateTime.now()
    const match = await GameMatch.create({
      groupId: play.id,
      arenaId: arena.id,
      createdByUserId: player1.id,
      status: 'finalizada',
      winnerSide: 2,
      score: { sets: [{ side1: 4, side2: 6 }] },
      statusChangedAt: finalizedAt,
    })

    const mp1 = await MatchPlayer.create({
      matchId: match.id,
      userId: player1.id,
      side: 1,
      displayName: null,
    })
    const mp2 = await MatchPlayer.create({
      matchId: match.id,
      userId: player2.id,
      side: 2,
      displayName: null,
    })

    await match.load('players', (query) => query.preload('user'))

    const serializedPlayers: ShareCardSerializedPlayer[] = [
      serializedPlayer({
        userId: player1.id,
        side: 1,
        displayName: 'Alice',
        initials: 'AL',
        xpAwarded: 40,
        eloDelta: -10,
        eloAfter: 990,
      }),
      serializedPlayer({
        userId: player2.id,
        side: 2,
        displayName: 'Bob',
        initials: 'BO',
        xpAwarded: 100,
        eloDelta: 10,
        eloAfter: 1010,
      }),
    ]

    const payload = await buildMatchShareCard({
      viewerUserId: spectator.id,
      playName: play.name,
      arenaName: arena.name,
      scoreLabel: '4×6',
      winnerSide: 2,
      score: { sets: [{ side1: 4, side2: 6 }] },
      players: [mp1, mp2],
      serializedPlayers,
      statusChangedAt: finalizedAt,
      rankPosition: null,
    })

    assert.isNotNull(payload)
    assert.equal(payload!.mode, 'match')
    assert.lengthOf(payload!.teams ?? [], 2)
    assert.isFalse(payload!.teams![0].isWinner)
    assert.isTrue(payload!.teams![1].isWinner)
    assert.equal(payload!.teams![1].label, 'Bob')
  })
})
