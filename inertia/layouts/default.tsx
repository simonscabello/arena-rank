import { Data } from '@generated/data'
import { Form, Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { Home, History, ShoppingBag, UserCircle, Users, LogOut } from 'lucide-react'
import { ReactElement, useEffect, useRef } from 'react'
import { toast, Toaster } from 'sonner'
import Avatar from '~/components/Avatar'

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

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <Link route="home" className="text-lg font-bold tracking-tight text-brand-700">
            Palpiteiro
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  route="groups.index"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 sm:inline"
                >
                  Plays
                </Link>
                <Link
                  route="history.show"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 sm:inline"
                >
                  Histórico
                </Link>
                <Link
                  route="shop.index"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 sm:inline"
                >
                  Loja
                </Link>
                <Link
                  route="profile.show"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 sm:inline"
                >
                  Perfil
                </Link>
                <Avatar
                  initials={user.initials}
                  src={user.avatarUrl}
                  size="sm"
                  frameSrc={user.avatarFrameSrc}
                  photoInset={user.avatarFrameInset}
                />
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
              <>
                <Link
                  route="session.create"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
                >
                  Entrar
                </Link>
                <Link
                  route="new_account.create"
                  className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className={user ? 'flex-1 px-4 py-6 pb-24' : 'flex-1 px-4 py-6'}>{children}</main>

      {user && (
        <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 border-t border-stone-200 bg-white/95 px-6 py-2 backdrop-blur-md sm:hidden">
          <div className="flex justify-around">
            <Link
              route="home"
              className="flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 text-xs font-medium text-stone-500 hover:text-brand-600 data-[current]:text-brand-600"
            >
              <Home className="h-5 w-5" />
              Início
            </Link>
            <Link
              route="groups.index"
              className="flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 text-xs font-medium text-stone-500 hover:text-brand-600"
            >
              <Users className="h-5 w-5" />
              Plays
            </Link>
            <Link
              route="shop.index"
              className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium text-stone-500 hover:text-brand-600"
            >
              <ShoppingBag className="h-5 w-5" />
              Loja
            </Link>
            <Link
              route="profile.show"
              className="flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 text-xs font-medium text-stone-500 hover:text-brand-600"
            >
              <UserCircle className="h-5 w-5" />
              Perfil
            </Link>
          </div>
        </nav>
      )}

      <Toaster position="top-center" richColors closeButton />
    </div>
  )
}
