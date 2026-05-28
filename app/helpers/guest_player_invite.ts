import { randomBytes } from 'node:crypto'
import { isGroupMember } from '#helpers/group_access'
import { buildGuestInviteUrl } from '#helpers/match_players'
import GuestPlayerInvite from '#models/guest_player_invite'
import GroupMember from '#models/group_member'
import MatchPlayer from '#models/match_player'
import type User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export const PENDING_GUEST_INVITE_TOKEN_KEY = 'pendingGuestInviteToken'

export function generateGuestInviteToken() {
  return randomBytes(24).toString('hex')
}

export async function findGuestInviteByToken(token: string) {
  return GuestPlayerInvite.query().where('token', token).preload('group').first()
}

export async function listPendingGuestInvites(groupId: number) {
  const invites = await GuestPlayerInvite.query()
    .where('group_id', groupId)
    .whereNull('claimed_user_id')
    .orderBy('display_name', 'asc')

  return invites.map((invite) => ({
    id: invite.id,
    displayName: invite.displayName,
    inviteUrl: buildGuestInviteUrl(invite.token),
  }))
}

export async function createGuestPlayerInvite(
  groupId: number,
  displayName: string,
  createdByUserId: number,
  trx?: any
) {
  return GuestPlayerInvite.create(
    {
      groupId,
      token: generateGuestInviteToken(),
      displayName: displayName.trim(),
      createdByUserId,
    },
    trx ? { client: trx } : undefined
  )
}

export async function claimGuestInvite(
  invite: GuestPlayerInvite,
  user: User,
  response: HttpContext['response'],
  session: HttpContext['session']
) {
  if (invite.claimedUserId) {
    session.flash('error', 'Este convite já foi utilizado')
    response.redirect().toRoute('session.create')
    return
  }

  const linkedMatches = await db.transaction(async (trx) => {
    const alreadyMember = await isGroupMember(invite.groupId, user.id)
    if (!alreadyMember) {
      await GroupMember.create({ groupId: invite.groupId, userId: user.id }, { client: trx })
    }

    const updated = await MatchPlayer.query({ client: trx })
      .where('guest_invite_id', invite.id)
      .whereNull('user_id')
      .update({
        userId: user.id,
        displayName: null,
        guestInviteId: null,
      })

    invite.useTransaction(trx)
    invite.claimedUserId = user.id
    invite.claimedAt = DateTime.now()
    await invite.save()

    return Array.isArray(updated) ? updated.length : Number(updated)
  })

  const matchWord = linkedMatches === 1 ? 'partida foi vinculada' : 'partidas foram vinculadas'
  session.flash(
    'success',
    linkedMatches > 0
      ? `Conta vinculada! ${linkedMatches} ${matchWord} ao seu perfil.`
      : 'Conta vinculada à Play!'
  )
  response.redirect().toRoute('groups.show', { id: invite.groupId })
}

export async function consumePendingGuestInvite(
  session: HttpContext['session'],
  user: User,
  response: HttpContext['response']
) {
  const token = session.get(PENDING_GUEST_INVITE_TOKEN_KEY) as string | undefined
  if (!token) return false

  session.forget(PENDING_GUEST_INVITE_TOKEN_KEY)

  const invite = await findGuestInviteByToken(token)
  if (!invite || invite.claimedUserId) {
    session.flash('error', 'Convite inválido ou já utilizado')
    return false
  }

  await claimGuestInvite(invite, user, response, session)
  return true
}
