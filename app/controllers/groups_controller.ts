import { getGroupActivitySummary } from '#helpers/group_activity_summary'
import { getGroupRecentMatches } from '#helpers/group_history'
import { getGroupMembersList } from '#helpers/group_members'
import { getGroupListSummaries, getUserGroupMemberships } from '#helpers/group_list_summary'
import { listPendingGuestInvites } from '#helpers/guest_player_invite'
import {
  assertGroupMember,
  assertGroupOrganizer,
  buildInviteUrl,
  findGroupByInviteCode,
  generateInviteCode,
  isGroupOrganizer,
  joinGroupByCode,
  PENDING_INVITE_SESSION_KEY,
} from '#helpers/group_access'
import Arena from '#models/arena'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import { createGroupValidator, updateGroupValidator } from '#validators/group'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class GroupsController {
  async index({ inertia, auth }: HttpContext) {
    const user = auth.user!
    const memberships = await getUserGroupMemberships(user.id)
    const groupIds = memberships.map((m) => m.group.id)
    const summaries = await getGroupListSummaries(user.id, groupIds)

    return inertia.render('groups/index', {
      groups: memberships.map((m) => {
        const summary = summaries.find((s) => s.id === m.group.id)
        return {
          id: m.group.id,
          name: m.group.name,
          memberCount: summary?.memberCount ?? 0,
          matchesThisWeek: summary?.matchesThisWeek ?? 0,
          lastMatchAt: summary?.lastMatchAt ?? null,
          lastMatchLabel: summary?.lastMatchLabel ?? null,
          userPosition: summary?.userPosition ?? null,
        }
      }),
    })
  }

  async store({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const { name } = await request.validateUsing(createGroupValidator)

    const group = await db.transaction(async (trx) => {
      const created = await Group.create(
        { name, inviteCode: generateInviteCode() },
        { client: trx }
      )
      await GroupMember.create(
        { groupId: created.id, userId: user.id, role: 'organizador' },
        { client: trx }
      )
      return created
    })

    session.flash('success', 'Play criada')
    response.redirect().toRoute('groups.show', { id: group.id })
  }

  async update({ request, response, auth, session, params }: HttpContext) {
    const user = auth.user!
    const groupId = Number(params.id)
    await assertGroupOrganizer(groupId, user)

    const { name } = await request.validateUsing(updateGroupValidator)
    const group = await Group.findOrFail(groupId)
    group.name = name
    await group.save()

    session.flash('success', 'Nome da Play atualizado')
    response.redirect().toRoute('groups.show', { id: group.id })
  }

  async invite({ inertia, auth, session, params, response }: HttpContext) {
    const group = await findGroupByInviteCode(params.code)
    if (!group) {
      return response.notFound()
    }

    if (auth.user) {
      const { alreadyMember } = await joinGroupByCode(auth.user, group.inviteCode)
      session.flash(
        'success',
        alreadyMember ? 'Você já faz parte desta Play' : 'Você entrou na Play'
      )
      response.redirect().toRoute('groups.show', { id: group.id })
      return
    }

    session.put(PENDING_INVITE_SESSION_KEY, group.inviteCode)

    return inertia.render('groups/invite', {
      groupName: group.name,
    })
  }

  async show({ inertia, auth, params }: HttpContext) {
    const user = auth.user!
    const groupId = Number(params.id)
    await assertGroupMember(groupId, user)

    const group = await Group.findOrFail(groupId)

    const recentMatches = await getGroupRecentMatches(groupId)
    const canManageGroup = await isGroupOrganizer(groupId, user.id)
    const activitySummary = await getGroupActivitySummary(groupId)
    const members = await getGroupMembersList(groupId)

    return inertia.render('groups/show', {
      group: {
        id: group.id,
        name: group.name,
        inviteUrl: buildInviteUrl(group.inviteCode),
      },
      activitySummary,
      members,
      recentMatches,
      currentUserId: user.id,
      canManageGroup,
    })
  }

  async createMatchForm({ inertia, auth, params }: HttpContext) {
    const user = auth.user!
    const groupId = Number(params.id)
    await assertGroupMember(groupId, user)

    const group = await Group.findOrFail(groupId)
    const members = await GroupMember.query()
      .where('group_id', groupId)
      .preload('user')
      .orderBy('created_at', 'asc')

    const arenas = await Arena.query().orderBy('name', 'asc')

    return inertia.render('matches/create', {
      group: { id: group.id, name: group.name },
      members: members.map((m) => ({
        id: m.user.id,
        fullName: m.user.fullName,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
        initials: m.user.initials,
      })),
      pendingGuestInvites: await listPendingGuestInvites(groupId),
      arenas: arenas.map((a) => ({ id: a.id, name: a.name })),
    })
  }
}
