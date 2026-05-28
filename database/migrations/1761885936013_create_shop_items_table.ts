import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'shop_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('slug', 64).notNullable().unique()
      table.string('name', 120).notNullable()
      table.string('description', 255).nullable()
      table.integer('price').unsigned().notNullable()
      table.string('item_type', 32).notNullable()
      table.json('payload').notNullable()
      table.boolean('active').notNullable().defaultTo(true)
      table.integer('sort_order').notNullable().defaultTo(0)
      table.timestamp('created_at').notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
