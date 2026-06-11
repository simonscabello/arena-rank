import { displayPerson } from '#helpers/person_display'
import { enrichRankingEntries } from '#helpers/cosmetic_display'
import { eloTierFromRating, ELO_TIER_LABELS } from '#enums/elo_tier'
import GroupMember from '#models/group_member'

export type GroupMemberEntry = {
  userId: number
  fullName: string | null
  email: string
  nickname: string | null
  avatarUrl: string | null
  elo: number
  level: number
  eloTier: string
  eloTierLabel: string
  equippedTitles?: { icon: string; name: string }[]
  avatarFrameSrc?: string | null
  avatarFrameInset?: number
}

export async function getGroupMembersList(groupId: number): Promise<GroupMemberEntry[]> {
  const members = await GroupMember.query()
    .where('group_id', groupId)
    .preload('user')
    .orderBy('created_at', 'asc')

  const entries = members.map((membership) => {
    const user = membership.user
    const tier = eloTierFromRating(user.elo)

    return {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      elo: user.elo,
      level: user.level,
      eloTier: tier,
      eloTierLabel: ELO_TIER_LABELS[tier],
    }
  })

  entries.sort((a, b) => {
    if (b.elo !== a.elo) return b.elo - a.elo
    if (b.level !== a.level) return b.level - a.level
    return displayPerson(a).localeCompare(displayPerson(b))
  })

  return enrichRankingEntries(entries)
}
