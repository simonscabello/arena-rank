import { Link } from '@adonisjs/inertia/react'
import { FileQuestion } from 'lucide-react'
import { buttonClassName } from '~/lib/button_styles'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-xl font-bold text-stone-900">Página não encontrada</h1>
      <p className="mt-2 text-sm text-stone-500">O endereço que você acessou não existe.</p>
      <Link route="home" className={buttonClassName('primary', 'md') + ' mt-6'}>
        Voltar ao início
      </Link>
    </div>
  )
}
