import GroupMember from '#models/group_member'

export async function canHaveBets(groupId: number, playerUserIds: number[]) {
  const playerSet = new Set(playerUserIds)
  const members = await GroupMember.query().where('group_id', groupId).select('user_id')

  return members.some((member) => !playerSet.has(member.userId))
}
