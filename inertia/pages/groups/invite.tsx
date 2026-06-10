import { Link } from '@adonisjs/inertia/react'
import { Users } from 'lucide-react'
import { buttonClassName } from '~/lib/button_styles'

type Props = {
  groupName: string
}

export default function GroupInvite({ groupName }: Props) {
  return (
    <div className="mx-auto w-full max-w-sm py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Users className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900">Convite para {groupName}</h1>
        <p className="mt-2 text-sm text-stone-500">
          Ao entrar com Google, você já entra na Play automaticamente.
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <Link route="session.create" className={buttonClassName('primary', 'lg', true)}>
          Entrar com Google
        </Link>
      </div>
    </div>
  )
}
