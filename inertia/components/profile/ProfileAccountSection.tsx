import { Form } from '@adonisjs/inertia/react'
import Card from '~/components/Card'
import Input from '~/components/Input'
import { buttonClassName } from '~/lib/button_styles'

type Props = {
  account: {
    fullName: string | null
    email: string
  }
}

export default function ProfileAccountSection({ account }: Props) {
  return (
    <Card title="Dados da conta">
      <Form route="profile.updateAccount" className="space-y-4">
        {({ errors }) => (
          <>
            <Input
              label="Nome"
              type="text"
              name="fullName"
              id="accountFullName"
              defaultValue={account.fullName ?? ''}
              error={errors.fullName}
            />
            <div className="space-y-1.5">
              <Input
                label="Email"
                type="email"
                name="email"
                id="accountEmail"
                autoComplete="email"
                defaultValue={account.email}
                error={errors.email}
              />
              <p className="text-xs text-stone-500">Vinculado à sua conta Google</p>
            </div>
            <button type="submit" className={buttonClassName('primary', 'lg', true)}>
              Salvar conta
            </button>
          </>
        )}
      </Form>
    </Card>
  )
}
