import { Link } from '@adonisjs/inertia/react'
import { UserPlus } from 'lucide-react'
import { buttonClassName } from '~/lib/button_styles'

type Props = {
  groupName: string | null
  displayName: string | null
  claimed: boolean
  invalid?: boolean
}

export default function GuestInviteShow({ groupName, displayName, claimed, invalid }: Props) {
  if (invalid) {
    return (
      <div className="mx-auto w-full max-w-sm py-8">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-stone-900">Convite inválido</h1>
          <p className="mt-2 text-sm text-stone-500">Este link não existe ou expirou.</p>
          <Link route="home" className={`${buttonClassName('secondary', 'md', true)} mt-6`}>
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  if (claimed) {
    return (
      <div className="mx-auto w-full max-w-sm py-8">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-stone-900">Convite já utilizado</h1>
          <p className="mt-2 text-sm text-stone-500">
            {groupName && displayName
              ? `O convite de ${displayName} em ${groupName} já foi vinculado a uma conta.`
              : 'Este convite já foi vinculado a uma conta.'}
          </p>
          <Link route="session.create" className={`${buttonClassName('primary', 'md', true)} mt-6`}>
            Entrar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-sm py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <UserPlus className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900">Convite para jogar</h1>
        <p className="mt-2 text-sm text-stone-500">
          Você foi convidado para jogar em{' '}
          <span className="font-medium text-stone-800">{groupName}</span>
          {displayName ? (
            <>
              {' '}
              como <span className="font-medium text-stone-800">{displayName}</span>
            </>
          ) : null}
          .
        </p>
        <p className="mt-3 text-sm text-stone-600">
          Ao entrar com Google, suas partidas registradas serão vinculadas automaticamente ao seu
          perfil.
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
