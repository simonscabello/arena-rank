import { toBlob } from 'html-to-image'

const SHARE_CARD_BACKGROUND = '#f4f7fa'

export function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

export async function captureNodeToPngBlob(
  node: HTMLElement,
  backgroundColor = SHARE_CARD_BACKGROUND
): Promise<Blob> {
  await document.fonts.ready

  const sandbox = document.createElement('div')
  sandbox.setAttribute('aria-hidden', 'true')
  Object.assign(sandbox.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '-9999',
  })

  const clone = node.cloneNode(true) as HTMLElement
  Object.assign(clone.style, {
    position: 'relative',
    visibility: 'visible',
    opacity: '1',
    left: 'auto',
    top: 'auto',
    zIndex: 'auto',
  })

  sandbox.appendChild(clone)
  document.body.appendChild(sandbox)

  await waitForNextPaint()

  const width = clone.offsetWidth || node.offsetWidth
  const height = clone.offsetHeight || node.offsetHeight

  try {
    const blob = await toBlob(clone, {
      width,
      height,
      backgroundColor,
      pixelRatio: 1,
      cacheBust: true,
      skipFonts: false,
    })

    if (!blob) {
      throw new Error('Failed to render share image')
    }

    return blob
  } finally {
    sandbox.remove()
  }
}

export async function preloadImageUrls(urls: string[]) {
  const unique = [...new Set(urls.filter(Boolean))]

  await Promise.all(
    unique.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          if (url.startsWith('http') && !url.startsWith(window.location.origin)) {
            img.crossOrigin = 'anonymous'
          }
          img.onload = () => {
            void img
              .decode()
              .then(() => resolve())
              .catch(() => resolve())
          }
          img.onerror = () => resolve()
          img.src = url
        })
    )
  )
}

export async function shareImageWithText(file: File, text: string): Promise<boolean> {
  if (!navigator.share) {
    return false
  }

  const shareData: ShareData = { text }

  if (navigator.canShare?.({ files: [file] })) {
    shareData.files = [file]
  }

  try {
    await navigator.share(shareData)
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return true
    }
    return false
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
}
