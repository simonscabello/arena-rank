import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'matches'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('status_changed_at').nullable()
    })

    await this.defer(async (db) => {
      await db.rawQuery('UPDATE matches SET status_changed_at = created_at')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('status_changed_at').notNullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status_changed_at')
    })
  }
}
