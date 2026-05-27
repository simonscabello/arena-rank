import {
  COURT_SIDE_LABELS,
  DOMINANT_HAND_LABELS,
  SKILL_LEVEL_LABELS,
  type CourtSide,
  type DominantHand,
  type SkillLevel,
} from '#enums/sport_profile'
import { assertGroupMember, isGroupMember } from '#helpers/group_access'
import ForbiddenException from '#exceptions/forbidden_exception'
import { getMemberDisplay, getPlayerStats } from '#helpers/player_stats'
import { getGroupRanking } from '#helpers/ranking'
import Group from '#models/group'
import type { HttpContext } from '@adonisjs/core/http'

export default class MembersController {
  async show({ inertia, auth, params }: HttpContext) {
    const viewer = auth.user!
    const groupId = Number(params.groupId)
    const userId = Number(params.userId)

    await assertGroupMember(groupId, viewer)

    if (!(await isGroupMember(groupId, userId))) {
      throw new ForbiddenException()
    }

    const group = await Group.findOrFail(groupId)
    const member = await getMemberDisplay(userId)
    const stats = await getPlayerStats(groupId, userId)
    const ranking = await getGroupRanking(groupId)
    const betRanking = ranking.find((entry) => entry.userId === userId) ?? null

    return inertia.render('members/show', {
      group: { id: group.id, name: group.name },
      member: {
        ...member,
        dominantHandLabel: member.dominantHand
          ? DOMINANT_HAND_LABELS[member.dominantHand as DominantHand]
          : null,
        courtSideLabel: member.courtSide
          ? COURT_SIDE_LABELS[member.courtSide as CourtSide]
          : null,
        skillLevelLabel: member.skillLevel
          ? SKILL_LEVEL_LABELS[member.skillLevel as SkillLevel]
          : null,
      },
      stats,
      betRanking,
      isSelf: viewer.id === userId,
    })
  }
}
