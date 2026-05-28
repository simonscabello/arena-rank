import { cn } from '~/lib/match'

type Props = {
  initials: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'preview'
  className?: string
  frameSrc?: string | null
  photoInset?: number
}

const SIZE_PX = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 80,
  '2xl': 112,
  preview: 160,
} as const

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
  '2xl': 'text-xl',
  preview: 'text-2xl',
}

const DEFAULT_PHOTO_INSET = 18

export default function Avatar({
  initials,
  src,
  size = 'md',
  className,
  frameSrc,
  photoInset = DEFAULT_PHOTO_INSET,
}: Props) {
  const boxPx = SIZE_PX[size]
  const textSize = textSizeClasses[size]
  const inset = Math.min(Math.max(photoInset, 0), 40)
  const photoSizePercent = 100 - inset * 2

  if (!frameSrc) {
    if (src) {
      return (
        <img
          src={src}
          alt=""
          className={cn('inline-block shrink-0 rounded-full object-cover', className)}
          style={{ width: boxPx, height: boxPx }}
        />
      )
    }
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white',
          textSize,
          className
        )}
        style={{ width: boxPx, height: boxPx }}
        aria-hidden
      >
        {initials}
      </span>
    )
  }

  return (
    <span
      className={cn('relative inline-block shrink-0', className)}
      style={{ width: boxPx, height: boxPx }}
    >
      <span
        className="absolute overflow-hidden rounded-full bg-brand-600"
        style={{
          left: `${inset}%`,
          top: `${inset}%`,
          width: `${photoSizePercent}%`,
          height: `${photoSizePercent}%`,
        }}
      >
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span
            className={cn(
              'flex h-full w-full items-center justify-center font-semibold text-white',
              textSize
            )}
            aria-hidden
          >
            {initials}
          </span>
        )}
      </span>
      <img
        src={frameSrc}
        alt=""
        className="pointer-events-none absolute left-0 top-0 z-10 h-full w-full object-cover"
        aria-hidden
      />
    </span>
  )
}
