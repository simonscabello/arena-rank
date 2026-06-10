import { eloTierFromRating, ELO_TIER_LABELS } from '#enums/elo_tier'
import { enrichRankingEntries } from '#helpers/cosmetic_display'
import { displayPerson } from '#helpers/person_display'
import GameMatch from '#models/game_match'
import GroupMember from '#models/group_member'
import MatchPlayer from '#models/match_player'
import User from '#models/user'

export type RankingEntry = {
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

export type RankContext = {
  position: number | null
  elo: number
  eloToNext: number | null
  leaderElo: number
  nextRankName: string | null
  nextRankPosition: number | null
}

function sortRankingEntries(entries: RankingEntry[]) {
  return entries.sort((a, b) => {
    if (b.elo !== a.elo) return b.elo - a.elo
    if (b.level !== a.level) return b.level - a.level
    return displayPerson(a).localeCompare(displayPerson(b))
  })
}

export async function getGroupRanking(groupId: number): Promise<RankingEntry[]> {
  const members = await GroupMember.query().where('group_id', groupId).preload('user')

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

  return enrichRankingEntries(sortRankingEntries(entries))
}

export function getRankContext(ranking: RankingEntry[], userId: number): RankContext {
  const leaderElo = ranking[0]?.elo ?? 0
  const index = ranking.findIndex((entry) => entry.userId === userId)

  if (index === -1) {
    return {
      position: null,
      elo: 0,
      eloToNext: null,
      leaderElo,
      nextRankName: null,
      nextRankPosition: null,
    }
  }

  const entry = ranking[index]
  const position = index + 1

  if (position === 1) {
    return {
      position: 1,
      elo: entry.elo,
      eloToNext: null,
      leaderElo: entry.elo,
      nextRankName: null,
      nextRankPosition: null,
    }
  }

  const above = ranking[index - 1]

  return {
    position,
    elo: entry.elo,
    eloToNext: above.elo - entry.elo,
    leaderElo,
    nextRankName: displayPerson(above),
    nextRankPosition: index,
  }
}

export async function getGlobalRanking(page = 1, perPage = 50) {
  const paginator = await User.query()
    .orderBy('elo', 'desc')
    .orderBy('level', 'desc')
    .orderBy('id', 'asc')
    .paginate(page, perPage)

  const entries: RankingEntry[] = paginator.all().map((user) => {
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

  const enriched = await enrichRankingEntries(entries)

  return {
    entries: enriched,
    meta: {
      total: paginator.total,
      perPage: paginator.perPage,
      currentPage: paginator.currentPage,
      lastPage: paginator.lastPage,
    },
  }
}

export async function getMatchWithRelations(matchId: number) {
  return GameMatch.query()
    .where('id', matchId)
    .preload('arena')
    .preload('players', (query) => query.preload('user').preload('guestInvite'))
    .preload('rewards')
    .firstOrFail()
}

export async function isMatchPlayer(matchId: number, userId: number) {
  const player = await MatchPlayer.query()
    .where('match_id', matchId)
    .where('user_id', userId)
    .first()
  return player !== null
}
