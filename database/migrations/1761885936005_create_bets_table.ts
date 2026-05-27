import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('match_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('matches')
        .onDelete('CASCADE')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.smallint('predicted_side').unsigned().notNullable()
      table.integer('points_awarded').nullable()
      table.timestamp('created_at').notNullable()
      table.unique(['match_id', 'user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
