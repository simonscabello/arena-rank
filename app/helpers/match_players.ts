import type { MatchPlayerType } from '#enums/match_player_type'
import { displayPerson } from '#helpers/person_display'
import type MatchPlayer from '#models/match_player'
import type User from '#models/user'
import { appBaseUrl } from '#helpers/app_url'

export type MatchPlayerInput = {
  userId?: number | null
  displayName?: string | null
  guestInviteId?: number | null
  side: number
}

export function realPlayerUserIds(players: { userId?: number | null }[]) {
  return players
    .map((player) => player.userId)
    .filter((userId): userId is number => userId !== null && userId !== undefined)
}

export function initialsFromName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function resolvePlayerType(player: {
  userId: number | null
  guestInviteId?: number | null
}): MatchPlayerType {
  if (player.userId !== null && player.userId !== undefined) {
    return 'member'
  }

  if (player.guestInviteId) {
    return 'guest_invite'
  }

  return 'guest_name'
}

export function playerDisplayName(player: MatchPlayer) {
  if (player.user) {
    return displayPerson(player.user)
  }

  return player.displayName ?? 'Convidado'
}

export function compactPlayerName(name: string) {
  const trimmed = name.trim()
  if (!trimmed.includes(' ')) {
    return trimmed
  }

  return trimmed.split(/\s+/)[0]
}

function sidePlayerNames(players: MatchPlayer[], side: number) {
  return players
    .filter((player) => player.side === side)
    .map((player) => compactPlayerName(playerDisplayName(player)))
    .join(' & ')
}

export function formatMatchPlayersLabel(players: MatchPlayer[]) {
  return `${sidePlayerNames(players, 1)} vs ${sidePlayerNames(players, 2)}`
}

export function playerInitials(player: MatchPlayer) {
  if (player.user) {
    return player.user.initials
  }

  if (player.displayName) {
    return initialsFromName(player.displayName)
  }

  return '?'
}

export function buildGuestInviteUrl(token: string) {
  return `${appBaseUrl()}/convite-jogador/${encodeURIComponent(token)}`
}

export function serializeMatchPlayer(player: MatchPlayer) {
  const playerType = resolvePlayerType(player)
  const name = playerDisplayName(player)
  const guestInvite = player.guestInvite
  const invitePending = Boolean(guestInvite && !guestInvite.claimedUserId)

  return {
    id: player.id,
    userId: player.userId,
    side: player.side,
    displayName: name,
    playerType,
    initials: playerInitials(player),
    avatarUrl: player.user?.avatarUrl ?? null,
    funLabel: player.user?.funLabel ?? null,
    email: player.user?.email ?? '',
    fullName: player.user?.fullName ?? null,
    nickname: player.user?.nickname ?? null,
    claimStatus:
      playerType === 'guest_invite' && invitePending ? ('pending' as const) : ('claimed' as const),
    guestInviteId:
      playerType === 'guest_invite' && invitePending && guestInvite ? guestInvite.id : null,
  }
}

export function displayPersonFromUser(user: User) {
  return displayPerson(user)
}
