import {
  assertGroupMember,
  generateInviteCode,
  isGroupMember,
} from '#helpers/group_access'
import { getGroupRanking } from '#helpers/ranking'
import Arena from '#models/arena'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import GameMatch from '#models/game_match'
import { createGroupValidator, joinGroupValidator } from '#validators/group'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class GroupsController {
  async index({ inertia, auth }: HttpContext) {
    const user = auth.user!
    const memberships = await GroupMember.query()
      .where('user_id', user.id)
      .preload('group')
      .orderBy('created_at', 'desc')

    return inertia.render('groups/index', {
      groups: memberships.map((m) => ({
        id: m.group.id,
        name: m.group.name,
        inviteCode: m.group.inviteCode,
      })),
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

  async join({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const { inviteCode } = await request.validateUsing(joinGroupValidator)

    const group = await Group.findByOrFail('invite_code', inviteCode.toUpperCase())

    if (await isGroupMember(group.id, user.id)) {
      session.flash('success', 'Você já faz parte desta Play')
      response.redirect().toRoute('groups.show', { id: group.id })
      return
    }

    await GroupMember.create({ groupId: group.id, userId: user.id })
    session.flash('success', 'Você entrou na Play')
    response.redirect().toRoute('groups.show', { id: group.id })
  }

  async show({ inertia, auth, params }: HttpContext) {
    const user = auth.user!
    const groupId = Number(params.id)
    await assertGroupMember(groupId, user)

    const group = await Group.findOrFail(groupId)
    const members = await GroupMember.query()
      .where('group_id', groupId)
      .preload('user')
      .orderBy('created_at', 'asc')

    const matches = await GameMatch.query()
      .where('group_id', groupId)
      .whereIn('status', ['palpites_abertos', 'em_andamento'])
      .preload('arena')
      .orderBy('created_at', 'desc')

    const arenas = await Arena.query().orderBy('name', 'asc')
    const ranking = await getGroupRanking(groupId)

    return inertia.render('groups/show', {
      group: { id: group.id, name: group.name, inviteCode: group.inviteCode },
      members: members.map((m) => ({
        id: m.user.id,
        fullName: m.user.fullName,
        email: m.user.email,
        nickname: m.user.nickname,
        funLabel: m.user.funLabel,
        avatarUrl: m.user.avatarUrl,
        initials: m.user.initials,
      })),
      matches: matches.map((m) => ({
        id: m.id,
        status: m.status,
        arenaName: m.arena.name,
      })),
      arenas: arenas.map((a) => ({ id: a.id, name: a.name })),
      ranking,
      currentUserId: user.id,
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
      memberCount: members.length,
      members: members.map((m) => ({
        id: m.user.id,
        fullName: m.user.fullName,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
        initials: m.user.initials,
      })),
      arenas: arenas.map((a) => ({ id: a.id, name: a.name })),
    })
  }
}
