import { Data } from '@generated/data'
import { Form, Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { Home, Trophy, Users, LogOut } from 'lucide-react'
import { ReactElement, useEffect, useRef } from 'react'
import { toast, Toaster } from 'sonner'
import Avatar from '~/components/Avatar'
import { APP_NAME } from '~/lib/app_name'
import { cn } from '~/lib/match'

type NavKey = 'home' | 'plays' | 'ranking' | 'profile'

function isNavActive(url: string, key: NavKey) {
  const path = url.split('?')[0]
  switch (key) {
    case 'home':
      return path === '/'
    case 'plays':
      return path.startsWith('/grupos') || path.startsWith('/partidas')
    case 'ranking':
      return path.startsWith('/ranking')
    case 'profile':
      return path.startsWith('/perfil') || path.startsWith('/historico')
  }
}

function desktopNavClass(active: boolean) {
  return cn(
    'hidden rounded-lg px-3 py-2 text-sm font-medium sm:inline',
    active ? 'bg-brand-50 text-brand-700' : 'text-stone-600 hover:bg-stone-100'
  )
}

function mobileNavClass(active: boolean) {
  return cn(
    'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[11px] font-medium',
    active ? 'text-brand-600' : 'text-stone-500 hover:text-brand-600'
  )
}

export default function Layout({ children }: { children: ReactElement<Data.SharedProps> }) {
  const page = usePage()
  const flash = children.props.flash
  const lastFlash = useRef({ error: '', success: '' })

  useEffect(() => {
    toast.dismiss()
  }, [page.url])

  useEffect(() => {
    if (flash.error && flash.error !== lastFlash.current.error) {
      toast.error(flash.error)
      lastFlash.current.error = flash.error
    }
    if (flash.success && flash.success !== lastFlash.current.success) {
      toast.success(flash.success)
      lastFlash.current.success = flash.success
    }
  }, [flash.error, flash.success])

  const user = children.props.user
  const url = page.url

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <Link route="home" className="text-lg font-bold tracking-tight text-brand-700">
            {APP_NAME}
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Link route="groups.index" className={desktopNavClass(isNavActive(url, 'plays'))}>
                  Plays
                </Link>
                <Link route="ranking.index" className={desktopNavClass(isNavActive(url, 'ranking'))}>
                  Ranking
                </Link>
                <Link
                  route="profile.show"
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                    isNavActive(url, 'profile')
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-stone-600 hover:bg-stone-100'
                  )}
                >
                  <Avatar
                    initials={user.initials}
                    src={user.avatarUrl}
                    size="sm"
                    frameSrc={user.avatarFrameSrc}
                    photoInset={user.avatarFrameInset}
                    reserveFrameSlot
                    slotInset={user.avatarFrameInset}
                  />
                  <span className="text-sm font-medium">Perfil</span>
                </Link>
                <Form route="session.destroy">
                  <button
                    type="submit"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100"
                    aria-label="Sair"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </Form>
              </>
            ) : (
              <Link
                route="session.create"
                className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className={user ? 'flex-1 px-4 py-6 pb-24' : 'flex-1 px-4 py-6'}>{children}</main>

      {user && (
        <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 border-t border-stone-200 bg-white/95 px-2 py-2 backdrop-blur-md sm:hidden">
          <div className="flex justify-around gap-0.5">
            <Link route="home" className={mobileNavClass(isNavActive(url, 'home'))}>
              <Home className="h-5 w-5 shrink-0" />
              Início
            </Link>
            <Link route="groups.index" className={mobileNavClass(isNavActive(url, 'plays'))}>
              <Users className="h-5 w-5 shrink-0" />
              Plays
            </Link>
            <Link route="ranking.index" className={mobileNavClass(isNavActive(url, 'ranking'))}>
              <Trophy className="h-5 w-5 shrink-0" />
              Ranking
            </Link>
            <Link
              route="profile.show"
              aria-label="Meu perfil"
              className={mobileNavClass(isNavActive(url, 'profile'))}
            >
              <Avatar
                initials={user.initials}
                src={user.avatarUrl}
                size="sm"
                frameSrc={user.avatarFrameSrc}
                photoInset={user.avatarFrameInset}
                reserveFrameSlot
                slotInset={user.avatarFrameInset}
                className="shrink-0"
              />
              Perfil
            </Link>
          </div>
        </nav>
      )}

      <Toaster position="top-center" richColors closeButton />
    </div>
  )
}
