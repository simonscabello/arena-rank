import type GameMatch from '#models/game_match'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export const MANAGE_ACTION_WINDOW_MINUTES = 2

export function markStatusChanged(match: GameMatch) {
  match.statusChangedAt = DateTime.now()
}

export function manageWindowExpiresAt(statusChangedAt: DateTime) {
  return statusChangedAt.plus({ minutes: MANAGE_ACTION_WINDOW_MINUTES })
}

export function manageWindowSecondsLeft(statusChangedAt: DateTime) {
  const seconds = Math.ceil(
    manageWindowExpiresAt(statusChangedAt).diff(DateTime.now(), 'seconds').seconds
  )
  return Math.max(0, seconds)
}

export function isManageWindowOpen(statusChangedAt: DateTime) {
  return manageWindowSecondsLeft(statusChangedAt) > 0
}

export function rejectExpiredManageWindow(
  match: GameMatch,
  { session, response }: Pick<HttpContext, 'session' | 'response'>
) {
  if (isManageWindowOpen(match.statusChangedAt)) return false

  session.flash('error', 'Prazo para alterar esta partida expirou')
  response.redirect().back()
  return true
}
