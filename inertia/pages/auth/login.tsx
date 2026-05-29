import { Form, Link } from '@adonisjs/inertia/react'
import Input from '~/components/Input'
import Logo from '~/components/Logo'
import PasswordInput from '~/components/PasswordInput'
import { buttonClassName } from '~/lib/button_styles'

export default function Login() {
  return (
    <div className="mx-auto w-full max-w-sm py-4">
      <div className="mb-8 text-center">
        <Logo className="mx-auto mb-4 h-16 w-16" />
        <h1 className="text-2xl font-bold text-stone-900">Entrar</h1>
        <p className="mt-2 text-sm text-stone-500">Acesse sua conta para palpitar com os amigos</p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <Form route="session.store" className="space-y-4">
          {({ errors }) => (
            <>
              <Input
                label="Email"
                type="email"
                name="email"
                id="email"
                autoComplete="username"
                error={errors.email}
              />
              <PasswordInput
                label="Senha"
                name="password"
                id="password"
                autoComplete="current-password"
                error={errors.password}
              />
              <button type="submit" className={buttonClassName('primary', 'lg', true)}>
                Entrar
              </button>
            </>
          )}
        </Form>
      </div>

      <p className="mt-6 text-center text-sm text-stone-500">
        Não tem conta?{' '}
        <Link route="new_account.create" className="font-medium text-brand-600 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  )
}
