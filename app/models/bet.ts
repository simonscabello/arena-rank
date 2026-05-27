import { BetSchema } from '#database/schema'
import GameMatch from '#models/game_match'
import User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Bet extends BetSchema {
  @belongsTo(() => GameMatch, { foreignKey: 'matchId' })
  declare match: BelongsTo<typeof GameMatch>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
