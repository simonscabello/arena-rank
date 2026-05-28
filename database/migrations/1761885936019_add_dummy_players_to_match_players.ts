import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'match_players'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('user_id').unsigned().nullable().alter()
      table.string('display_name', 50).nullable()
      table
        .integer('guest_invite_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('guest_player_invites')
        .onDelete('SET NULL')
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        ALTER TABLE match_players
        ADD CONSTRAINT match_players_user_or_display_name_check
        CHECK (
          user_id IS NOT NULL
          OR (display_name IS NOT NULL AND length(trim(display_name)) >= 2)
        )
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(
        'ALTER TABLE match_players DROP CONSTRAINT IF EXISTS match_players_user_or_display_name_check'
      )
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['guest_invite_id'])
      table.dropColumn('guest_invite_id')
      table.dropColumn('display_name')
      table.integer('user_id').unsigned().notNullable().alter()
    })
  }
}
