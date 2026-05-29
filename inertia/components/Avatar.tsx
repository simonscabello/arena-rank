import { cn } from '~/lib/match'

const SIZE_PX = {
  'sm': 32,
  'md': 40,
  'lg': 48,
  'xl': 80,
  '2xl': 112,
  'preview': 160,
} as const

const DEFAULT_PHOTO_INSET = 18

export type AvatarSize = keyof typeof SIZE_PX

function frameOuterSize(photoPx: number, photoInset: number) {
  const inset = Math.min(Math.max(photoInset, 0), 49)
  const innerPhotoRatio = 1 - (inset * 2) / 100
  if (innerPhotoRatio <= 0) return photoPx
  return photoPx / innerPhotoRatio
}

export function avatarSlotSize(size: AvatarSize, photoInset = DEFAULT_PHOTO_INSET) {
  return frameOuterSize(SIZE_PX[size], photoInset)
}

type Props = {
  initials: string
  src?: string | null
  size?: AvatarSize
  className?: string
  frameSrc?: string | null
  photoInset?: number
  reserveFrameSlot?: boolean
  slotInset?: number
}

const textSizeClasses = {
  'sm': 'text-xs',
  'md': 'text-sm',
  'lg': 'text-base',
  'xl': 'text-lg',
  '2xl': 'text-xl',
  'preview': 'text-2xl',
}

function wrapInFrameSlot(node: React.ReactNode, slotPx: number, className?: string) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: slotPx, height: slotPx }}
    >
      {node}
    </span>
  )
}

export default function Avatar({
  initials,
  src,
  size = 'md',
  className,
  frameSrc,
  photoInset = DEFAULT_PHOTO_INSET,
  reserveFrameSlot = false,
  slotInset = DEFAULT_PHOTO_INSET,
}: Props) {
  const photoPx = SIZE_PX[size]
  const textSize = textSizeClasses[size]
  const reservedSlotPx = reserveFrameSlot ? avatarSlotSize(size, slotInset) : null

  if (!frameSrc) {
    const avatar = src ? (
      <img
        src={src}
        alt=""
        className={cn('inline-block shrink-0 rounded-full object-cover', className)}
        style={{ width: photoPx, height: photoPx }}
      />
    ) : (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white',
          textSize,
          className
        )}
        style={{ width: photoPx, height: photoPx }}
        aria-hidden
      >
        {initials}
      </span>
    )

    if (reservedSlotPx !== null) {
      return wrapInFrameSlot(avatar, reservedSlotPx)
    }

    return avatar
  }

  const framePx = frameOuterSize(photoPx, photoInset)
  const photoOffset = (framePx - photoPx) / 2
  const framedAvatar = (
    <span
      className={cn('relative inline-block shrink-0', className)}
      style={{ width: framePx, height: framePx }}
    >
      <span
        className="absolute overflow-hidden rounded-full bg-brand-600"
        style={{
          left: photoOffset,
          top: photoOffset,
          width: photoPx,
          height: photoPx,
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

  if (reservedSlotPx !== null && framePx !== reservedSlotPx) {
    return wrapInFrameSlot(framedAvatar, reservedSlotPx)
  }

  return framedAvatar
}
