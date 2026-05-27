import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

const RECENT_LIMIT = 10
const MIN_GAMES_FOR_WORST_PARTNER = 3

export type PartnerSummary = {
  userId: number
  fullName: string | null
  email: string
  nickname: string | null
  winsTogether: number
  gamesTogether: number
}

export type ArenaPerformance = {
  arenaId: number
  arenaName: string
  city: string | null
  wins: number
  losses: number
  played: number
}

export type RecentMatch = {
  matchId: number
  arenaName: string
  city: string | null
  won: boolean
  playedAt: string
  partnerName: string | null
}

export type PlayerStats = {
  wins: number
  losses: number
  matchesPlayed: number
  betPoints: number
  bestPartner: PartnerSummary | null
  worstPartner: PartnerSummary | null
  byArena: ArenaPerformance[]
  recentMatches: RecentMatch[]
}

type PartnerRow = {
  userId: number
  fullName: string | null
  email: string
  nickname: string | null
  winsTogether: number
  gamesTogether: number
}

function mapPartnerRow(row: PartnerRow): PartnerSummary {
  return {
    userId: Number(row.userId),
    fullName: row.fullName,
    email: row.email,
    nickname: row.nickname,
    winsTogether: Number(row.winsTogether),
    gamesTogether: Number(row.gamesTogether),
  }
}

function displayPerson(person: {
  fullName: string | null
  email: string
  nickname?: string | null
}) {
  if (person.nickname) return person.nickname
  if (person.fullName) return person.fullName
  return person.email.split('@')[0]
}

async function getPartnerRows(groupId: number, userId: number): Promise<PartnerRow[]> {
  const rows = await db
    .from('match_players as mp')
    .innerJoin('matches as m', 'mp.match_id', 'm.id')
    .innerJoin('match_players as teammate', (join) => {
      join
        .on('teammate.match_id', 'mp.match_id')
        .andOn('teammate.side', 'mp.side')
        .andOnVal('teammate.user_id', '!=', userId)
    })
    .innerJoin('users', 'teammate.user_id', 'users.id')
    .where('m.group_id', groupId)
    .where('m.status', 'finalizada')
    .where('mp.user_id', userId)
    .groupBy('users.id', 'users.full_name', 'users.email', 'users.nickname')
    .select(
      'users.id as userId',
      'users.full_name as fullName',
      'users.email as email',
      'users.nickname as nickname',
      db.raw('COUNT(*) as gamesTogether'),
      db.raw('SUM(CASE WHEN mp.side = m.winner_side THEN 1 ELSE 0 END) as winsTogether')
    )
    .orderBy('winsTogether', 'desc')

  return rows as PartnerRow[]
}

export async function getPlayerStats(groupId: number, userId: number): Promise<PlayerStats> {
  const wl = await db
    .from('match_players as mp')
    .innerJoin('matches as m', 'mp.match_id', 'm.id')
    .where('m.group_id', groupId)
    .where('m.status', 'finalizada')
    .where('mp.user_id', userId)
    .select(
      db.raw('SUM(CASE WHEN mp.side = m.winner_side THEN 1 ELSE 0 END) as wins'),
      db.raw('SUM(CASE WHEN mp.side != m.winner_side THEN 1 ELSE 0 END) as losses'),
      db.raw('COUNT(*) as played')
    )
    .first()

  const betRow = await db
    .from('bets')
    .innerJoin('matches', 'bets.match_id', 'matches.id')
    .where('matches.group_id', groupId)
    .where('bets.user_id', userId)
    .whereNotNull('bets.points_awarded')
    .select(db.raw('COALESCE(SUM(bets.points_awarded), 0) as total'))
    .first()

  const partnerRows = await getPartnerRows(groupId, userId)
  const bestPartner = partnerRows[0] ? mapPartnerRow(partnerRows[0]) : null

  const worstCandidate = partnerRows
    .filter((row) => Number(row.gamesTogether) >= MIN_GAMES_FOR_WORST_PARTNER)
    .map((row) => ({
      row,
      winRate: Number(row.winsTogether) / Number(row.gamesTogether),
    }))
    .sort((a, b) => a.winRate - b.winRate)[0]

  const worstPartner = worstCandidate ? mapPartnerRow(worstCandidate.row) : null

  const arenaRows = await db
    .from('match_players as mp')
    .innerJoin('matches as m', 'mp.match_id', 'm.id')
    .innerJoin('arenas as a', 'm.arena_id', 'a.id')
    .where('m.group_id', groupId)
    .where('m.status', 'finalizada')
    .where('mp.user_id', userId)
    .groupBy('a.id', 'a.name', 'a.city')
    .select(
      'a.id as arenaId',
      'a.name as arenaName',
      'a.city as city',
      db.raw('COUNT(*) as played'),
      db.raw('SUM(CASE WHEN mp.side = m.winner_side THEN 1 ELSE 0 END) as wins'),
      db.raw('SUM(CASE WHEN mp.side != m.winner_side THEN 1 ELSE 0 END) as losses')
    )
    .orderBy('played', 'desc')

  const recentRows = await db
    .from('match_players as mp')
    .innerJoin('matches as m', 'mp.match_id', 'm.id')
    .innerJoin('arenas as a', 'm.arena_id', 'a.id')
    .leftJoin('match_players as teammate', (join) => {
      join
        .on('teammate.match_id', 'mp.match_id')
        .andOn('teammate.side', 'mp.side')
        .andOnVal('teammate.user_id', '!=', userId)
    })
    .leftJoin('users as partner', 'teammate.user_id', 'partner.id')
    .where('m.group_id', groupId)
    .where('m.status', 'finalizada')
    .where('mp.user_id', userId)
    .select(
      'm.id as matchId',
      'a.name as arenaName',
      'a.city as city',
      'mp.side as side',
      'm.winner_side as winnerSide',
      'm.created_at as playedAt',
      'partner.full_name as partnerFullName',
      'partner.email as partnerEmail',
      'partner.nickname as partnerNickname'
    )
    .orderBy('m.created_at', 'desc')
    .limit(RECENT_LIMIT)

  return {
    wins: Number(wl?.wins ?? 0),
    losses: Number(wl?.losses ?? 0),
    matchesPlayed: Number(wl?.played ?? 0),
    betPoints: Number(betRow?.total ?? 0),
    bestPartner,
    worstPartner,
    byArena: arenaRows.map((row) => ({
      arenaId: Number(row.arenaId),
      arenaName: row.arenaName,
      city: row.city,
      wins: Number(row.wins),
      losses: Number(row.losses),
      played: Number(row.played),
    })),
    recentMatches: recentRows.map((row) => ({
      matchId: Number(row.matchId),
      arenaName: row.arenaName,
      city: row.city,
      won: Number(row.side) === Number(row.winnerSide),
      playedAt: String(row.playedAt),
      partnerName: row.partnerEmail
        ? displayPerson({
            fullName: row.partnerFullName,
            email: row.partnerEmail,
            nickname: row.partnerNickname,
          })
        : null,
    })),
  }
}

export async function getMemberDisplay(userId: number) {
  const user = await User.findOrFail(userId)
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    nickname: user.nickname,
    funLabel: user.funLabel,
    avatarUrl: user.avatarUrl,
    initials: user.initials,
    dominantHand: user.dominantHand,
    courtSide: user.courtSide,
    skillLevel: user.skillLevel,
  }
}
