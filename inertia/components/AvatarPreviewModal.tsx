import { useEffect } from 'react'
import { X } from 'lucide-react'
import Avatar from '~/components/Avatar'
import { buttonClassName } from '~/lib/button_styles'

type Props = {
  open: boolean
  onClose: () => void
  initials: string
  src?: string | null
  frameSrc?: string | null
  photoInset?: number
  name?: string
  title?: string
  subtitle?: string
  avatarSize?: 'xl' | '2xl' | 'preview'
}

export default function AvatarPreviewModal({
  open,
  onClose,
  initials,
  src,
  frameSrc,
  photoInset,
  name,
  title,
  subtitle,
  avatarSize = 'preview',
}: Props) {
  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const heading = title ?? (name ? name : 'Foto de perfil')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-preview-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="avatar-preview-title" className="text-lg font-semibold text-stone-900">
              {heading}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-center py-6">
          <Avatar
            initials={initials}
            src={src}
            frameSrc={frameSrc}
            photoInset={photoInset}
            size={avatarSize}
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className={buttonClassName('secondary', 'md', true)}
        >
          Fechar
        </button>
      </div>
    </div>
  )
}
