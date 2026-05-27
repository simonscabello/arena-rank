import ForbiddenException from '#exceptions/forbidden_exception'
import type GameMatch from '#models/game_match'
import type User from '#models/user'

export function isMatchCreator(match: GameMatch, userId: number) {
  return match.createdByUserId === userId
}

export async function assertMatchCreator(match: GameMatch, user: User) {
  if (!isMatchCreator(match, user.id)) {
    throw new ForbiddenException('Apenas quem criou a partida pode fazer isso')
  }
}
