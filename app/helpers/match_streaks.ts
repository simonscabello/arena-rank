import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

type StreakRow = {
  winnerSide: number
  side: number
}

async function getRecentMatchOutcomes(
  userId: number,
  trx?: TransactionClientContract
): Promise<StreakRow[]> {
  const query = db
    .from('match_players as mp')
    .innerJoin('matches as m', 'mp.match_id', 'm.id')
    .where('mp.user_id', userId)
    .where('m.status', 'finalizada')
    .whereNotNull('m.winner_side')
    .select('m.winner_side as winnerSide', 'mp.side as side')
    .orderBy('m.created_at', 'desc')
    .orderBy('m.id', 'desc')

  if (trx) {
    query.useTransaction(trx)
  }

  return query
}

function countStreak(rows: StreakRow[], won: boolean): number {
  let streak = 0
  for (const row of rows) {
    const isWin = Number(row.side) === Number(row.winnerSide)
    if (isWin === won) {
      streak++
      continue
    }
    break
  }
  return streak
}

export async function getWinStreak(
  userId: number,
  trx?: TransactionClientContract
): Promise<number> {
  const rows = await getRecentMatchOutcomes(userId, trx)
  return countStreak(rows, true)
}

export async function getLossStreak(
  userId: number,
  trx?: TransactionClientContract
): Promise<number> {
  const rows = await getRecentMatchOutcomes(userId, trx)
  return countStreak(rows, false)
}
