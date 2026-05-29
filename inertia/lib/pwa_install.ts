export const PWA_INSTALL_DISMISS_KEY = 'palpiteiro_pwa_install_dismissed'

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function isPwaInstalled() {
  if (typeof window === 'undefined') return false

  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }

  const nav = navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true
}

export function isIosInstallContext() {
  if (typeof navigator === 'undefined') return false

  const ua = navigator.userAgent
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (!isIos) return false

  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)
  return isSafari
}

export function isInstallDismissed() {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(PWA_INSTALL_DISMISS_KEY) === '1'
}

export function dismissInstallPrompt() {
  localStorage.setItem(PWA_INSTALL_DISMISS_KEY, '1')
}

export function isDesktopInstallContext() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(min-width: 640px)').matches
}

export function canShowInstallPrompt(hasDeferredPrompt: boolean) {
  if (isPwaInstalled() || isInstallDismissed()) return false
  if (isIosInstallContext()) return true
  return hasDeferredPrompt
}
