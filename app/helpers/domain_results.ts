export type ShopPurchaseError = 'already_owned' | 'insufficient_balance'
export type ShopEquipError = 'title_slots_full'
export type WalletDebitError = 'insufficient_balance'

export type ShopPurchaseResult = { ok: true } | { ok: false; error: ShopPurchaseError }

export type ShopEquipResult = { ok: true } | { ok: false; error: ShopEquipError }

export type WalletDebitResult = { ok: true } | { ok: false; error: WalletDebitError }
