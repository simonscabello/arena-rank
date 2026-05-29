import { cn } from '~/lib/match'

type Props = {
  children: React.ReactNode
  className?: string
  title?: string
  action?: React.ReactNode
}

export default function Card({ children, className, title, action }: Props) {
  return (
    <section
      className={cn('rounded-2xl border border-stone-200 bg-white p-4 shadow-sm', className)}
    >
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="text-sm font-semibold text-stone-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
