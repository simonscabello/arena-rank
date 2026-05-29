import { createGuestPlayerInvite } from '#helpers/guest_player_invite'
import type { MatchPlayerInput } from '#helpers/match_players'
import { realPlayerUserIds } from '#helpers/match_players'
import Arena from '#models/arena'
import GameMatch from '#models/game_match'
import MatchPlayer from '#models/match_player'
import type User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

type CreateMatchPayload = {
  arenaId?: number
  arenaName?: string
  arenaCity?: string | null
  skipBets?: boolean
}

export async function createMatchWithPlayers(
  groupId: number,
  user: User,
  payload: CreateMatchPayload,
  resolvedPlayers: MatchPlayerInput[],
  initialStatus: 'em_andamento' | 'palpites_abertos'
) {
  let arenaId = payload.arenaId
  if (!arenaId && payload.arenaName) {
    const arena = await Arena.firstOrCreate(
      { name: payload.arenaName },
      { city: payload.arenaCity ?? null }
    )
    if (payload.arenaCity && !arena.city) {
      arena.city = payload.arenaCity
      await arena.save()
    }
    arenaId = arena.id
  }

  if (!arenaId) {
    return { ok: false as const, error: 'Informe uma arena' }
  }

  const match = await db.transaction(async (trx) => {
    const now = DateTime.now()
    const created = await GameMatch.create(
      {
        groupId,
        arenaId,
        createdByUserId: user.id,
        status: initialStatus,
        statusChangedAt: now,
      },
      { client: trx }
    )

    for (const player of resolvedPlayers) {
      let guestInviteId = player.guestInviteId

      if (!player.userId && !guestInviteId && player.displayName) {
        const invite = await createGuestPlayerInvite(groupId, player.displayName, user.id, trx)
        guestInviteId = invite.id
      }

      await MatchPlayer.create(
        {
          matchId: created.id,
          userId: player.userId,
          displayName: player.userId ? null : player.displayName,
          guestInviteId: player.userId ? null : guestInviteId,
          side: player.side,
        },
        { client: trx }
      )
    }

    return created
  })

  return { ok: true as const, match, playerUserIds: realPlayerUserIds(resolvedPlayers) }
}
