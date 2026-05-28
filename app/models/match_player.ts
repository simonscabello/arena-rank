import { MatchPlayerSchema } from '#database/schema'
import GameMatch from '#models/game_match'
import GuestPlayerInvite from '#models/guest_player_invite'
import User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class MatchPlayer extends MatchPlayerSchema {
  @belongsTo(() => GameMatch, { foreignKey: 'matchId' })
  declare match: BelongsTo<typeof GameMatch>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => GuestPlayerInvite, { foreignKey: 'guestInviteId' })
  declare guestInvite: BelongsTo<typeof GuestPlayerInvite>
}
