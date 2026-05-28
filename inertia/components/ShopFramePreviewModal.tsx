import { useEffect } from 'react'
import { X } from 'lucide-react'
import Avatar from '~/components/Avatar'
import { buttonClassName } from '~/lib/button_styles'

type Props = {
  open: boolean
  name: string
  frameSrc: string
  photoInset: number
  avatarUrl: string | null
  initials: string
  onClose: () => void
}

export default function ShopFramePreviewModal({
  open,
  name,
  frameSrc,
  photoInset,
  avatarUrl,
  initials,
  onClose,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="frame-preview-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="frame-preview-title" className="text-lg font-semibold text-stone-900">
              Prévia: {name}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Assim aparece no ranking e no seu perfil
            </p>
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
            src={avatarUrl}
            frameSrc={frameSrc}
            photoInset={photoInset}
            size="xl"
          />
        </div>

        <button type="button" onClick={onClose} className={buttonClassName('secondary', 'md', true)}>
          Fechar
        </button>
      </div>
    </div>
  )
}
