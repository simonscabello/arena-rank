import { generateInviteCode } from '#helpers/group_access'
import { createMatchWithPlayers } from '#helpers/match_creation'
import { markStatusChanged } from '#helpers/match_manage_window'
import { scoreMatchProgression } from '#helpers/match_progression'
import type { MatchPlayerInput } from '#helpers/match_players'
import type { MatchScore } from '#helpers/match_score'
import { inferWinnerSideFromSets } from '#helpers/match_score'
import Arena from '#models/arena'
import GameMatch from '#models/game_match'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import GuestPlayerInvite from '#models/guest_player_invite'
import MatchReward from '#models/match_reward'
import User from '#models/user'
import UserAchievement from '#models/user_achievement'
import UserUnlockedFrame from '#models/user_unlocked_frame'
import db from '@adonisjs/lucid/services/db'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

const MAIN_GROUP_ID = 1
const WEEKEND_GROUP_NAME = 'Play Fim de Semana'

const DEV_EMAILS = [
  'joao@palpiteiro.test',
  'maria@palpiteiro.test',
  'pedro@palpiteiro.test',
  'ana@palpiteiro.test',
  'lucas@palpiteiro.test',
  'carla@palpiteiro.test',
  'rafa@palpiteiro.test',
  'bia@palpiteiro.test',
] as const

const WEEKEND_EMAILS = [
  'joao@palpiteiro.test',
  'maria@palpiteiro.test',
  'lucas@palpiteiro.test',
  'carla@palpiteiro.test',
] as const

const SKILL_WEIGHT: Record<string, number> = {
  'maria@palpiteiro.test': 3,
  'lucas@palpiteiro.test': 3,
  'joao@palpiteiro.test': 2,
  'pedro@palpiteiro.test': 2,
  'carla@palpiteiro.test': 2,
  'rafa@palpiteiro.test': 2,
  'ana@palpiteiro.test': 1,
  'bia@palpiteiro.test': 1,
}

const LINEUP_INDICES = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 2, 4, 6],
  [1, 3, 5, 7],
  [0, 3, 4, 7],
  [1, 2, 5, 6],
  [0, 4, 1, 5],
  [2, 6, 3, 7],
] as const

const ARENAS = [
  { name: 'Arena Sunset', city: 'Guarujá' },
  { name: 'BT Center SP', city: 'São Paulo' },
  { name: 'Quadra do Lago', city: 'São Paulo' },
] as const

type PlannedMatch = {
  playedAt: DateTime
  arenaName: string
  createdByEmail: string
  lineupEmails: readonly string[]
  guestSide2Name?: string
  score: MatchScore
  status: 'finalizada' | 'em_andamento' | 'cancelada'
}

function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 2 ** 32
  }
}

function scoreForWinner(winnerSide: 1 | 2, style: number): MatchScore {
  const presets: MatchScore[] = [
    { sets: [{ side1: 6, side2: 4 }] },
    { sets: [{ side1: 6, side2: 2 }] },
    { sets: [{ side1: 7, side2: 5 }] },
    {
      sets: [
        { side1: 6, side2: 4 },
        { side1: 3, side2: 6 },
        { side1: 7, side2: 6 },
      ],
    },
    {
      sets: [
        { side1: 6, side2: 3 },
        { side1: 6, side2: 4 },
      ],
    },
  ]

  const score = presets[style % presets.length]!
  const winner = inferWinnerSideFromSets(score.sets)
  if (winner === winnerSide) return score

  return {
    sets: score.sets.map((set) => ({ side1: set.side2, side2: set.side1 })),
  }
}

function teamPower(emails: string[], rng: () => number) {
  return emails.reduce((sum, email) => sum + (SKILL_WEIGHT[email] ?? 1), 0) + rng() * 2.5
}

function buildMatchDates(start: DateTime, count: number, seed: number): DateTime[] {
  const rng = seededRandom(seed)
  const dates: DateTime[] = []
  let cursor = start

  for (let i = 0; i < count; i++) {
    const dayOffset = 3 + Math.floor(rng() * 4)
    const hour = 17 + Math.floor(rng() * 3)
    const minute = [0, 15, 30, 45][Math.floor(rng() * 4)]!
    cursor = cursor.plus({ days: dayOffset }).set({ hour, minute, second: 0, millisecond: 0 })
    dates.push(cursor)
  }

  return dates
}

function buildMainGroupSchedule(start: DateTime): PlannedMatch[] {
  const dates = buildMatchDates(start, 46, 42)
  const rng = seededRandom(99)
  const matches: PlannedMatch[] = []

  for (let i = 0; i < dates.length; i++) {
    const playedAt = dates[i]!
    const lineupIndices = LINEUP_INDICES[i % LINEUP_INDICES.length]!
    const lineupEmails = lineupIndices.map((index) => DEV_EMAILS[index]!)
    const side1Emails = lineupEmails.slice(0, 2)
    const side2Emails = lineupEmails.slice(2, 4)
    const winnerSide = teamPower(side1Emails, rng) >= teamPower(side2Emails, rng) ? 1 : 2

    let status: PlannedMatch['status'] = 'finalizada'
    if (i === dates.length - 2) status = 'cancelada'
    if (i === dates.length - 1) status = 'em_andamento'

    const useGuest = i === 8 || i === 22
    matches.push({
      playedAt,
      arenaName: ARENAS[i % ARENAS.length]!.name,
      createdByEmail: lineupEmails[0]!,
      lineupEmails,
      guestSide2Name: useGuest ? 'Tiagão' : undefined,
      score: scoreForWinner(winnerSide, i),
      status,
    })
  }

  return matches
}

function buildWeekendGroupSchedule(start: DateTime): PlannedMatch[] {
  const dates = buildMatchDates(start, 14, 77)
  const rng = seededRandom(177)
  const matches: PlannedMatch[] = []

  for (const [i, date] of dates.entries()) {
    const playedAt = date!
    const shuffled = [...WEEKEND_EMAILS].sort(() => rng() - 0.5)
    const side1Emails = shuffled.slice(0, 2)
    const side2Emails = shuffled.slice(2, 4)
    const winnerSide = teamPower(side1Emails, rng) >= teamPower(side2Emails, rng) ? 1 : 2

    matches.push({
      playedAt,
      arenaName: ARENAS[(i + 1) % ARENAS.length]!.name,
      createdByEmail: side1Emails[0]!,
      lineupEmails: [...side1Emails, ...side2Emails],
      score: scoreForWinner(winnerSide, i + 3),
      status: 'finalizada',
    })
  }

  return matches
}

async function resetSimulationData(userIds: number[], groupIds: number[]) {
  const matchRows = await GameMatch.query().whereIn('group_id', groupIds).select('id')
  const matchIds = matchRows.map((row) => row.id)

  if (matchIds.length > 0) {
    await MatchReward.query().whereIn('match_id', matchIds).delete()
    await GameMatch.query().whereIn('id', matchIds).delete()
  }

  await GuestPlayerInvite.query().whereIn('group_id', groupIds).delete()
  await UserAchievement.query().whereIn('user_id', userIds).delete()
  await UserUnlockedFrame.query().whereIn('user_id', userIds).delete()

  await db.from('user_equipped_items').whereIn('user_id', userIds).delete()

  await User.query().whereIn('id', userIds).update({ xp: 0, level: 1, elo: 1000 })
}

async function backdateMatchTimestamps(matchId: number, playedAt: DateTime) {
  const sql = playedAt.toSQL({ includeOffset: false })
  if (!sql) return

  await db.from('matches').where('id', matchId).update({
    created_at: sql,
    updated_at: sql,
    status_changed_at: sql,
  })

  await db.from('match_rewards').where('match_id', matchId).update({ created_at: sql })
}

async function backdateNewUnlocks(
  userIds: number[],
  beforeAchievementIds: Map<number, Set<number>>,
  beforeFrameIds: Map<number, Set<number>>,
  playedAt: DateTime
) {
  const sql = playedAt.toSQL({ includeOffset: false })
  if (!sql) return

  for (const userId of userIds) {
    const achievements = await UserAchievement.query()
      .where('user_id', userId)
      .select('achievement_id')
    const known = beforeAchievementIds.get(userId) ?? new Set()
    const newIds = achievements.map((row) => row.achievementId).filter((id) => !known.has(id))

    if (newIds.length > 0) {
      await UserAchievement.query()
        .where('user_id', userId)
        .whereIn('achievement_id', newIds)
        .update({ unlocked_at: sql })
      newIds.forEach((id) => known.add(id))
      beforeAchievementIds.set(userId, known)
    }

    const frames = await UserUnlockedFrame.query()
      .where('user_id', userId)
      .select('avatar_frame_id')
    const knownFrames = beforeFrameIds.get(userId) ?? new Set()
    const newFrameIds = frames.map((row) => row.avatarFrameId).filter((id) => !knownFrames.has(id))

    if (newFrameIds.length > 0) {
      await UserUnlockedFrame.query()
        .where('user_id', userId)
        .whereIn('avatar_frame_id', newFrameIds)
        .update({ unlocked_at: sql })
      newFrameIds.forEach((id) => knownFrames.add(id))
      beforeFrameIds.set(userId, knownFrames)
    }
  }
}

async function snapshotUnlocks(userIds: number[]) {
  const achievementIds = new Map<number, Set<number>>()
  const frameIds = new Map<number, Set<number>>()

  for (const userId of userIds) {
    const achievements = await UserAchievement.query()
      .where('user_id', userId)
      .select('achievement_id')
    achievementIds.set(userId, new Set(achievements.map((row) => row.achievementId)))

    const frames = await UserUnlockedFrame.query()
      .where('user_id', userId)
      .select('avatar_frame_id')
    frameIds.set(userId, new Set(frames.map((row) => row.avatarFrameId)))
  }

  return { achievementIds, frameIds }
}

function buildPlayers(planned: PlannedMatch, usersByEmail: Map<string, User>): MatchPlayerInput[] {
  const [emailA, emailB, emailC, emailD] = planned.lineupEmails
  const userA = usersByEmail.get(emailA!)!
  const userB = usersByEmail.get(emailB!)!
  const userC = usersByEmail.get(emailC!)!

  const players: MatchPlayerInput[] = [
    { userId: userA.id, side: 1 },
    { userId: userB.id, side: 1 },
    { userId: userC.id, side: 2 },
  ]

  if (planned.guestSide2Name) {
    players.push({ displayName: planned.guestSide2Name, side: 2 })
    return players
  }

  const userD = usersByEmail.get(emailD!)!
  players.push({ userId: userD.id, side: 2 })
  return players
}

async function seedGroupHistory(params: {
  groupId: number
  plannedMatches: PlannedMatch[]
  usersByEmail: Map<string, User>
  arenasByName: Map<string, Arena>
  achievementIds: Map<number, Set<number>>
  frameIds: Map<number, Set<number>>
}) {
  for (const planned of params.plannedMatches) {
    const creator = params.usersByEmail.get(planned.createdByEmail)
    if (!creator) continue

    const arena = params.arenasByName.get(planned.arenaName)
    if (!arena) continue

    const created = await createMatchWithPlayers(
      params.groupId,
      creator,
      { arenaId: arena.id },
      buildPlayers(planned, params.usersByEmail)
    )

    if (!created.ok) continue

    const match = created.match
    const playerUserIds = created.playerUserIds

    if (planned.status === 'finalizada') {
      const winnerSide = inferWinnerSideFromSets(planned.score.sets)
      if (!winnerSide) continue

      await db.transaction(async (trx) => {
        match.useTransaction(trx)
        await scoreMatchProgression(match, winnerSide, planned.score, trx)
      })

      await backdateNewUnlocks(
        playerUserIds,
        params.achievementIds,
        params.frameIds,
        planned.playedAt
      )
    }

    if (planned.status === 'cancelada') {
      match.status = 'cancelada'
      markStatusChanged(match)
      await match.save()
    }

    await backdateMatchTimestamps(match.id, planned.playedAt)
  }
}

async function backdateAccountTimestamps(usersByEmail: Map<string, User>, mainGroup: Group) {
  const now = DateTime.now()
  const mainGroupCreatedAt = now.minus({ months: 5 }).startOf('day').plus({ hours: 10 })

  const joinSchedule: Record<string, number> = {
    'joao@palpiteiro.test': 0,
    'maria@palpiteiro.test': 2,
    'pedro@palpiteiro.test': 4,
    'lucas@palpiteiro.test': 7,
    'carla@palpiteiro.test': 10,
    'rafa@palpiteiro.test': 14,
    'ana@palpiteiro.test': 18,
    'bia@palpiteiro.test': 21,
  }

  for (const [email, user] of usersByEmail) {
    const daysAfterStart = joinSchedule[email] ?? 0
    const joinedAt = mainGroupCreatedAt.plus({ days: daysAfterStart })
    const joinedSql = joinedAt.toSQL({ includeOffset: false })
    if (!joinedSql) continue

    await db.from('users').where('id', user.id).update({
      created_at: joinedSql,
      updated_at: joinedSql,
    })

    await db
      .from('group_members')
      .where('group_id', mainGroup.id)
      .where('user_id', user.id)
      .update({
        created_at: joinedSql,
      })
  }

  const mainGroupSql = mainGroupCreatedAt.toSQL({ includeOffset: false })
  if (mainGroupSql) {
    await db.from('groups').where('id', mainGroup.id).update({
      created_at: mainGroupSql,
      updated_at: mainGroupSql,
    })
  }
}

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    const users = await User.query().whereIn('email', [...DEV_EMAILS])
    if (users.length < DEV_EMAILS.length) {
      console.warn('dev_history_seeder: execute dev_user_seeder antes deste seeder')
      return
    }

    const usersByEmail = new Map(users.map((user) => [user.email, user]))
    const userIds = users.map((user) => user.id)

    const mainGroup = await Group.findOrFail(MAIN_GROUP_ID)
    await mainGroup.merge({ name: 'BT da Galera' }).save()

    const weekendGroup = await Group.updateOrCreate(
      { name: WEEKEND_GROUP_NAME },
      { name: WEEKEND_GROUP_NAME, inviteCode: generateInviteCode() }
    )

    for (const email of WEEKEND_EMAILS) {
      const user = usersByEmail.get(email)
      if (!user) continue

      await GroupMember.updateOrCreate(
        { groupId: weekendGroup.id, userId: user.id },
        {
          groupId: weekendGroup.id,
          userId: user.id,
          role: email === 'joao@palpiteiro.test' ? 'organizador' : 'membro',
        }
      )
    }

    const weekendCreatedAt = DateTime.now().minus({ months: 3 }).startOf('day').plus({ hours: 11 })
    const weekendSql = weekendCreatedAt.toSQL({ includeOffset: false })
    if (weekendSql) {
      await db.from('groups').where('id', weekendGroup.id).update({
        created_at: weekendSql,
        updated_at: weekendSql,
      })
    }

    await resetSimulationData(userIds, [mainGroup.id, weekendGroup.id])

    const arenasByName = new Map<string, Arena>()
    for (const arenaData of ARENAS) {
      const arena = await Arena.firstOrCreate({ name: arenaData.name }, { city: arenaData.city })
      arenasByName.set(arena.name, arena)
    }

    await backdateAccountTimestamps(usersByEmail, mainGroup)

    const simulationStart = DateTime.now()
      .minus({ months: 5 })
      .startOf('week')
      .plus({ days: 2, hours: 18 })
    const weekendStart = DateTime.now()
      .minus({ months: 3 })
      .startOf('week')
      .plus({ days: 5, hours: 9 })

    const { achievementIds, frameIds } = await snapshotUnlocks(userIds)

    await seedGroupHistory({
      groupId: mainGroup.id,
      plannedMatches: buildMainGroupSchedule(simulationStart),
      usersByEmail,
      arenasByName,
      achievementIds,
      frameIds,
    })

    await seedGroupHistory({
      groupId: weekendGroup.id,
      plannedMatches: buildWeekendGroupSchedule(weekendStart),
      usersByEmail,
      arenasByName,
      achievementIds,
      frameIds,
    })

    console.log('dev_history_seeder: histórico de ~5 meses gerado com sucesso')
  }
}
