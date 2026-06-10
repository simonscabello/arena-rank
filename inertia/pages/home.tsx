import { Link } from '@adonisjs/inertia/react'
import Logo from '~/components/Logo'
import { APP_NAME } from '~/lib/app_name'
import { buttonClassName } from '~/lib/button_styles'

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col py-8">
      <div className="flex flex-col items-center text-center">
        <Logo className="mb-5 h-36 w-36" />
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">{APP_NAME}</h1>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          Partidas de beach tennis, ranking da galera e evolução de quem joga de verdade.
        </p>
      </div>

      <div className="mt-6 flex w-full flex-col gap-3">
        <Link route="session.create" className={buttonClassName('primary', 'lg', true)}>
          Entrar
        </Link>
        <Link route="new_account.create" className={buttonClassName('secondary', 'lg', true)}>
          Criar conta
        </Link>
      </div>

      <ul className="mt-10 grid w-full gap-3 text-sm text-stone-600">
        <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <strong className="text-stone-900">1.</strong> Crie uma Play ou entre via link de convite
        </li>
        <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <strong className="text-stone-900">2.</strong> Cadastre a partida 2x2 na hora
        </li>
        <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <strong className="text-stone-900">3.</strong> Registre os resultados, suba no ranking e
          acompanhe a evolução dos jogadores
        </li>
      </ul>
    </div>
  )
}
