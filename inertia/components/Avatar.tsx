import { cn } from '~/lib/match'

type Props = {
  initials: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

export default function Avatar({ initials, src, size = 'md', className }: Props) {
  const sizeClass = sizeClasses[size]

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn('inline-block shrink-0 rounded-full object-cover', sizeClass, className)}
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white',
        sizeClass,
        className
      )}
      aria-hidden
    >
      {initials}
    </span>
  )
}
