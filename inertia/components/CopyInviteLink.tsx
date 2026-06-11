import { Copy, Check, Share2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import Button from '~/components/Button'
import { APP_NAME } from '~/lib/app_name'
import { buttonClassName } from '~/lib/button_styles'

type Props = {
  url: string
  groupName?: string
  variant?: 'full' | 'compact'
}

export default function CopyInviteLink({ url, groupName, variant = 'full' }: Props) {
  const [copied, setCopied] = useState(false)

  function buildShareText() {
    const target = groupName ? `na Play "${groupName}"` : 'na minha Play'
    return `Bora jogar? Entra ${target} no ${APP_NAME}: ${url}`
  }

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  async function share() {
    const text = buildShareText()

    if (navigator.share) {
      try {
        await navigator.share({ text })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
      }
    }

    await navigator.clipboard.writeText(text)
    toast.success('Convite copiado!')
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={share}
        className={buttonClassName('ghost', 'sm')}
        aria-label="Convidar jogadores"
      >
        <Share2 className="h-4 w-4" />
        Convidar
      </button>
    )
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-stone-600">Link de convite</p>
      <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
        <span className="flex-1 truncate text-sm text-stone-700">{url}</span>
        <Button variant="secondary" size="sm" onClick={copy} aria-label="Copiar link">
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
