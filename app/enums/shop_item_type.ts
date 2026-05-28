export const SHOP_ITEM_TYPES = ['title', 'avatar_frame'] as const

export type ShopItemType = (typeof SHOP_ITEM_TYPES)[number]

export const SHOP_ITEM_TYPE_LABELS: Record<ShopItemType, string> = {
  title: 'Títulos',
  avatar_frame: 'Moldura',
}

export const TITLE_CATEGORY_LABELS: Record<string, string> = {
  competitive: 'Competitivo',
  meme: 'Meme / Resenha',
  skill: 'Skill',
  troll: 'Troll / Raras',
}

export const MAX_TITLE_SLOTS = 3
