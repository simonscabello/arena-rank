import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_purchases'

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
      table
        .integer('shop_item_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('shop_items')
        .onDelete('CASCADE')
      table.integer('price_paid').unsigned().notNullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.unique(['user_id', 'shop_item_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
