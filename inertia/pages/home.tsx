import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { Users } from 'lucide-react'
import InstallPwaPrompt from '~/components/InstallPwaPrompt'
import Logo from '~/components/Logo'
import { buttonClassName } from '~/lib/button_styles'

export default function Home() {
  const { user } = usePage().props as { user?: { initials: string } }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col py-8">
      <div className="flex flex-col items-center text-center">
        <Logo className="mb-5 h-36 w-36" />
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Palpiteiro</h1>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          O app onde amizade vale menos que posição no ranking. Seu grupo nunca mais terá uma
          convivência esportivamente saudável.
        </p>
      </div>

      {user && (
        <div className="mt-6">
          <InstallPwaPrompt />
        </div>
      )}

      <div className="mt-6 flex w-full flex-col gap-3">
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

      <ul className="mt-10 grid w-full gap-3 text-sm text-stone-600">
        <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <strong className="text-stone-900">1.</strong> Crie uma Play ou entre via link de convite
        </li>
        <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <strong className="text-stone-900">2.</strong> Cadastre a partida 2x2 na hora
        </li>
        <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <strong className="text-stone-900">3.</strong> Palpite na dupla vencedora e suba no
          ranking
        </li>
      </ul>
    </div>
  )
}
