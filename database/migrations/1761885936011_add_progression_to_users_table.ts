import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('xp').notNullable().defaultTo(0)
      table.smallint('level').unsigned().notNullable().defaultTo(1)
      table.integer('elo').notNullable().defaultTo(1000)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('xp')
      table.dropColumn('level')
      table.dropColumn('elo')
    })
  }
}
