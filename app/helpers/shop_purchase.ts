import type { ShopPurchaseResult } from '#helpers/domain_results'
import { applyEquip, findTitleSlot } from '#helpers/shop_equipment'
import { debitPurchase } from '#helpers/wallet'
import type ShopItem from '#models/shop_item'
import User from '#models/user'
import UserPurchase from '#models/user_purchase'
import db from '@adonisjs/lucid/services/db'

class ShopPurchaseAbort extends Error {
  constructor(readonly code: 'insufficient_balance') {
    super(code)
  }
}

export async function purchaseShopItem(
  userId: number,
  item: ShopItem
): Promise<ShopPurchaseResult> {
  try {
    return await db.transaction(async (trx) => {
      const alreadyOwned = await UserPurchase.query({ client: trx })
        .where('user_id', userId)
        .where('shop_item_id', item.id)
        .first()

      if (alreadyOwned) {
        return { ok: false, error: 'already_owned' }
      }

      const purchase = new UserPurchase()
      purchase.useTransaction(trx)
      purchase.userId = userId
      purchase.shopItemId = item.id
      purchase.pricePaid = item.price
      await purchase.save()

      const debitResult = await debitPurchase(userId, purchase.id, item.price, trx)
      if (!debitResult.ok) {
        throw new ShopPurchaseAbort('insufficient_balance')
      }

      if (item.itemType === 'title') {
        const freeSlot = await findTitleSlot(userId, trx)
        if (freeSlot) {
          const freshUser = await User.query({ client: trx }).where('id', userId).firstOrFail()
          freshUser.useTransaction(trx)
          await applyEquip(freshUser, item, freeSlot, trx)
        }
        return { ok: true }
      }

      const slotTaken = await trx
        .from('user_equipped_items')
        .where('user_id', userId)
        .where('item_type', item.itemType)
        .whereNotNull('shop_item_id')
        .first()

      if (!slotTaken) {
        const freshUser = await User.query({ client: trx }).where('id', userId).firstOrFail()
        freshUser.useTransaction(trx)
        await applyEquip(freshUser, item, undefined, trx)
      }

      return { ok: true }
    })
  } catch (error) {
    if (error instanceof ShopPurchaseAbort) {
      return { ok: false, error: error.code }
    }

    throw error
  }
}
