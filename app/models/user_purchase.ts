import ShopItem from '#models/shop_item'
import User from '#models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class UserPurchase extends BaseModel {
  static table = 'user_purchases'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare shopItemId: number

  @column()
  declare pricePaid: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => ShopItem)
  declare shopItem: BelongsTo<typeof ShopItem>
}
