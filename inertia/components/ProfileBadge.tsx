type Props = {
  icon: string
  title?: string
}

export default function ProfileBadge({ icon, title }: Props) {
  return (
    <span
      className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-50 px-1 text-xs"
      title={title}
      aria-hidden={!title}
    >
      {icon}
    </span>
  )
}
