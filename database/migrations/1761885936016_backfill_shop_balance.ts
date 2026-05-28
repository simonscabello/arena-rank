import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const rows = await db
        .from('bets')
        .whereNotNull('points_awarded')
        .where('points_awarded', '>', 0)
        .groupBy('user_id')
        .select('user_id as userId')
        .sum('points_awarded as total')

      for (const row of rows) {
        const userId = Number(row.userId)
        const total = Number(row.total ?? 0)
        if (total <= 0) continue

        await db.from('users').where('id', userId).update({ shop_balance: total })

        await db.table('wallet_transactions').insert({
          user_id: userId,
          amount: total,
          type: 'migration_backfill',
          reference_type: null,
          reference_id: null,
          created_at: new Date(),
        })
      }
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.from('wallet_transactions').where('type', 'migration_backfill').delete()
      await db.from('users').update({ shop_balance: 0 })
    })
  }
}
