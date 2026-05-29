export type PlayerType = 'member' | 'guest_invite' | 'guest_name'

export function isGuestPlayerType(playerType: PlayerType) {
  return playerType !== 'member'
}
