import { evaluateAchievementsForUser } from '#helpers/achievements'
import { averageElo, calculateEloDelta } from '#helpers/elo'
import { markStatusChanged } from '#helpers/match_manage_window'
import { realPlayerUserIds } from '#helpers/match_players'
import type { MatchScore } from '#helpers/match_score'
import { getMatchMargin } from '#helpers/match_score'
import { calculateLossXp, calculateWinXp, levelFromXp } from '#helpers/level'
import { unlockFramesUpToLevel } from '#helpers/frame_unlocks'
import MatchPlayer from '#models/match_player'
import MatchReward from '#models/match_reward'
import type GameMatch from '#models/game_match'
import User from '#models/user'
import { DateTime } from 'luxon'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export type PlayerReward = {
  userId: number
  xpAwarded: number
  eloDelta: number
  eloAfter: number
  level: number
}

export async function scoreMatchProgression(
  match: GameMatch,
  winnerSide: number,
  score: MatchScore,
  trx: TransactionClientContract
): Promise<PlayerReward[]> {
  match.useTransaction(trx)
  match.status = 'finalizada'
  match.winnerSide = winnerSide
  match.score = score
  markStatusChanged(match)
  await match.save()

  const players = await MatchPlayer.query({ client: trx })
    .where('match_id', match.id)
    .whereNotNull('user_id')
    .select('user_id', 'side')

  const side1UserIds = players.filter((p) => p.side === 1).map((p) => p.userId!)
  const side2UserIds = players.filter((p) => p.side === 2).map((p) => p.userId!)
  const allUserIds = [...side1UserIds, ...side2UserIds]

  if (allUserIds.length === 0) {
    return []
  }

  const users = await User.query({ client: trx }).whereIn('id', allUserIds)
  const userById = new Map(users.map((u) => [u.id, u]))

  const margin = getMatchMargin(score, winnerSide as 1 | 2)
  const winnerUserIds = winnerSide === 1 ? side1UserIds : side2UserIds
  const loserUserIds = winnerSide === 1 ? side2UserIds : side1UserIds

  const winnerElos = winnerUserIds.map((id) => userById.get(id)!.elo)
  const loserElos = loserUserIds.map((id) => userById.get(id)!.elo)
  const winnerTeamElo = averageElo(winnerElos)
  const loserTeamElo = averageElo(loserElos)

  const winnerDelta =
    winnerUserIds.length > 0 ? calculateEloDelta(winnerTeamElo, loserTeamElo, true, margin) : 0
  const loserDelta =
    loserUserIds.length > 0 ? calculateEloDelta(loserTeamElo, winnerTeamElo, false, margin) : 0

  const winXp = calculateWinXp(margin)
  const lossXp = calculateLossXp(margin)
  const rewards: PlayerReward[] = []
  const now = DateTime.now()

  async function applyReward(userId: number, xpAwarded: number, eloDelta: number) {
    const user = userById.get(userId)!
    user.useTransaction(trx)
    user.xp += xpAwarded
    user.elo = Math.max(0, user.elo + eloDelta)
    const previousLevel = user.level
    user.level = levelFromXp(user.xp)
    await user.save()

    if (user.level > previousLevel) {
      await unlockFramesUpToLevel(userId, user.level, trx)
    }

    await MatchReward.create(
      {
        matchId: match.id,
        userId,
        xpAwarded,
        eloDelta,
        eloAfter: user.elo,
        createdAt: now,
      },
      { client: trx }
    )

    rewards.push({
      userId,
      xpAwarded,
      eloDelta,
      eloAfter: user.elo,
      level: user.level,
    })
  }

  for (const userId of winnerUserIds) {
    await applyReward(userId, winXp, winnerDelta)
  }

  for (const userId of loserUserIds) {
    await applyReward(userId, lossXp, loserDelta)
  }

  for (const userId of allUserIds) {
    await evaluateAchievementsForUser(userId, trx, {
      margin,
      won: winnerUserIds.includes(userId),
    })
  }

  return rewards
}

export async function getMatchPlayerUserIds(matchId: number): Promise<number[]> {
  const players = await MatchPlayer.query().where('match_id', matchId).select('user_id')
  return realPlayerUserIds(players)
}
