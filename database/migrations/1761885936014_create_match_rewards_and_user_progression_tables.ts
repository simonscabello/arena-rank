import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('match_rewards', (table) => {
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
      table.integer('xp_awarded').notNullable().defaultTo(0)
      table.integer('elo_delta').notNullable().defaultTo(0)
      table.integer('elo_after').notNullable()
      table.timestamp('created_at').notNullable()
      table.unique(['match_id', 'user_id'])
    })

    this.schema.createTable('user_achievements', (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('achievement_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('achievements')
        .onDelete('CASCADE')
      table.timestamp('unlocked_at').notNullable()
      table.unique(['user_id', 'achievement_id'])
    })

    this.schema.createTable('user_unlocked_frames', (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('avatar_frame_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('avatar_frames')
        .onDelete('CASCADE')
      table.timestamp('unlocked_at').notNullable()
      table.unique(['user_id', 'avatar_frame_id'])
    })
  }

  async down() {
    this.schema.dropTable('user_unlocked_frames')
    this.schema.dropTable('user_achievements')
    this.schema.dropTable('match_rewards')
  }
}
