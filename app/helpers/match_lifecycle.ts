import MatchReward from '#models/match_reward'
import User from '#models/user'
import type GameMatch from '#models/game_match'
import { levelFromXp } from '#helpers/level'
import { syncUnlockedFramesForLevel } from '#helpers/frame_unlocks'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export async function clearMatchResult(match: GameMatch, trx: TransactionClientContract) {
  match.useTransaction(trx)
  match.winnerSide = null
  match.score = null
  await match.save()

  const rewards = await MatchReward.query({ client: trx }).where('match_id', match.id)

  for (const reward of rewards) {
    const user = await User.findOrFail(reward.userId, { client: trx })
    user.useTransaction(trx)
    user.xp = Math.max(0, user.xp - reward.xpAwarded)
    user.elo = Math.max(0, user.elo - reward.eloDelta)
    user.level = levelFromXp(user.xp)
    await user.save()
    await syncUnlockedFramesForLevel(user.id, user.level, trx)
  }

  await MatchReward.query({ client: trx }).where('match_id', match.id).delete()
}
