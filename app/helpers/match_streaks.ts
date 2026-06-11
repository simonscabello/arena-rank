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

export type RecentWindowForm = {
  wins: number
  losses: number
  played: number
}

export async function getRecentWindowForm(
  userId: number,
  window: number,
  trx?: TransactionClientContract
): Promise<RecentWindowForm> {
  const rows = await getRecentMatchOutcomes(userId, trx)
  const slice = rows.slice(0, window)

  let wins = 0
  let losses = 0
  for (const row of slice) {
    if (Number(row.side) === Number(row.winnerSide)) {
      wins++
    } else {
      losses++
    }
  }

  return {
    wins,
    losses,
    played: slice.length,
  }
}

export async function getStreaksForUser(
  userId: number,
  trx?: TransactionClientContract
): Promise<{ winStreak: number; lossStreak: number }> {
  const rows = await getRecentMatchOutcomes(userId, trx)
  return {
    winStreak: countStreak(rows, true),
    lossStreak: countStreak(rows, false),
  }
}
