type Props = {
  icon: string
  title?: string
  showLabel?: boolean
}

export default function ProfileBadge({ icon, title, showLabel = true }: Props) {
  return (
    <span
      className={
        showLabel
          ? 'inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs'
          : 'inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-50 px-1 text-xs'
      }
      title={title}
    >
      <span aria-hidden>{icon}</span>
      {showLabel && title && <span className="font-medium text-brand-800">{title}</span>}
    </span>
  )
}
