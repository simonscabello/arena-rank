import type { CosmeticItemType } from '#enums/cosmetic_item_type'
import { MAX_TITLE_SLOTS } from '#enums/cosmetic_item_type'
import type { CosmeticEquipResult } from '#helpers/domain_results'
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
    .whereNotNull('achievement_id')
    .select('slot')
    .orderBy('slot', 'asc')

  const used = new Set(occupied.map((row) => Number(row.slot)))

  for (let slot = 1; slot <= MAX_TITLE_SLOTS; slot++) {
    if (!used.has(slot)) return slot
  }

  return null
}

export async function applyEquipAchievement(
  user: User,
  achievementId: number,
  requestedSlot?: number,
  trx?: TransactionClientContract
): Promise<CosmeticEquipResult> {
  const client = trx ?? db

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
      .update({ achievement_id: achievementId })
    return { ok: true }
  }

  await client.table('user_equipped_items').insert({
    user_id: user.id,
    item_type: 'title',
    achievement_id: achievementId,
    avatar_frame_id: null,
    slot,
  })
  return { ok: true }
}

export async function applyEquipFrame(
  user: User,
  avatarFrameId: number,
  trx?: TransactionClientContract
): Promise<CosmeticEquipResult> {
  const client = trx ?? db

  const existing = await client
    .from('user_equipped_items')
    .where('user_id', user.id)
    .where('item_type', 'avatar_frame')
    .first()

  if (existing) {
    await client
      .from('user_equipped_items')
      .where('id', existing.id)
      .update({ avatar_frame_id: avatarFrameId, slot: 0 })
    return { ok: true }
  }

  await client.table('user_equipped_items').insert({
    user_id: user.id,
    item_type: 'avatar_frame',
    achievement_id: null,
    avatar_frame_id: avatarFrameId,
    slot: 0,
  })
  return { ok: true }
}

export async function applyUnequipByAchievementId(
  user: User,
  achievementId: number,
  trx?: TransactionClientContract
) {
  const client = trx ?? db

  await client
    .from('user_equipped_items')
    .where('user_id', user.id)
    .where('achievement_id', achievementId)
    .update({ achievement_id: null })
}

export async function applyUnequipByFrameId(
  user: User,
  avatarFrameId: number,
  trx?: TransactionClientContract
) {
  const client = trx ?? db

  await client
    .from('user_equipped_items')
    .where('user_id', user.id)
    .where('avatar_frame_id', avatarFrameId)
    .update({ avatar_frame_id: null })
}

export async function applyUnequipByItemType(
  user: User,
  itemType: CosmeticItemType,
  trx?: TransactionClientContract
) {
  const client = trx ?? db

  if (itemType === 'title') {
    await client
      .from('user_equipped_items')
      .where('user_id', user.id)
      .where('item_type', 'title')
      .update({ achievement_id: null })
    return
  }

  await client
    .from('user_equipped_items')
    .where('user_id', user.id)
    .where('item_type', 'avatar_frame')
    .update({ avatar_frame_id: null })
}
