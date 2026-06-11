import type { AchievementCriteriaType } from '#enums/achievement_criteria_type'
import { ELO_TIER_LABELS, eloTierFromRating, type EloTier } from '#enums/elo_tier'
import { getLossStreak, getRecentWindowForm, getWinStreak } from '#helpers/match_streaks'
import type Achievement from '#models/achievement'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

type CriteriaValue = {
  count?: number
  tier?: EloTier
  level?: number
  window?: number
  minLosses?: number
}

export type AchievementProgress = {
  current: number
  target: number
  criteriaLabel: string
  progressPercent: number
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

async function getMatchCount(userId: number): Promise<number> {
  const row = await db
    .from('match_players as mp')
    .innerJoin('matches as m', 'mp.match_id', 'm.id')
    .where('mp.user_id', userId)
    .where('m.status', 'finalizada')
    .count('* as total')
    .first()

  return Number(row?.total ?? 0)
}

export function getAchievementTarget(
  criteriaType: AchievementCriteriaType,
  criteriaValue: CriteriaValue
): number {
  switch (criteriaType) {
    case 'match_count':
      return criteriaValue.count ?? 0
    case 'win_streak':
      return criteriaValue.count ?? 0
    case 'loss_streak':
      return criteriaValue.count ?? 0
    case 'recent_form':
      return criteriaValue.minLosses ?? 0
    case 'shutout_win':
      return 1
    case 'elo_tier':
      return 1
    case 'level':
      return criteriaValue.level ?? 0
    case 'manual':
      return 0
  }
}

export function formatAchievementCriteriaLabel(
  criteriaType: AchievementCriteriaType,
  criteriaValue: CriteriaValue
): string {
  switch (criteriaType) {
    case 'match_count': {
      const count = criteriaValue.count ?? 0
      return count === 1 ? 'Jogue 1 partida' : `Jogue ${count} partidas`
    }
    case 'win_streak': {
      const count = criteriaValue.count ?? 0
      return count === 1 ? 'Ganhe 1 partida seguida' : `Ganhe ${count} partidas seguidas`
    }
    case 'loss_streak': {
      const count = criteriaValue.count ?? 0
      return count === 1 ? 'Perdeu 1 partida seguida' : `Perdeu ${count} partidas seguidas`
    }
    case 'recent_form': {
      const window = criteriaValue.window ?? 0
      const minLosses = criteriaValue.minLosses ?? 0
      return `Jogou ${window}, perdeu ${minLosses}`
    }
    case 'shutout_win':
      return 'Vença sem games do adversário em nenhum set'
    case 'elo_tier': {
      const tier = criteriaValue.tier
      if (!tier) return 'Alcance um tier de ELO'
      return `Alcance o tier ${ELO_TIER_LABELS[tier]}`
    }
    case 'level': {
      const level = criteriaValue.level ?? 0
      return `Atinga o nível ${level}`
    }
    case 'manual':
      return 'Conquista manual'
  }
}

export function formatAchievementProgressHint(
  criteriaType: AchievementCriteriaType,
  criteriaValue: CriteriaValue,
  current: number,
  target: number
): string | null {
  if (criteriaType === 'loss_streak' && current > 0 && current < target) {
    return `Perdeu ${current} de ${target} seguidas`
  }
  if (criteriaType === 'win_streak' && current > 0 && current < target) {
    return `Ganhou ${current} de ${target} seguidas`
  }
  if (criteriaType === 'recent_form') {
    const window = criteriaValue.window ?? 0
    if (window <= 0) return null
    return `Últimas ${window} partidas`
  }
  return null
}

export async function getAchievementCurrentValue(
  user: User,
  criteriaType: AchievementCriteriaType,
  criteriaValue: CriteriaValue
): Promise<number> {
  switch (criteriaType) {
    case 'match_count':
      return getMatchCount(user.id)
    case 'win_streak':
      return getWinStreak(user.id)
    case 'loss_streak':
      return getLossStreak(user.id)
    case 'recent_form': {
      const window = criteriaValue.window ?? 0
      if (window <= 0) return 0
      const form = await getRecentWindowForm(user.id, window)
      return form.losses
    }
    case 'shutout_win':
      return 0
    case 'elo_tier': {
      const tier = criteriaValue.tier
      if (!tier) return 0
      return eloTierFromRating(user.elo) === tier ? 1 : 0
    }
    case 'level':
      return user.level
    case 'manual':
      return 0
  }
}

export async function getAchievementProgress(
  user: User,
  criteriaType: AchievementCriteriaType,
  criteriaValue: CriteriaValue
): Promise<AchievementProgress | null> {
  const target = getAchievementTarget(criteriaType, criteriaValue)
  if (target <= 0 && criteriaType !== 'shutout_win') return null

  let criteriaLabel = formatAchievementCriteriaLabel(criteriaType, criteriaValue)
  const current = await getAchievementCurrentValue(user, criteriaType, criteriaValue)
  const effectiveTarget = criteriaType === 'shutout_win' ? 1 : target

  if (criteriaType === 'recent_form') {
    const window = criteriaValue.window ?? 0
    const form = await getRecentWindowForm(user.id, window)
    criteriaLabel = `Jogou ${form.played}, perdeu ${form.losses} (meta: ${window} jogos, ${target} derrotas)`
  }

  const progressHint = formatAchievementProgressHint(
    criteriaType,
    criteriaValue,
    current,
    effectiveTarget
  )
  if (progressHint && criteriaType !== 'recent_form') {
    criteriaLabel = `${criteriaLabel} · ${progressHint}`
  }

  const cappedCurrent =
    criteriaType === 'level' ||
    criteriaType === 'match_count' ||
    criteriaType === 'win_streak' ||
    criteriaType === 'loss_streak' ||
    criteriaType === 'recent_form'
      ? Math.min(current, effectiveTarget)
      : current >= effectiveTarget
        ? effectiveTarget
        : current
  const progressPercent =
    effectiveTarget > 0 ? Math.round((cappedCurrent / effectiveTarget) * 100) : 0

  return {
    current: cappedCurrent,
    target: effectiveTarget,
    criteriaLabel,
    progressPercent: Math.min(100, progressPercent),
  }
}

export async function enrichLockedAchievements(userId: number, achievements: Achievement[]) {
  const user = await User.findOrFail(userId)

  return Promise.all(
    achievements.map(async (achievement) => {
      const criteriaValue = parseCriteriaValue(achievement.criteriaValue)
      const progress = await getAchievementProgress(
        user,
        achievement.criteriaType as AchievementCriteriaType,
        criteriaValue
      )

      return {
        id: achievement.id,
        slug: achievement.slug,
        name: achievement.name,
        description: achievement.description ?? '',
        icon: achievement.icon,
        category: achievement.category,
        progress,
      }
    })
  )
}
