import { Form } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { Data } from '@generated/data'
import { useState, type FC } from 'react'
import BackLink from '~/components/BackLink'
import Card from '~/components/Card'
import PageHeader from '~/components/PageHeader'
import Avatar from '~/components/Avatar'
import ProfileBadge from '~/components/ProfileBadge'
import ShopBalanceBanner from '~/components/ShopBalanceBanner'
import ShopFramePreviewModal from '~/components/ShopFramePreviewModal'
import { buttonClassName } from '~/lib/button_styles'
import { cn } from '~/lib/match'

type ShopItemPayload = {
  icon?: string
  category?: string
  frameSrc?: string
  inset?: number
}

type ShopItem = {
  id: number
  slug: string
  name: string
  description: string | null
  price: number
  itemType: string
  itemTypeLabel: string
  payload: ShopItemPayload
  owned: boolean
  equipped: boolean
  equippedSlot: number | null
}

type Props = {
  maxTitleSlots: number
  titleSlotsFull: boolean
  items: ShopItem[]
}

type ShopTab = 'title' | 'avatar_frame'

const TITLE_CATEGORY_ORDER = ['competitive', 'meme', 'skill', 'troll'] as const

const TITLE_CATEGORY_LABELS: Record<string, string> = {
  competitive: 'Competitivo',
  meme: 'Meme / Resenha',
  skill: 'Skill',
  troll: 'Troll / Raras',
}

function priceLabel(item: ShopItem) {
  if (item.owned) return 'Seu'
  if (item.price === 0) return 'Grátis'
  return `${item.price} pts`
}

function isPurchaseBlocked(item: ShopItem, shopBalance: number) {
  if (item.owned) return false
  if (item.price === 0) return shopBalance < 0
  return shopBalance < item.price || shopBalance < 0
}

function itemPreview(item: ShopItem, viewer: { avatarUrl: string | null; initials: string }) {
  if (item.itemType === 'title' && typeof item.payload.icon === 'string') {
    return <ProfileBadge icon={item.payload.icon} title={item.name} showLabel={false} />
  }
  if (item.itemType === 'avatar_frame' && typeof item.payload.frameSrc === 'string') {
    return (
      <Avatar
        initials={viewer.initials}
        src={viewer.avatarUrl}
        frameSrc={item.payload.frameSrc}
        photoInset={typeof item.payload.inset === 'number' ? item.payload.inset : 18}
        size="md"
        frameLoading="lazy"
      />
    )
  }
  return null
}

function EquipTitleButtons({
  item,
  titleSlotsFull,
  maxTitleSlots,
}: {
  item: ShopItem
  titleSlotsFull: boolean
  maxTitleSlots: number
}) {
  const [pickSlot, setPickSlot] = useState(false)

  if (item.equipped) {
    return (
      <div className="flex w-full flex-wrap items-center gap-2">
        <span className="rounded-lg bg-brand-100 px-2 py-1 text-xs font-medium text-brand-800">
          Equipado{item.equippedSlot ? ` (slot ${item.equippedSlot})` : ''}
        </span>
        <Form route="shop.unequip" className="inline-flex shrink-0">
          <input type="hidden" name="shopItemId" value={item.id} />
          <button type="submit" className={buttonClassName('secondary', 'sm')}>
            Desequipar
          </button>
        </Form>
      </div>
    )
  }

  if (!titleSlotsFull) {
    return (
      <Form route="shop.equip" className="inline-flex shrink-0">
        <input type="hidden" name="shopItemId" value={item.id} />
        <button type="submit" className={buttonClassName('secondary', 'sm')}>
          Equipar
        </button>
      </Form>
    )
  }

  if (!pickSlot) {
    return (
      <button
        type="button"
        onClick={() => setPickSlot(true)}
        className={buttonClassName('secondary', 'sm')}
      >
        Escolher slot
      </button>
    )
  }

  return (
    <>
      {Array.from({ length: maxTitleSlots }, (_, i) => i + 1).map((slot) => (
        <Form key={slot} route="shop.equip" className="inline-flex shrink-0">
          <input type="hidden" name="shopItemId" value={item.id} />
          <input type="hidden" name="slot" value={slot} />
          <button type="submit" className={buttonClassName('secondary', 'sm')}>
            Slot {slot}
          </button>
        </Form>
      ))}
      <button
        type="button"
        onClick={() => setPickSlot(false)}
        className={buttonClassName('ghost', 'sm')}
      >
        Cancelar
      </button>
    </>
  )
}

function ItemActions({
  item,
  shopBalance,
  titleSlotsFull,
  maxTitleSlots,
  onFramePreview,
}: {
  item: ShopItem
  shopBalance: number
  titleSlotsFull: boolean
  maxTitleSlots: number
  onFramePreview: () => void
}) {
  const blocked = isPurchaseBlocked(item, shopBalance)
  const isFree = !item.owned && item.price === 0
  const showFramePreview =
    item.itemType === 'avatar_frame' && !item.equipped && typeof item.payload.frameSrc === 'string'

  return (
    <div className="flex flex-wrap gap-2">
      {showFramePreview && (
        <button
          type="button"
          onClick={onFramePreview}
          className={buttonClassName('secondary', 'sm')}
        >
          Prévia
        </button>
      )}
      {item.owned && item.itemType === 'title' && (
        <EquipTitleButtons
          item={item}
          titleSlotsFull={titleSlotsFull}
          maxTitleSlots={maxTitleSlots}
        />
      )}
      {item.owned && item.itemType === 'avatar_frame' && !item.equipped && (
        <Form route="shop.equip" className="inline-flex shrink-0">
          <input type="hidden" name="shopItemId" value={item.id} />
          <button type="submit" className={buttonClassName('secondary', 'sm')}>
            Equipar
          </button>
        </Form>
      )}
      {item.owned && item.itemType === 'avatar_frame' && item.equipped && (
        <div className="flex w-full flex-wrap items-center justify-center gap-2">
          <span className="rounded-lg bg-brand-100 px-2 py-1 text-xs font-medium text-brand-800">
            Equipado
          </span>
          <Form route="shop.unequip" className="inline-flex shrink-0">
            <input type="hidden" name="shopItemId" value={item.id} />
            <button type="submit" className={buttonClassName('secondary', 'sm')}>
              Desequipar
            </button>
          </Form>
        </div>
      )}
      {!item.owned && (
        <Form
          route="shop.purchase"
          routeParams={{ id: item.id }}
          className="inline-flex w-full shrink-0"
        >
          <button
            type="submit"
            disabled={blocked}
            className={buttonClassName('primary', 'sm', true)}
          >
            {blocked ? 'Saldo insuficiente' : isFree ? 'Resgatar' : 'Comprar'}
          </button>
        </Form>
      )}
    </div>
  )
}

function priceBadgeClass(isFree: boolean) {
  if (isFree) {
    return 'shrink-0 rounded-lg bg-emerald-100 px-1.5 py-0.5 text-xs font-semibold text-emerald-800'
  }
  return 'shrink-0 text-xs font-semibold text-brand-700'
}

function ItemCard({
  item,
  shopBalance,
  titleSlotsFull,
  maxTitleSlots,
  viewer,
  onFramePreview,
  variant,
}: {
  item: ShopItem
  shopBalance: number
  titleSlotsFull: boolean
  maxTitleSlots: number
  viewer: { avatarUrl: string | null; initials: string }
  onFramePreview: () => void
  variant: 'compact' | 'frame'
}) {
  const isFree = !item.owned && item.price === 0
  const actionsProps = {
    item,
    shopBalance,
    titleSlotsFull,
    maxTitleSlots,
    onFramePreview,
  }

  if (variant === 'compact') {
    return (
      <li className="h-full min-w-0">
        <Card className="flex h-full flex-col p-3">
          <div className="mb-2 flex items-start justify-between gap-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              {itemPreview(item, viewer)}
            </div>
            <span className={priceBadgeClass(isFree)}>{priceLabel(item)}</span>
          </div>
          <p className="text-sm font-medium text-stone-900">{item.name}</p>
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">{item.description}</p>
          )}
          <div className="mt-auto pt-2">
            <ItemActions {...actionsProps} />
          </div>
        </Card>
      </li>
    )
  }

  return (
    <li className="h-full min-w-0">
      <Card className="flex h-full flex-col items-center p-3 text-center">
        <div className="mb-2 flex h-16 w-16 items-center justify-center">
          {itemPreview(item, viewer)}
        </div>
        <p className="text-sm font-medium text-stone-900">{item.name}</p>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">{item.description}</p>
        )}
        <span className={cn('mt-1', priceBadgeClass(isFree))}>{priceLabel(item)}</span>
        <div className="mt-auto flex w-full justify-center pt-2">
          <ItemActions {...actionsProps} />
        </div>
      </Card>
    </li>
  )
}

const ShopIndex: FC<Props> = ({ maxTitleSlots, titleSlotsFull, items }) => {
  const page = usePage<Data.SharedProps>()
  const shopBalance = page.props.shopBalance
  const authUser = page.props.user as { initials: string; avatarUrl?: string | null } | undefined
  const viewer = {
    initials: authUser?.initials ?? '?',
    avatarUrl: authUser?.avatarUrl ?? null,
  }

  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null)
  const [activeTab, setActiveTab] = useState<ShopTab>('title')

  const titleItems = items
    .filter((item) => item.itemType === 'title')
    .sort((a, b) => a.price - b.price)

  const frameItems = items
    .filter((item) => item.itemType === 'avatar_frame')
    .sort((a, b) => a.price - b.price)

  const titleTabLabel = items.find((item) => item.itemType === 'title')?.itemTypeLabel ?? 'Títulos'
  const frameTabLabel =
    items.find((item) => item.itemType === 'avatar_frame')?.itemTypeLabel ?? 'Molduras'

  const previewFrameSrc =
    previewItem && typeof previewItem.payload.frameSrc === 'string'
      ? previewItem.payload.frameSrc
      : ''
  const previewInset =
    previewItem && typeof previewItem.payload.inset === 'number' ? previewItem.payload.inset : 18

  return (
    <>
      <PageHeader
        back={<BackLink route="profile.show" label="Perfil" />}
        title="Loja"
        subtitle="Gaste pontos dos seus acertos em recompensas"
      />

      <ShopBalanceBanner shopBalance={shopBalance} maxTitleSlots={maxTitleSlots} />

      {shopBalance < 0 && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Saldo negativo — acerte mais palpites para voltar a comprar.
        </p>
      )}

      <div className="mb-4 flex rounded-xl border border-stone-200 bg-stone-50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('title')}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm font-medium transition',
            activeTab === 'title'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          )}
        >
          {titleTabLabel}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('avatar_frame')}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm font-medium transition',
            activeTab === 'avatar_frame'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          )}
        >
          {frameTabLabel}
        </button>
      </div>

      {activeTab === 'title' && (
        <div className="space-y-6">
          {TITLE_CATEGORY_ORDER.map((category) => {
            const categoryItems = titleItems.filter((item) => item.payload.category === category)
            if (categoryItems.length === 0) return null

            return (
              <section key={category}>
                <h3 className="mb-2 text-xs font-semibold text-stone-400">
                  {TITLE_CATEGORY_LABELS[category]}
                </h3>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {categoryItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      shopBalance={shopBalance}
                      titleSlotsFull={titleSlotsFull}
                      maxTitleSlots={maxTitleSlots}
                      viewer={viewer}
                      variant="compact"
                      onFramePreview={() => setPreviewItem(item)}
                    />
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}

      {activeTab === 'avatar_frame' && (
        <section>
          {frameItems.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhuma moldura disponível.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {frameItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  shopBalance={shopBalance}
                  titleSlotsFull={titleSlotsFull}
                  maxTitleSlots={maxTitleSlots}
                  viewer={viewer}
                  variant="frame"
                  onFramePreview={() => setPreviewItem(item)}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      <ShopFramePreviewModal
        open={previewItem !== null}
        name={previewItem?.name ?? ''}
        frameSrc={previewFrameSrc}
        photoInset={previewInset}
        avatarUrl={viewer.avatarUrl}
        initials={viewer.initials}
        onClose={() => setPreviewItem(null)}
      />
    </>
  )
}

export default ShopIndex
