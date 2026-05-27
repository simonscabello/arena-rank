import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'matches'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('group_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('groups')
        .onDelete('CASCADE')
      table
        .integer('arena_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('arenas')
        .onDelete('RESTRICT')
      table
        .integer('created_by_user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.string('status', 30).notNullable().defaultTo('palpites_abertos')
      table.smallint('winner_side').unsigned().nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
