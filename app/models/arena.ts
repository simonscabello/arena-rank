import { ArenaSchema } from '#database/schema'
import GameMatch from '#models/game_match'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Arena extends ArenaSchema {
  @hasMany(() => GameMatch)
  declare matches: HasMany<typeof GameMatch>
}
