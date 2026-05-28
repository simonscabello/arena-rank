import type { ShopItemType } from '#enums/shop_item_type'
import { MAX_TITLE_SLOTS, SHOP_ITEM_TYPE_LABELS } from '#enums/shop_item_type'
import { debitPurchase } from '#helpers/wallet'
import ShopItem from '#models/shop_item'
import User from '#models/user'
import UserPurchase from '#models/user_purchase'
import { equipShopItemValidator, unequipShopItemValidator } from '#validators/shop'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

async function findTitleSlot(
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

async function applyEquip(
  user: User,
  item: ShopItem,
  requestedSlot?: number,
  trx?: TransactionClientContract
) {
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
      return
    }

    await client.table('user_equipped_items').insert({
      user_id: user.id,
      item_type: 'avatar_frame',
      shop_item_id: item.id,
      slot: 0,
    })
    return
  }

  let slot = requestedSlot
  if (!slot) {
    const freeSlot = await findTitleSlot(user.id, client)
    if (!freeSlot) {
      throw new Error('TITLE_SLOTS_FULL')
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
    return
  }

  await client.table('user_equipped_items').insert({
    user_id: user.id,
    item_type: 'title',
    shop_item_id: item.id,
    slot,
  })
}

async function applyUnequipByShopItemId(
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

async function applyUnequipByItemType(
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

export default class ShopController {
  async index({ inertia, auth }: HttpContext) {
    const user = auth.user!
    await user.refresh()

    const items = await ShopItem.query()
      .where('active', true)
      .orderBy('price', 'asc')
      .orderBy('id', 'asc')
    const purchases = await UserPurchase.query().where('user_id', user.id)
    const ownedIds = new Set(purchases.map((purchase) => purchase.shopItemId))

    const equippedRows = await db
      .from('user_equipped_items')
      .where('user_id', user.id)
      .whereNotNull('shop_item_id')
      .select('item_type as itemType', 'shop_item_id as shopItemId', 'slot')

    const equippedItemIds = new Set(equippedRows.map((row) => Number(row.shopItemId)))
    const equippedSlots = Object.fromEntries(
      equippedRows.map((row) => [Number(row.shopItemId), Number(row.slot)])
    )
    const occupiedTitleSlots = equippedRows
      .filter((row) => row.itemType === 'title')
      .map((row) => Number(row.slot))
    const titleSlotsFull = occupiedTitleSlots.length >= MAX_TITLE_SLOTS

    return inertia.render('shop/index', {
      shopBalance: user.shopBalance ?? 0,
      maxTitleSlots: MAX_TITLE_SLOTS,
      titleSlotsFull,
      occupiedTitleSlots,
      items: items.map((item) => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        description: item.description ?? '',
        price: item.price,
        itemType: item.itemType,
        itemTypeLabel: SHOP_ITEM_TYPE_LABELS[item.itemType as ShopItemType],
        payload: item.payload,
        owned: ownedIds.has(item.id),
        equipped: equippedItemIds.has(item.id),
        equippedSlot: equippedSlots[item.id] ?? null,
      })),
      inventory: purchases.map((purchase) => purchase.shopItemId),
    })
  }

  async purchase({ params, response, auth, session }: HttpContext) {
    const user = auth.user!
    const item = await ShopItem.findOrFail(Number(params.id))

    if (!item.active) {
      session.flash('error', 'Item indisponível')
      response.redirect().back()
      return
    }

    const alreadyOwned = await UserPurchase.query()
      .where('user_id', user.id)
      .where('shop_item_id', item.id)
      .first()

    if (alreadyOwned) {
      session.flash('error', 'Você já possui este item')
      response.redirect().back()
      return
    }

    await user.refresh()
    if (user.shopBalance < item.price) {
      session.flash('error', 'Saldo insuficiente')
      response.redirect().back()
      return
    }

    try {
      await db.transaction(async (trx) => {
        const purchase = new UserPurchase()
        purchase.useTransaction(trx)
        purchase.userId = user.id
        purchase.shopItemId = item.id
        purchase.pricePaid = item.price
        await purchase.save()

        await debitPurchase(user.id, purchase.id, item.price, trx)

        if (item.itemType === 'title') {
          const freeSlot = await findTitleSlot(user.id, trx)
          if (freeSlot) {
            const freshUser = await User.query({ client: trx }).where('id', user.id).firstOrFail()
            freshUser.useTransaction(trx)
            await applyEquip(freshUser, item, freeSlot, trx)
          }
          return
        }

        const slotTaken = await trx
          .from('user_equipped_items')
          .where('user_id', user.id)
          .where('item_type', item.itemType)
          .whereNotNull('shop_item_id')
          .first()

        if (!slotTaken) {
          const freshUser = await User.query({ client: trx }).where('id', user.id).firstOrFail()
          freshUser.useTransaction(trx)
          await applyEquip(freshUser, item, undefined, trx)
        }
      })
    } catch {
      session.flash('error', 'Saldo insuficiente')
      response.redirect().back()
      return
    }

    session.flash('success', `${item.name} adquirido!`)
    response.redirect().toRoute('shop.index')
  }

  async equip({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const { shopItemId, slot } = await request.validateUsing(equipShopItemValidator)

    const owned = await UserPurchase.query()
      .where('user_id', user.id)
      .where('shop_item_id', shopItemId)
      .first()

    if (!owned) {
      session.flash('error', 'Você não possui este item')
      response.redirect().back()
      return
    }

    const item = await ShopItem.findOrFail(shopItemId)

    try {
      await applyEquip(user, item, slot)
    } catch (error) {
      if (error instanceof Error && error.message === 'TITLE_SLOTS_FULL') {
        session.flash('error', 'Os 3 slots de título estão cheios. Desequipe um ou escolha o slot.')
        response.redirect().back()
        return
      }
      throw error
    }

    session.flash('success', `${item.name} equipado`)
    response.redirect().back()
  }

  async unequip({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(unequipShopItemValidator)

    if (payload.shopItemId) {
      await applyUnequipByShopItemId(user, payload.shopItemId)
    } else if (payload.itemType) {
      await applyUnequipByItemType(user, payload.itemType)
    } else {
      session.flash('error', 'Item inválido')
      response.redirect().back()
      return
    }

    session.flash('success', 'Item desequipado')
    response.redirect().back()
  }
}
