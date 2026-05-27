import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  title: string
  description?: string
}

export default function EmptyState({ icon: Icon, title, description }: Props) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-stone-200 bg-stone-50/80 px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <p className="font-medium text-stone-700">{title}</p>
      {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
    </div>
  )
}
