import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import Button from '~/components/Button'

type Props = {
  url: string
}

export default function CopyInviteLink({ url }: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
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
