import { ShoppingBag } from 'lucide-react'
import Card from '~/components/Card'

type Props = {
  shopBalance: number
  maxTitleSlots: number
}

export default function ShopBalanceBanner({ shopBalance, maxTitleSlots }: Props) {
  return (
    <Card className="mb-6 border-brand-100 bg-gradient-to-br from-brand-50 to-white">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-stone-600">Seu saldo</p>
          <p className="text-2xl font-bold text-brand-700">{shopBalance} pts</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-stone-500">
        Pontos ganhos em palpites certos · até {maxTitleSlots} títulos ao mesmo tempo · gastar na
        loja não reduz seu ranking
      </p>
    </Card>
  )
}
