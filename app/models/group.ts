import { GroupSchema } from '#database/schema'
import GroupMember from '#models/group_member'
import GameMatch from '#models/game_match'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Group extends GroupSchema {
  @hasMany(() => GroupMember)
  declare members: HasMany<typeof GroupMember>

  @hasMany(() => GameMatch)
  declare matches: HasMany<typeof GameMatch>
}
