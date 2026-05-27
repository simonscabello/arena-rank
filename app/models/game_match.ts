import { MatchSchema } from '#database/schema'
import Arena from '#models/arena'
import Bet from '#models/bet'
import Group from '#models/group'
import MatchPlayer from '#models/match_player'
import User from '#models/user'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

export type MatchStatus = 'palpites_abertos' | 'em_andamento' | 'finalizada'

export default class GameMatch extends MatchSchema {
  static table = 'matches'
  @belongsTo(() => Group)
  declare group: BelongsTo<typeof Group>

  @belongsTo(() => Arena)
  declare arena: BelongsTo<typeof Arena>

  @belongsTo(() => User, { foreignKey: 'createdByUserId' })
  declare createdBy: BelongsTo<typeof User>

  @hasMany(() => MatchPlayer, { foreignKey: 'matchId' })
  declare players: HasMany<typeof MatchPlayer>

  @hasMany(() => Bet, { foreignKey: 'matchId' })
  declare bets: HasMany<typeof Bet>
}
