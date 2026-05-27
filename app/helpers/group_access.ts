import { isOrganizer } from '#enums/group_role'
import ForbiddenException from '#exceptions/forbidden_exception'
import GroupMember from '#models/group_member'
import type User from '#models/user'

export async function getGroupMembership(groupId: number, userId: number) {
  return GroupMember.query().where('group_id', groupId).where('user_id', userId).first()
}

export async function isGroupMember(groupId: number, userId: number) {
  const member = await getGroupMembership(groupId, userId)
  return member !== null
}

export async function isGroupOrganizer(groupId: number, userId: number) {
  const member = await getGroupMembership(groupId, userId)
  return member !== null && isOrganizer(member.role)
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
