import {
  claimGuestInvite,
  findGuestInviteByToken,
  PENDING_GUEST_INVITE_TOKEN_KEY,
} from '#helpers/guest_player_invite'
import { assertGroupMember } from '#helpers/group_access'
import { buildGuestInviteUrl, initialsFromName } from '#helpers/match_players'
import GuestPlayerInvite from '#models/guest_player_invite'
import type { HttpContext } from '@adonisjs/core/http'

export default class GuestInvitesController {
  async member({ inertia, auth, params, response }: HttpContext) {
    const viewer = auth.user!
    const groupId = Number(params.groupId)
    const inviteId = Number(params.inviteId)

    await assertGroupMember(groupId, viewer)

    const invite = await GuestPlayerInvite.query()
      .where('id', inviteId)
      .where('group_id', groupId)
      .preload('group')
      .firstOrFail()

    if (invite.claimedUserId) {
      response.redirect().toRoute('members.show', {
        groupId,
        userId: invite.claimedUserId,
      })
      return
    }

    return inertia.render('guest_invites/member', {
      group: { id: invite.group.id, name: invite.group.name },
      guest: {
        displayName: invite.displayName,
        initials: initialsFromName(invite.displayName),
        inviteUrl: buildGuestInviteUrl(invite.token),
      },
    })
  }

  async show({ inertia, auth, session, params, response }: HttpContext) {
    const invite = await findGuestInviteByToken(params.token)

    if (!invite) {
      return inertia.render('guest_invites/show', {
        groupName: null,
        displayName: null,
        claimed: true,
        invalid: true,
      })
    }

    if (invite.claimedUserId) {
      return inertia.render('guest_invites/show', {
        groupName: invite.group.name,
        displayName: invite.displayName,
        claimed: true,
        invalid: false,
      })
    }

    if (auth.user) {
      await claimGuestInvite(invite, auth.user, response, session)
      return
    }

    session.put(PENDING_GUEST_INVITE_TOKEN_KEY, invite.token)

    return inertia.render('guest_invites/show', {
      groupName: invite.group.name,
      displayName: invite.displayName,
      claimed: false,
      invalid: false,
    })
  }
}
