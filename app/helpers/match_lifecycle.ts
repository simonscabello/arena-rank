import Bet from '#models/bet'
import type GameMatch from '#models/game_match'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export async function clearMatchResult(match: GameMatch, trx: TransactionClientContract) {
  match.useTransaction(trx)
  match.winnerSide = null
  await match.save()

  const bets = await Bet.query({ client: trx }).where('match_id', match.id)
  for (const bet of bets) {
    bet.useTransaction(trx)
    bet.pointsAwarded = null
    await bet.save()
  }
}
