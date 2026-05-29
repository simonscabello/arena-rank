export const MATCH_PLAYER_TYPES = ['member', 'guest_invite', 'guest_name'] as const
export type MatchPlayerType = (typeof MATCH_PLAYER_TYPES)[number]
