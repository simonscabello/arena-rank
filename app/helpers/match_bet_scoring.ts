import { markStatusChanged } from '#helpers/match_manage_window'
import type { MatchScore } from '#helpers/match_score'
import { creditBetReward } from '#helpers/wallet'
import Bet from '#models/bet'
import type GameMatch from '#models/game_match'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

const POINTS_CORRECT = 10

export async function scoreBetsForMatch(
  match: GameMatch,
  winnerSide: number,
  score: MatchScore,
  trx: TransactionClientContract
) {
  match.useTransaction(trx)
  match.status = 'finalizada'
  match.winnerSide = winnerSide
  match.score = score
  markStatusChanged(match)
  await match.save()

  const bets = await Bet.query({ client: trx }).where('match_id', match.id)
  for (const bet of bets) {
    bet.useTransaction(trx)
    bet.pointsAwarded = bet.predictedSide === winnerSide ? POINTS_CORRECT : 0
    await bet.save()
    if (bet.pointsAwarded > 0) {
      await creditBetReward(bet.userId, bet.id, bet.pointsAwarded, trx)
    }
  }
}
