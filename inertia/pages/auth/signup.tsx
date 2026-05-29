import { Form, Link } from '@adonisjs/inertia/react'
import Input from '~/components/Input'
import Logo from '~/components/Logo'
import PasswordInput from '~/components/PasswordInput'
import { buttonClassName } from '~/lib/button_styles'

export default function Signup() {
  return (
    <div className="mx-auto w-full max-w-sm py-4">
      <div className="mb-8 text-center">
        <Logo className="mx-auto mb-4 h-16 w-16" />
        <h1 className="text-2xl font-bold text-stone-900">Cadastrar</h1>
        <p className="mt-2 text-sm text-stone-500">Crie sua conta para participar dos palpites</p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <Form route="new_account.store" className="space-y-4">
          {({ errors }) => (
            <>
              <Input
                label="Nome"
                type="text"
                name="fullName"
                id="fullName"
                error={errors.fullName}
              />
              <div className="space-y-1.5">
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  error={errors.email}
                />
                <p className="text-xs text-stone-500">Será usado para fazer login no app</p>
              </div>
              <div className="space-y-1.5">
                <PasswordInput
                  label="Senha"
                  name="password"
                  id="password"
                  autoComplete="new-password"
                  error={errors.password}
                />
                <p className="text-xs text-stone-500">Entre 8 e 32 caracteres</p>
              </div>
              <PasswordInput
                label="Confirmar senha"
                name="passwordConfirmation"
                id="passwordConfirmation"
                autoComplete="new-password"
                error={errors.passwordConfirmation}
              />
              <button type="submit" className={buttonClassName('primary', 'lg', true)}>
                Cadastrar
              </button>
            </>
          )}
        </Form>
      </div>

      <p className="mt-6 text-center text-sm text-stone-500">
        Já tem conta?{' '}
        <Link route="session.create" className="font-medium text-brand-600 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
