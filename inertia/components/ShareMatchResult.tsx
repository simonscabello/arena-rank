import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import Button from '~/components/Button'
import MatchShareCard, { collectAvatarUrls } from '~/components/MatchShareCard'
import type { MatchShareCardPayload } from '~/lib/match_share_card'
import { pickShareTagline } from '#constants/share_taglines'
import {
  captureNodeToPngBlob,
  copyText,
  downloadBlob,
  preloadImageUrls,
  shareImageWithText,
  waitForNextPaint,
} from '~/lib/share_content'

type Props = {
  shareText: string
  shareCard: MatchShareCardPayload
}

export default function ShareMatchResult({ shareText, shareCard }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState(false)
  const [tagline, setTagline] = useState(pickShareTagline)

  async function generateImage() {
    const node = cardRef.current
    if (!node) {
      throw new Error('Share card not ready')
    }

    await preloadImageUrls(collectAvatarUrls(shareCard))

    return captureNodeToPngBlob(node)
  }

  async function share() {
    const pickedTagline = pickShareTagline()
    flushSync(() => {
      setTagline(pickedTagline)
      setSharing(true)
    })
    await waitForNextPaint()

    const shareMessage = `${shareText}\n\n${pickedTagline}`

    try {
      const blob = await generateImage()
      const file = new File([blob], 'arena-rank-resultado.png', { type: 'image/png' })

      const shared = await shareImageWithText(file, shareMessage)
      if (shared) {
        return
      }

      downloadBlob(blob, 'arena-rank-resultado.png')
      await copyText(shareMessage)
      toast.success('Imagem baixada e texto copiado!')
    } catch {
      try {
        await copyText(shareMessage)
        toast.success('Resultado copiado!')
      } catch {
        toast.error('Não foi possível compartilhar o resultado')
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        <MatchShareCard ref={cardRef} card={shareCard} tagline={tagline} />
      </div>
      <Button variant="secondary" size="md" fullWidth onClick={share} disabled={sharing}>
        <Share2 className="h-4 w-4" />
        {sharing ? 'Gerando imagem...' : 'Compartilhar resultado'}
      </Button>
    </>
  )
}
