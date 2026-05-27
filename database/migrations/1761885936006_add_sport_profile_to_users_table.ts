import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('nickname', 50).nullable()
      table.string('dominant_hand', 20).nullable()
      table.string('court_side', 20).nullable()
      table.string('skill_level', 20).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('nickname')
      table.dropColumn('dominant_hand')
      table.dropColumn('court_side')
      table.dropColumn('skill_level')
    })
  }
}
