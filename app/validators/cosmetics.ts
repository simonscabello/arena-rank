import { COSMETIC_ITEM_TYPES } from '#enums/cosmetic_item_type'
import vine from '@vinejs/vine'

export const equipCosmeticValidator = vine.create({
  achievementId: vine.number().optional(),
  avatarFrameId: vine.number().optional(),
  slot: vine.number().min(1).max(3).optional(),
})

export const unequipCosmeticValidator = vine.create({
  achievementId: vine.number().optional(),
  avatarFrameId: vine.number().optional(),
  itemType: vine.enum(COSMETIC_ITEM_TYPES).optional(),
})
