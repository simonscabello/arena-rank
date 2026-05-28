import { GuestPlayerInviteSchema } from '#database/schema'
import Group from '#models/group'
import User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class GuestPlayerInvite extends GuestPlayerInviteSchema {
  @belongsTo(() => Group)
  declare group: BelongsTo<typeof Group>

  @belongsTo(() => User, { foreignKey: 'createdByUserId' })
  declare createdBy: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'claimedUserId' })
  declare claimedBy: BelongsTo<typeof User>
}
