import type { AchievementCriteriaType } from '#enums/achievement_criteria_type'
import { eloTierFromRating, type EloTier } from '#enums/elo_tier'
import { getLossStreak, getWinStreak } from '#helpers/match_streaks'
import Achievement from '#models/achievement'
import User from '#models/user'
import UserAchievement from '#models/user_achievement'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

type CriteriaValue = {
  count?: number
  tier?: EloTier
  level?: number
}

type EvaluationContext = {
  margin: number
  won: boolean
}

function parseCriteriaValue(raw: unknown): CriteriaValue {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as CriteriaValue
    } catch {
      return {}
    }
  }
  if (raw && typeof raw === 'object') {
    return raw as CriteriaValue
  }
  return {}
}

async function getUnlockedAchievementIds(userId: number, trx: TransactionClientContract) {
  const rows = await UserAchievement.query({ client: trx })
    .where('user_id', userId)
    .select('achievement_id')
  return new Set(rows.map((row) => row.achievementId))
}

async function getMatchCount(userId: number, trx: TransactionClientContract): Promise<number> {
  const row = await db
    .from('match_players as mp')
    .innerJoin('matches as m', 'mp.match_id', 'm.id')
    .where('mp.user_id', userId)
    .where('m.status', 'finalizada')
    .useTransaction(trx)
    .count('* as total')
    .first()

  return Number(row?.total ?? 0)
}

async function unlockAchievement(
  userId: number,
  achievementId: number,
  trx: TransactionClientContract
) {
  const now = DateTime.now()
  await UserAchievement.create(
    {
      userId,
      achievementId,
      unlockedAt: now,
    },
    { client: trx }
  )
}

async function meetsCriteria(
  user: User,
  criteriaType: AchievementCriteriaType,
  criteriaValue: CriteriaValue,
  trx: TransactionClientContract,
  context: EvaluationContext
): Promise<boolean> {
  switch (criteriaType) {
    case 'match_count': {
      const required = criteriaValue.count ?? 0
      if (required <= 0) return false
      const count = await getMatchCount(user.id, trx)
      return count >= required
    }
    case 'win_streak': {
      const required = criteriaValue.count ?? 0
      if (required <= 0) return false
      const streak = await getWinStreak(user.id, trx)
      return streak >= required
    }
    case 'loss_streak': {
      const required = criteriaValue.count ?? 0
      if (required <= 0) return false
      const streak = await getLossStreak(user.id, trx)
      return streak >= required
    }
    case 'shutout_win': {
      if (!context.won) return false
      return context.margin >= 1
    }
    case 'elo_tier': {
      const tier = criteriaValue.tier
      if (!tier) return false
      return eloTierFromRating(user.elo) === tier
    }
    case 'level': {
      const required = criteriaValue.level ?? 0
      if (required <= 0) return false
      return user.level >= required
    }
    case 'manual':
      return false
  }
}

export type UnlockedAchievementSummary = {
  id: number
  name: string
  icon: string
  category: string
}

export async function evaluateAchievementsForUser(
  userId: number,
  trx: TransactionClientContract,
  context: EvaluationContext
): Promise<UnlockedAchievementSummary[]> {
  const user = await User.findOrFail(userId, { client: trx })
  const achievements = await Achievement.query({ client: trx })
  const unlockedIds = await getUnlockedAchievementIds(userId, trx)
  const newlyUnlocked: UnlockedAchievementSummary[] = []

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue

    const criteriaValue = parseCriteriaValue(achievement.criteriaValue)
    const meets = await meetsCriteria(
      user,
      achievement.criteriaType as AchievementCriteriaType,
      criteriaValue,
      trx,
      context
    )

    if (!meets) continue

    await unlockAchievement(userId, achievement.id, trx)
    unlockedIds.add(achievement.id)
    newlyUnlocked.push({
      id: achievement.id,
      name: achievement.name,
      icon: achievement.icon,
      category: achievement.category,
    })
  }

  return newlyUnlocked
}

export async function getUserAchievements(userId: number) {
  return db
    .from('user_achievements as ua')
    .innerJoin('achievements as a', 'ua.achievement_id', 'a.id')
    .where('ua.user_id', userId)
    .select(
      'a.id as id',
      'a.slug as slug',
      'a.name as name',
      'a.description as description',
      'a.icon as icon',
      'a.category as category',
      'ua.unlocked_at as unlockedAt'
    )
    .orderBy('ua.unlocked_at', 'desc')
}

export async function getUnlockedFrames(userId: number) {
  return db
    .from('user_unlocked_frames as uuf')
    .innerJoin('avatar_frames as af', 'uuf.avatar_frame_id', 'af.id')
    .where('uuf.user_id', userId)
    .select(
      'af.id as id',
      'af.slug as slug',
      'af.name as name',
      'af.description as description',
      'af.unlock_level as unlockLevel',
      'af.payload as payload',
      'uuf.unlocked_at as unlockedAt'
    )
    .orderBy('af.sort_order', 'asc')
}
