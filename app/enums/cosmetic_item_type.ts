export const COSMETIC_ITEM_TYPES = ['title', 'avatar_frame'] as const

export type CosmeticItemType = (typeof COSMETIC_ITEM_TYPES)[number]

export const COSMETIC_ITEM_TYPE_LABELS: Record<CosmeticItemType, string> = {
  title: 'Títulos',
  avatar_frame: 'Moldura',
}

export const MAX_TITLE_SLOTS = 3
