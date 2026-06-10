type Props = {
  tier: string
  label: string
}

const tierStyles: Record<string, string> = {
  bronze: 'bg-orange-100 text-orange-800',
  prata: 'bg-stone-200 text-stone-700',
  ouro: 'bg-amber-100 text-amber-800',
  diamante: 'bg-sky-100 text-sky-800',
  mestre: 'bg-violet-100 text-violet-800',
}

export default function EloTierBadge({ tier, label }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tierStyles[tier] ?? 'bg-stone-100 text-stone-700'}`}
    >
      {label}
    </span>
  )
}
