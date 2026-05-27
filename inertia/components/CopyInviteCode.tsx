import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import Button from '~/components/Button'

type Props = {
  code: string
}

export default function CopyInviteCode({ code }: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Código copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
      <span className="flex-1 font-mono text-lg font-bold tracking-widest text-brand-700">{code}</span>
      <Button variant="secondary" size="sm" onClick={copy} aria-label="Copiar código">
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}
