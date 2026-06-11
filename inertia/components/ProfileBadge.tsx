type Props = {
  icon: string
  title?: string
  showLabel?: boolean
  className?: string
}

export default function ProfileBadge({ icon, title, showLabel = true, className }: Props) {
  return (
    <span
      className={
        showLabel
          ? `inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs ${className ?? ''}`
          : `inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-50 px-1 text-xs ${className ?? ''}`
      }
      title={title}
    >
      <span aria-hidden>{icon}</span>
      {showLabel && title && <span className="font-medium text-brand-800">{title}</span>}
    </span>
  )
}
