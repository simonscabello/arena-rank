import { isOrganizer } from '#enums/group_role'
import ForbiddenException from '#exceptions/forbidden_exception'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import type User from '#models/user'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'

export const PENDING_INVITE_SESSION_KEY = 'pendingInviteCode'

export async function getGroupMembership(groupId: number, userId: number) {
  return GroupMember.query().where('group_id', groupId).where('user_id', userId).first()
}

export async function isGroupMember(groupId: number, userId: number) {
  const member = await getGroupMembership(groupId, userId)
  return member !== null
}

export async function isGroupOrganizer(groupId: number, userId: number) {
  const member = await getGroupMembership(groupId, userId)
  if (!member) return false
  if (isOrganizer(member.role)) return true

  const hasOrganizer = await GroupMember.query()
    .where('group_id', groupId)
    .where('role', 'organizador')
    .first()
  if (hasOrganizer) return false

  const firstMember = await GroupMember.query()
    .where('group_id', groupId)
    .orderBy('created_at', 'asc')
    .first()

  return firstMember?.userId === userId
}

export async function assertGroupMember(groupId: number, user: User) {
  if (!(await isGroupMember(groupId, user.id))) {
    throw new ForbiddenException()
  }
}

export async function assertGroupOrganizer(groupId: number, user: User) {
  if (!(await isGroupOrganizer(groupId, user.id))) {
    throw new ForbiddenException('Apenas organizadores podem fazer isso')
  }
}

export function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function buildInviteUrl(inviteCode: string) {
  const base = env.get('APP_URL').replace(/\/$/, '')
  return `${base}/convite/${encodeURIComponent(inviteCode.toUpperCase())}`
}

export async function findGroupByInviteCode(inviteCode: string) {
  return Group.findBy('invite_code', inviteCode.toUpperCase())
}

export async function joinGroupByCode(user: User, inviteCode: string) {
  const group = await Group.findByOrFail('invite_code', inviteCode.toUpperCase())
  const alreadyMember = await isGroupMember(group.id, user.id)

  if (!alreadyMember) {
    await GroupMember.create({ groupId: group.id, userId: user.id })
  }

  return { group, alreadyMember }
}

export async function consumePendingInvite(
  session: HttpContext['session'],
  user: User,
  response: HttpContext['response']
) {
  const inviteCode = session.get(PENDING_INVITE_SESSION_KEY) as string | undefined
  if (!inviteCode) return false

  session.forget(PENDING_INVITE_SESSION_KEY)
  const { group, alreadyMember } = await joinGroupByCode(user, inviteCode)
  session.flash('success', alreadyMember ? 'Você já faz parte desta Play' : 'Você entrou na Play')
  response.redirect().toRoute('groups.show', { id: group.id })
  return true
}
