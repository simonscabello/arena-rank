import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '~/lib/match'

type Props = {
  children: ReactNode
  defaultOpen?: boolean
}

export default function MatchAdminSection({ children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="mb-6 rounded-2xl border border-stone-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-sm font-semibold text-stone-900">Gestão da partida</h2>
          <p className="mt-0.5 text-xs text-stone-500">
            Iniciar, registrar resultado ou corrigir a partida
          </p>
        </div>
        <ChevronDown
          className={cn('h-5 w-5 shrink-0 text-stone-400 transition', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="space-y-4 border-t border-stone-100 px-4 pb-4 pt-4">{children}</div>
      )}
    </section>
  )
}
