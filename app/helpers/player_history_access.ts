import GroupMember from '#models/group_member'

export async function getSharedGroupIds(viewerId: number, targetUserId: number): Promise<number[]> {
  const viewerMemberships = await GroupMember.query().where('user_id', viewerId).select('group_id')

  const viewerGroupIds = viewerMemberships.map((row) => row.groupId)
  if (viewerGroupIds.length === 0) {
    return []
  }

  const sharedMemberships = await GroupMember.query()
    .where('user_id', targetUserId)
    .whereIn('group_id', viewerGroupIds)
    .select('group_id')

  return sharedMemberships.map((row) => row.groupId)
}

export async function usersShareGroup(viewerId: number, targetUserId: number): Promise<boolean> {
  const sharedGroupIds = await getSharedGroupIds(viewerId, targetUserId)
  return sharedGroupIds.length > 0
}

export async function getSharedUserIds(viewerId: number, userIds: number[]): Promise<Set<number>> {
  if (userIds.length === 0) {
    return new Set()
  }

  const viewerMemberships = await GroupMember.query().where('user_id', viewerId).select('group_id')

  const viewerGroupIds = viewerMemberships.map((row) => row.groupId)
  if (viewerGroupIds.length === 0) {
    return new Set()
  }

  const sharedMemberships = await GroupMember.query()
    .whereIn('user_id', userIds)
    .whereIn('group_id', viewerGroupIds)
    .select('user_id')

  return new Set(sharedMemberships.map((row) => row.userId))
}
