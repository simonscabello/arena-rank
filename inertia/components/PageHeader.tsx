import { cn } from '~/lib/match'

type Props = {
  title: string
  subtitle?: React.ReactNode
  back?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export default function PageHeader({ title, subtitle, back, action, className }: Props) {
  return (
    <header className={cn('mb-6', className)}>
      {back && <div className="mb-3">{back}</div>}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">{title}</h1>
          {subtitle && <div className="mt-1 text-sm text-stone-500">{subtitle}</div>}
        </div>
        {action}
      </div>
    </header>
  )
}
