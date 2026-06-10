import { MatchSchema } from '#database/schema'
import Arena from '#models/arena'
import Group from '#models/group'
import MatchPlayer from '#models/match_player'
import MatchReward from '#models/match_reward'
import User from '#models/user'
import { beforeCreate, beforeSave, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { MatchScore } from '#helpers/match_score'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type MatchStatus = 'em_andamento' | 'finalizada' | 'cancelada'

export default class GameMatch extends MatchSchema {
  static table = 'matches'

  @beforeSave()
  static serializeScore(match: GameMatch) {
    if (match.$dirty.score && match.score && typeof match.score === 'object') {
      match.score = JSON.stringify(match.score) as unknown as MatchScore
    }
  }

  @beforeCreate()
  static setInitialStatusChangedAt(match: GameMatch) {
    if (!match.statusChangedAt) {
      match.statusChangedAt = DateTime.now()
    }
  }

  @belongsTo(() => Group)
  declare group: BelongsTo<typeof Group>

  @belongsTo(() => Arena)
  declare arena: BelongsTo<typeof Arena>

  @belongsTo(() => User, { foreignKey: 'createdByUserId' })
  declare createdBy: BelongsTo<typeof User>

  @hasMany(() => MatchPlayer, { foreignKey: 'matchId' })
  declare players: HasMany<typeof MatchPlayer>

  @hasMany(() => MatchReward, { foreignKey: 'matchId' })
  declare rewards: HasMany<typeof MatchReward>
}
