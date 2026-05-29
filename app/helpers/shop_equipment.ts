import type { ShopEquipResult } from '#helpers/domain_results'
import type { ShopItemType } from '#enums/shop_item_type'
import { MAX_TITLE_SLOTS } from '#enums/shop_item_type'
import type ShopItem from '#models/shop_item'
import type User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export async function findTitleSlot(
  userId: number,
  client: TransactionClientContract | typeof db
): Promise<number | null> {
  const occupied = await client
    .from('user_equipped_items')
    .where('user_id', userId)
    .where('item_type', 'title')
    .whereNotNull('shop_item_id')
    .select('slot')
    .orderBy('slot', 'asc')

  const used = new Set(occupied.map((row) => Number(row.slot)))

  for (let slot = 1; slot <= MAX_TITLE_SLOTS; slot++) {
    if (!used.has(slot)) return slot
  }

  return null
}

export async function applyEquip(
  user: User,
  item: ShopItem,
  requestedSlot?: number,
  trx?: TransactionClientContract
): Promise<ShopEquipResult> {
  const client = trx ?? db
  const itemType = item.itemType as ShopItemType

  if (itemType === 'avatar_frame') {
    const existing = await client
      .from('user_equipped_items')
      .where('user_id', user.id)
      .where('item_type', 'avatar_frame')
      .first()

    if (existing) {
      await client
        .from('user_equipped_items')
        .where('id', existing.id)
        .update({ shop_item_id: item.id, slot: 0 })
      return { ok: true }
    }

    await client.table('user_equipped_items').insert({
      user_id: user.id,
      item_type: 'avatar_frame',
      shop_item_id: item.id,
      slot: 0,
    })
    return { ok: true }
  }

  let slot = requestedSlot
  if (!slot) {
    const freeSlot = await findTitleSlot(user.id, client)
    if (!freeSlot) {
      return { ok: false, error: 'title_slots_full' }
    }
    slot = freeSlot
  }

  const existing = await client
    .from('user_equipped_items')
    .where('user_id', user.id)
    .where('item_type', 'title')
    .where('slot', slot)
    .first()

  if (existing) {
    await client
      .from('user_equipped_items')
      .where('id', existing.id)
      .update({ shop_item_id: item.id })
    return { ok: true }
  }

  await client.table('user_equipped_items').insert({
    user_id: user.id,
    item_type: 'title',
    shop_item_id: item.id,
    slot,
  })
  return { ok: true }
}

export async function applyUnequipByShopItemId(
  user: User,
  shopItemId: number,
  trx?: TransactionClientContract
) {
  const client = trx ?? db

  await client
    .from('user_equipped_items')
    .where('user_id', user.id)
    .where('shop_item_id', shopItemId)
    .update({ shop_item_id: null })
}

export async function applyUnequipByItemType(
  user: User,
  itemType: ShopItemType,
  trx?: TransactionClientContract
) {
  const client = trx ?? db

  await client
    .from('user_equipped_items')
    .where('user_id', user.id)
    .where('item_type', itemType)
    .update({ shop_item_id: null })
}
