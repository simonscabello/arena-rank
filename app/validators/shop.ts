import { MAX_TITLE_SLOTS, SHOP_ITEM_TYPES } from '#enums/shop_item_type'
import vine from '@vinejs/vine'

export const equipShopItemValidator = vine.compile(
  vine.object({
    shopItemId: vine.number().positive(),
    slot: vine.number().min(1).max(MAX_TITLE_SLOTS).optional(),
  })
)

export const unequipShopItemValidator = vine.compile(
  vine.object({
    shopItemId: vine.number().positive().optional(),
    itemType: vine.enum(SHOP_ITEM_TYPES).optional(),
  })
)
