import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_equipped_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('item_type', 32).notNullable()
      table
        .integer('shop_item_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('shop_items')
        .onDelete('SET NULL')
      table.tinyint('slot').unsigned().notNullable().defaultTo(0)
      table.unique(['user_id', 'item_type', 'slot'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
