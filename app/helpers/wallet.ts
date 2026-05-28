import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export type WalletTransactionType =
  | 'bet_reward'
  | 'bet_reversal'
  | 'shop_purchase'
  | 'migration_backfill'

async function adjustBalance(
  userId: number,
  amount: number,
  type: WalletTransactionType,
  referenceType: string | null,
  referenceId: number | null,
  trx: TransactionClientContract
) {
  await trx.from('users').where('id', userId).increment('shop_balance', amount)

  await trx.table('wallet_transactions').insert({
    user_id: userId,
    amount,
    type,
    reference_type: referenceType,
    reference_id: referenceId,
    created_at: new Date(),
  })
}

export async function creditBetReward(
  userId: number,
  betId: number,
  amount: number,
  trx: TransactionClientContract
) {
  const existing = await trx
    .from('wallet_transactions')
    .where('user_id', userId)
    .where('type', 'bet_reward')
    .where('reference_type', 'bet')
    .where('reference_id', betId)
    .first()

  if (existing) return

  await adjustBalance(userId, amount, 'bet_reward', 'bet', betId, trx)
}

export async function debitBetReversal(
  userId: number,
  betId: number,
  amount: number,
  trx: TransactionClientContract
) {
  const reward = await trx
    .from('wallet_transactions')
    .where('user_id', userId)
    .where('type', 'bet_reward')
    .where('reference_type', 'bet')
    .where('reference_id', betId)
    .first()

  if (!reward) return

  const reversal = await trx
    .from('wallet_transactions')
    .where('user_id', userId)
    .where('type', 'bet_reversal')
    .where('reference_type', 'bet')
    .where('reference_id', betId)
    .first()

  if (reversal) return

  await adjustBalance(userId, -amount, 'bet_reversal', 'bet', betId, trx)
}

export async function debitPurchase(
  userId: number,
  purchaseId: number,
  amount: number,
  trx: TransactionClientContract
) {
  const user = await User.query({ client: trx }).where('id', userId).firstOrFail()

  if (user.shopBalance < amount) {
    throw new Error('Saldo insuficiente')
  }

  await adjustBalance(userId, -amount, 'shop_purchase', 'purchase', purchaseId, trx)
}

export async function getLifetimeBetPoints(userId: number) {
  const row = await db
    .from('bets')
    .where('user_id', userId)
    .whereNotNull('points_awarded')
    .sum('points_awarded as total')
    .first()

  return Number(row?.total ?? 0)
}
