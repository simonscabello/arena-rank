import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('avatar_frames', (table) => {
      table.increments('id').notNullable()
      table.string('slug', 64).notNullable().unique()
      table.string('name', 120).notNullable()
      table.string('description', 255).nullable()
      table.smallint('unlock_level').unsigned().notNullable().defaultTo(1)
      table.json('payload').notNullable()
      table.integer('sort_order').notNullable().defaultTo(0)
      table.timestamp('created_at').notNullable()
    })

    this.schema.createTable('achievements', (table) => {
      table.increments('id').notNullable()
      table.string('slug', 64).notNullable().unique()
      table.string('name', 120).notNullable()
      table.string('description', 255).nullable()
      table.string('icon', 16).notNullable()
      table.string('category', 32).notNullable()
      table.string('criteria_type', 32).notNullable()
      table.json('criteria_value').nullable()
      table.integer('sort_order').notNullable().defaultTo(0)
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable('achievements')
    this.schema.dropTable('avatar_frames')
  }
}
