import ForbiddenException from '#exceptions/forbidden_exception'
import { isGroupOrganizer } from '#helpers/group_access'
import { isManageWindowOpen } from '#helpers/match_manage_window'
import type GameMatch from '#models/game_match'
import type User from '#models/user'

export function isMatchCreator(match: GameMatch, userId: number) {
  return match.createdByUserId === userId
}

export async function canFinalizeMatch(match: GameMatch, userId: number, groupId: number) {
  if (isMatchCreator(match, userId)) return true
  return isGroupOrganizer(groupId, userId)
}

export async function canUndoOrCancelMatch(match: GameMatch, userId: number, groupId: number) {
  if (await isGroupOrganizer(groupId, userId)) return true
  if (!isMatchCreator(match, userId)) return false
  return isManageWindowOpen(match.statusChangedAt)
}

export async function isOrganizerOverride(_match: GameMatch, userId: number, groupId: number) {
  return isGroupOrganizer(groupId, userId)
}

export async function assertCanFinalizeMatch(match: GameMatch, user: User) {
  if (!(await canFinalizeMatch(match, user.id, match.groupId))) {
    throw new ForbiddenException('Apenas quem criou a partida ou o organizador pode finalizar')
  }
}

export async function assertCanUndoOrCancelMatch(match: GameMatch, user: User) {
  if (!(await canUndoOrCancelMatch(match, user.id, match.groupId))) {
    throw new ForbiddenException('Sem permissão para alterar esta partida')
  }
}

export async function assertMatchCreator(match: GameMatch, user: User) {
  if (!isMatchCreator(match, user.id)) {
    throw new ForbiddenException('Apenas quem criou a partida pode fazer isso')
  }
}
