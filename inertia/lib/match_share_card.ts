export type ShareCardAchievement = {
  icon: string
  name: string
  category: string
}

export type ShareCardEquippedTitle = {
  icon: string
  name: string
}

export type ShareCardViewer = {
  displayName: string
  initials: string
  avatarUrl: string | null
  avatarFrameSrc: string | null
  avatarFrameInset: number
  equippedTitle: ShareCardEquippedTitle | null
  funLabel: string | null
  isWinner: boolean
  xpAwarded: number
  eloDelta: number
  eloAfter: number
  rankPosition: number | null
  winStreak: number
  lossStreak: number
  achievements: ShareCardAchievement[]
}

export type ShareCardTeamPlayer = {
  displayName: string
  initials: string
  avatarUrl: string | null
  avatarFrameSrc: string | null
  avatarFrameInset: number
  equippedTitle: ShareCardEquippedTitle | null
  funLabel: string | null
  xpAwarded: number | null
  eloDelta: number | null
  achievements: ShareCardAchievement[]
}

export type ShareCardTeam = {
  side: 1 | 2
  isWinner: boolean
  label: string
  players: ShareCardTeamPlayer[]
}

export type MatchShareCardPayload = {
  mode: 'personal' | 'match'
  playName: string
  arenaName: string
  scoreLabel: string
  winnerSide: 1 | 2
  appUrl: string
  shareText: string
  teams: ShareCardTeam[]
  viewer?: ShareCardViewer
}
