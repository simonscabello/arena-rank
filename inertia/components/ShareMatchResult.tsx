import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import Button from '~/components/Button'

type Props = {
  shareText: string
}

export default function ShareMatchResult({ shareText }: Props) {
  async function copyToClipboard() {
    await navigator.clipboard.writeText(shareText)
    toast.success('Resultado copiado!')
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
      }
    }

    await copyToClipboard()
  }

  return (
    <Button variant="secondary" size="md" fullWidth onClick={share}>
      <Share2 className="h-4 w-4" />
      Compartilhar resultado
    </Button>
  )
}
