export type CosmeticEquipError = 'title_slots_full' | 'not_unlocked'

export type CosmeticEquipResult = { ok: true } | { ok: false; error: CosmeticEquipError }
