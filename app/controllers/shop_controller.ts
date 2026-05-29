import type { ShopItemType } from '#enums/shop_item_type'
import { MAX_TITLE_SLOTS, SHOP_ITEM_TYPE_LABELS } from '#enums/shop_item_type'
import { purchaseShopItem } from '#helpers/shop_purchase'
import {
  applyEquip,
  applyUnequipByItemType,
  applyUnequipByShopItemId,
} from '#helpers/shop_equipment'
import ShopItem from '#models/shop_item'
import UserPurchase from '#models/user_purchase'
import { equipShopItemValidator, unequipShopItemValidator } from '#validators/shop'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

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
      maxTitleSlots: MAX_TITLE_SLOTS,
      titleSlotsFull,
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

    const result = await purchaseShopItem(user.id, item)

    if (!result.ok) {
      if (result.error === 'already_owned') {
        session.flash('error', 'Você já possui este item')
        response.redirect().back()
        return
      }

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
    const result = await applyEquip(user, item, slot)

    if (!result.ok) {
      session.flash('error', 'Os 3 slots de título estão cheios. Desequipe um ou escolha o slot.')
      response.redirect().back()
      return
    }

    session.flash('success', `${item.name} equipado`)
    response.redirect().back()
  }

  async unequip({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(unequipShopItemValidator)

    if (payload.shopItemId) {
      await applyUnequipByShopItemId(user, payload.shopItemId)
      session.flash('success', 'Item desequipado')
      response.redirect().back()
      return
    }

    if (payload.itemType) {
      await applyUnequipByItemType(user, payload.itemType)
      session.flash('success', 'Item desequipado')
      response.redirect().back()
      return
    }

    session.flash('error', 'Item inválido')
    response.redirect().back()
  }
}
