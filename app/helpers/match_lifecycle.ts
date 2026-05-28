import { debitBetReversal } from '#helpers/wallet'
import Bet from '#models/bet'
import type GameMatch from '#models/game_match'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export async function clearMatchResult(match: GameMatch, trx: TransactionClientContract) {
  match.useTransaction(trx)
  match.winnerSide = null
  match.score = null
  await match.save()

  const bets = await Bet.query({ client: trx }).where('match_id', match.id)
  for (const bet of bets) {
    if (bet.pointsAwarded && bet.pointsAwarded > 0) {
      await debitBetReversal(bet.userId, bet.id, bet.pointsAwarded, trx)
    }
    bet.useTransaction(trx)
    bet.pointsAwarded = null
    await bet.save()
  }
}
