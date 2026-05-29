import { Smartphone, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { buttonClassName } from '~/lib/button_styles'
import {
  type BeforeInstallPromptEvent,
  canShowInstallPrompt,
  dismissInstallPrompt,
  isDesktopInstallContext,
  isIosInstallContext,
} from '~/lib/pwa_install'

export default function InstallPwaPrompt() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const [hasDeferredPrompt, setHasDeferredPrompt] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const isIos = isIosInstallContext()
  const isDesktop = isDesktopInstallContext()

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      deferredPromptRef.current = event as BeforeInstallPromptEvent
      setHasDeferredPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  useEffect(() => {
    setVisible(canShowInstallPrompt(hasDeferredPrompt))
  }, [hasDeferredPrompt])

  function handleDismiss() {
    dismissInstallPrompt()
    setVisible(false)
    setShowIosHelp(false)
  }

  async function handleInstall() {
    if (isIos) {
      setShowIosHelp(true)
      return
    }

    const promptEvent = deferredPromptRef.current
    if (!promptEvent) return

    await promptEvent.prompt()
    await promptEvent.userChoice
    deferredPromptRef.current = null
    setHasDeferredPrompt(false)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <div className="w-full rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
        <div className="flex items-start gap-3 text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-stone-900">Instalar o Palpiteiro</p>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              {isIos
                ? 'Acesse mais rápido pela tela inicial do iPhone.'
                : isDesktop
                  ? 'Abra direto pelo atalho do navegador ou da área de trabalho, como um app.'
                  : 'Acesse mais rápido pela tela inicial do celular, como um app.'}
            </p>
          </div>
        </div>
        <div className="mt-4 flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className={buttonClassName('primary', 'md', true)}
          >
            Instalar app
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className={buttonClassName('ghost', 'sm', true, 'text-stone-500')}
          >
            Agora não
          </button>
        </div>
      </div>

      {showIosHelp && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 id="ios-install-title" className="text-lg font-semibold text-stone-900">
                Instalar no iPhone
              </h2>
              <button
                type="button"
                onClick={() => setShowIosHelp(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-stone-700">
              <li>Toque em Compartilhar na barra do Safari</li>
              <li>Role e escolha Adicionar à Tela de Início</li>
              <li>Confirme em Adicionar</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosHelp(false)}
              className={`mt-4 ${buttonClassName('primary', 'md', true)}`}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  )
}
