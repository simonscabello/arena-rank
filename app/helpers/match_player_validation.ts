import GuestPlayerInvite from '#models/guest_player_invite'
import GroupMember from '#models/group_member'
import type { MatchPlayerInput } from '#helpers/match_players'
import { realPlayerUserIds } from '#helpers/match_players'

export type MatchPlayerValidationResult =
  | { ok: true; resolved: ResolvedMatchPlayer[] }
  | { ok: false; error: string }

export type ResolvedMatchPlayer = {
  side: number
  userId: number | null
  displayName: string | null
  guestInviteId: number | null
  existingInvite?: GuestPlayerInvite
}

export async function validateAndResolveMatchPlayers(
  players: MatchPlayerInput[],
  groupId: number
): Promise<MatchPlayerValidationResult> {
  const side1 = players.filter((player) => player.side === 1)
  const side2 = players.filter((player) => player.side === 2)

  if (side1.length !== 2 || side2.length !== 2) {
    return { ok: false, error: 'Cada lado precisa ter exatamente 2 jogadores' }
  }

  const resolved: ResolvedMatchPlayer[] = []
  const usedUserIds = new Set<number>()
  const usedDisplayNames = new Set<string>()
  const usedGuestInviteIds = new Set<number>()
  let realPlayerCount = 0

  for (const player of players) {
    const hasUserId = player.userId !== null && player.userId !== undefined
    const hasGuestInviteId = player.guestInviteId !== null && player.guestInviteId !== undefined
    const displayName = player.displayName?.trim() ?? ''

    if (hasUserId && (hasGuestInviteId || displayName.length > 0)) {
      return { ok: false, error: 'Cada jogador deve ser membro ou convidado, não ambos' }
    }

    if (!hasUserId && !hasGuestInviteId && displayName.length < 2) {
      return { ok: false, error: 'Preencha todos os jogadores ou convidados' }
    }

    if (hasUserId) {
      if (usedUserIds.has(player.userId!)) {
        return { ok: false, error: 'Os jogadores reais devem ser diferentes' }
      }
      usedUserIds.add(player.userId!)
      realPlayerCount++
      resolved.push({
        side: player.side,
        userId: player.userId!,
        displayName: null,
        guestInviteId: null,
      })
      continue
    }

    if (hasGuestInviteId) {
      if (usedGuestInviteIds.has(player.guestInviteId!)) {
        return { ok: false, error: 'Cada convite pendente só pode ser usado uma vez por partida' }
      }

      const invite = await GuestPlayerInvite.query()
        .where('id', player.guestInviteId!)
        .where('group_id', groupId)
        .whereNull('claimed_user_id')
        .first()

      if (!invite) {
        return { ok: false, error: 'Convite de jogador inválido ou já utilizado' }
      }

      const normalizedName = invite.displayName.toLowerCase()
      if (usedDisplayNames.has(normalizedName)) {
        return { ok: false, error: 'Convidados com o mesmo nome não podem repetir na partida' }
      }

      usedGuestInviteIds.add(invite.id)
      usedDisplayNames.add(normalizedName)
      resolved.push({
        side: player.side,
        userId: null,
        displayName: invite.displayName,
        guestInviteId: invite.id,
        existingInvite: invite,
      })
      continue
    }

    const normalizedName = displayName.toLowerCase()
    if (usedDisplayNames.has(normalizedName)) {
      return { ok: false, error: 'Nomes de convidados devem ser diferentes' }
    }

    usedDisplayNames.add(normalizedName)
    resolved.push({
      side: player.side,
      userId: null,
      displayName,
      guestInviteId: null,
    })
  }

  if (realPlayerCount === 0) {
    return { ok: false, error: 'A partida precisa de pelo menos 1 jogador real da Play' }
  }

  const userIds = realPlayerUserIds(resolved)
  if (userIds.length > 0) {
    const members = await GroupMember.query().where('group_id', groupId).whereIn('user_id', userIds)

    if (members.length !== userIds.length) {
      return { ok: false, error: 'Todos os jogadores reais devem fazer parte da Play' }
    }
  }

  return { ok: true, resolved }
}
