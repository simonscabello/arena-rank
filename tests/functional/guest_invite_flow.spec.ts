import { generateInviteCode } from '#helpers/group_access'
import { PENDING_GUEST_INVITE_TOKEN_KEY } from '#helpers/guest_player_invite'
import { getPlayerStats } from '#helpers/player_stats'
import Bet from '#models/bet'
import GameMatch from '#models/game_match'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import GuestPlayerInvite from '#models/guest_player_invite'
import MatchPlayer from '#models/match_player'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Guest invite flow', (suite) => {
  suite.each.setup(() => testUtils.db().truncate())

  async function createUser(email: string, fullName?: string) {
    return User.create({
      email,
      password: 'password123',
      fullName: fullName ?? email.split('@')[0],
    })
  }

  async function createGroupWithMembers() {
    const owner = await createUser('owner@test.com', 'Owner')
    const player1 = await createUser('p1@test.com', 'Player 1')
    const player2 = await createUser('p2@test.com', 'Player 2')
    const player3 = await createUser('p3@test.com', 'Player 3')
    const bettor = await createUser('bettor@test.com', 'Bettor')

    const group = await Group.create({ name: 'Play Teste', inviteCode: generateInviteCode() })
    for (const user of [owner, player1, player2, player3, bettor]) {
      await GroupMember.create({ groupId: group.id, userId: user.id, role: 'membro' })
    }
    await GroupMember.query().where('group_id', group.id).where('user_id', owner.id).update({
      role: 'organizador',
    })

    return { owner, player1, player2, player3, bettor, group }
  }

  async function createMatchViaHttp(
    client: any,
    owner: User,
    groupId: number,
    players: Record<string, unknown>[],
    assert?: { match: (value: string, pattern: RegExp) => void }
  ) {
    const response = await client
      .post(`/grupos/${groupId}/partidas`)
      .loginAs(owner)
      .json({ arenaName: 'Arena Teste', players })

    const redirects = response.redirects()
    const matchUrl = redirects[redirects.length - 1]
    assert?.match(matchUrl, /\/partidas\/\d+$/)
    return Number(matchUrl.split('/').pop())
  }

  test('creates match with guest player and invite token', async ({ client, assert }) => {
    const { owner, player1, player2, player3, group } = await createGroupWithMembers()

    const matchId = await createMatchViaHttp(
      client,
      owner,
      group.id,
      [
        { userId: player1.id, side: 1 },
        { userId: player2.id, side: 1 },
        { userId: player3.id, side: 2 },
        { displayName: 'João Convidado', side: 2 },
      ],
      assert
    )

    const guestRow = await MatchPlayer.query()
      .where('match_id', matchId)
      .whereNotNull('guest_invite_id')
      .firstOrFail()

    assert.isNull(guestRow.userId)
    assert.equal(guestRow.displayName, 'João Convidado')

    const invite = await GuestPlayerInvite.findOrFail(guestRow.guestInviteId!)
    assert.equal(invite.displayName, 'João Convidado')
    assert.isNull(invite.claimedUserId)
  })

  test('guest does not block bets for non-playing members', async ({ client, assert }) => {
    const { owner, player1, player2, player3, bettor, group } = await createGroupWithMembers()

    const matchId = await createMatchViaHttp(
      client,
      owner,
      group.id,
      [
        { userId: player1.id, side: 1 },
        { userId: player2.id, side: 1 },
        { userId: player3.id, side: 2 },
        { displayName: 'Substituto', side: 2 },
      ],
      assert
    )

    const match = await GameMatch.findOrFail(matchId)
    assert.equal(match.status, 'palpites_abertos')

    await client.post(`/partidas/${matchId}/palpite`).loginAs(bettor).json({ predictedSide: 1 })

    const bet = await Bet.query().where('match_id', matchId).where('user_id', bettor.id).first()
    assert.isNotNull(bet)
  })

  test('claim links guest history across multiple matches', async ({ client, assert }) => {
    const { owner, player1, player2, player3, group } = await createGroupWithMembers()

    const matchId1 = await createMatchViaHttp(
      client,
      owner,
      group.id,
      [
        { userId: player1.id, side: 1 },
        { userId: player2.id, side: 1 },
        { userId: player3.id, side: 2 },
        { displayName: 'Carlos Convidado', side: 2 },
      ],
      assert
    )

    const guestRow = await MatchPlayer.query()
      .where('match_id', matchId1)
      .whereNotNull('guest_invite_id')
      .firstOrFail()
    const invite = await GuestPlayerInvite.findOrFail(guestRow.guestInviteId!)

    const matchId2 = await createMatchViaHttp(
      client,
      owner,
      group.id,
      [
        { userId: player1.id, side: 1 },
        { userId: player2.id, side: 1 },
        { userId: player3.id, side: 2 },
        { guestInviteId: invite.id, side: 2 },
      ],
      assert
    )

    await client.post(`/partidas/${matchId1}/iniciar`).loginAs(owner)
    await client.post(`/partidas/${matchId1}/finalizar`).loginAs(owner).json({ winnerSide: 1 })
    await client.post(`/partidas/${matchId2}/iniciar`).loginAs(owner)
    await client.post(`/partidas/${matchId2}/finalizar`).loginAs(owner).json({ winnerSide: 2 })

    const landing = await client.get(`/convite-jogador/${invite.token}`)
    landing.assertStatus(200)
    landing.assertSession(PENDING_GUEST_INVITE_TOKEN_KEY, invite.token)

    await client.post('/signup').withSession(landing.session()).form({
      fullName: 'Carlos Convidado',
      email: 'carlos@convidado.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    })

    const guest = await User.findByOrFail('email', 'carlos@convidado.com')
    await invite.refresh()
    assert.equal(invite.claimedUserId, guest.id)

    const linkedRows = await MatchPlayer.query()
      .whereIn('match_id', [matchId1, matchId2])
      .where('user_id', guest.id)

    assert.lengthOf(linkedRows, 2)

    const stats = await getPlayerStats(group.id, guest.id)
    assert.equal(stats.matchesPlayed, 2)
    assert.equal(stats.wins, 1)
    assert.equal(stats.losses, 1)
  })

  test('rejects match with only guest players', async ({ client, assert }) => {
    const { owner, group } = await createGroupWithMembers()
    const before = await GameMatch.query().where('group_id', group.id).count('* as total')
    const beforeCount = Number(before[0].$extras.total)

    await client
      .post(`/grupos/${group.id}/partidas`)
      .loginAs(owner)
      .json({
        arenaName: 'Arena Teste',
        players: [
          { displayName: 'A', side: 1 },
          { displayName: 'B', side: 1 },
          { displayName: 'C', side: 2 },
          { displayName: 'D', side: 2 },
        ],
      })

    const after = await GameMatch.query().where('group_id', group.id).count('* as total')
    assert.equal(Number(after[0].$extras.total), beforeCount)
  })

  test('rejects duplicate guest names in same match', async ({ client, assert }) => {
    const { owner, player1, player2, group } = await createGroupWithMembers()
    const before = await GameMatch.query().where('group_id', group.id).count('* as total')
    const beforeCount = Number(before[0].$extras.total)

    await client
      .post(`/grupos/${group.id}/partidas`)
      .loginAs(owner)
      .json({
        arenaName: 'Arena Teste',
        players: [
          { userId: player1.id, side: 1 },
          { userId: player2.id, side: 1 },
          { displayName: 'Duplicado', side: 2 },
          { displayName: 'Duplicado', side: 2 },
        ],
      })

    const after = await GameMatch.query().where('group_id', group.id).count('* as total')
    assert.equal(Number(after[0].$extras.total), beforeCount)
  })
})
