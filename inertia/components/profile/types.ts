export type ProfileSection = 'progression' | 'achievements' | 'play' | 'account' | 'history'

export type Option = { value: string; label: string }

export type ProfileProgression = {
  xp: number
  level: number
  xpToNextLevel: number
  xpProgressCurrent: number
  xpProgressNeeded: number
  elo: number
  eloTier: string
  eloTierLabel: string
}

export type ProfileAchievement = {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  category: string
  categoryLabel: string
  unlockedAt: string
  equipped: boolean
}

export type LockedAchievement = {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  category: string
  categoryLabel: string
  criteriaLabel: string | null
  current: number | null
  target: number | null
  progressPercent: number | null
}

export type ProfileFrame = {
  id: number
  slug: string
  name: string
  description: string
  unlockLevel: number
  frameSrc: string | null
  inset: number
  equipped: boolean
}

export type ProfileData = {
  nickname: string | null
  funLabel: string | null
  dominantHand: string | null
  courtSide: string | null
  skillLevel: string | null
  avatarUrl: string | null
  avatarFrameSrc: string | null
  avatarFrameInset: number
  equippedTitles: { icon: string; name: string }[]
  initials: string
}

export type HistoryFilters = {
  groupId?: number
  arenaId?: number
  partnerId?: number
  from?: string
  to?: string
  page?: number
}

export type HistoryFilterOptions = {
  groups: { id: number; name: string }[]
  arenas: { id: number; name: string; city: string | null; groupId: number }[]
  partners: { userId: number; name: string; groupId: number }[]
}

export type HistoryMatchItem = {
  matchId: number
  groupId: number
  groupName: string
  arenaName: string
  city: string | null
  won: boolean
  partnerName: string | null
  playedAt: string
  scoreLabel: string | null
}

export type HistorySummary = {
  wins: number
  losses: number
  matchesPlayed: number
  winRate: number
}

export type HistoryPagination = {
  page: number
  pageSize: number
  total: number
  lastPage: number
}
