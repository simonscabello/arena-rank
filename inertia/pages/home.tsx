import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { Trophy, Users } from 'lucide-react'
import { buttonClassName } from '~/lib/button_styles'

export default function Home() {
  const { user } = usePage().props as { user?: { initials: string } }

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-600/25">
        <Trophy className="h-10 w-10 text-white" aria-hidden />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">Palpiteiro</h1>
      <p className="mt-3 max-w-sm text-base leading-relaxed text-stone-600">
        Palpites entre amigos no beach tennis. Sem dinheiro — só diversão, rivalidade saudável e
        ranking na quadra.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        {user ? (
          <Link route="groups.index" className={buttonClassName('primary', 'lg', true)}>
            <Users className="h-5 w-5" />
            Minhas Plays
          </Link>
        ) : (
          <>
            <Link route="session.create" className={buttonClassName('primary', 'lg', true)}>
              Entrar
            </Link>
            <Link route="new_account.create" className={buttonClassName('secondary', 'lg', true)}>
              Criar conta
            </Link>
          </>
        )}
      </div>

      <ul className="mt-10 grid w-full gap-3 text-left text-sm text-stone-600">
        <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <strong className="text-stone-900">1.</strong> Crie ou entre em uma Play com código de
          convite
        </li>
        <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <strong className="text-stone-900">2.</strong> Cadastre a partida 2x2 na hora
        </li>
        <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <strong className="text-stone-900">3.</strong> Palpite na dupla vencedora e suba no ranking
        </li>
      </ul>
    </div>
  )
}
