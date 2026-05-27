import { cn, statusLabel, statusVariant, type MatchStatus } from '~/lib/match'

const variantStyles = {
  open: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  live: 'bg-amber-50 text-amber-800 ring-amber-200',
  done: 'bg-stone-100 text-stone-600 ring-stone-200',
}

type Props = {
  status: string
  className?: string
}

export default function Badge({ status, className }: Props) {
  const variant = statusVariant(status)
  const label = statusLabel[status as MatchStatus] || status

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        variantStyles[variant],
        className
      )}
    >
      {label}
    </span>
  )
}
