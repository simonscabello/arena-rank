import { Form, Link } from '@adonisjs/inertia/react'
import { Plus, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import Card from '~/components/Card'
import EmptyState from '~/components/EmptyState'
import Input from '~/components/Input'
import PageHeader from '~/components/PageHeader'
import { buttonClassName } from '~/lib/button_styles'
import { cn } from '~/lib/match'

type GroupItem = {
  id: number
  name: string
  inviteCode: string
}

type Props = {
  groups: GroupItem[]
}

export default function GroupsIndex({ groups }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

  return (
    <>
      <PageHeader
        title="Plays"
        subtitle="Suas Plays de beach tennis"
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowJoin(false)
                setShowCreate(!showCreate)
              }}
              className={cn(
                buttonClassName(showCreate ? 'secondary' : 'primary', 'sm'),
                'shrink-0'
              )}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">{showCreate ? 'Fechar' : 'Novo'}</span>
            </button>
          </div>
        }
      />

      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            setShowCreate(false)
            setShowJoin(!showJoin)
          }}
          className={buttonClassName('secondary', 'md', true)}
        >
          <UserPlus className="h-4 w-4" />
          {showJoin ? 'Cancelar' : 'Entrar com código'}
        </button>
      </div>

      {showCreate && (
        <Card className="mb-4">
          <Form route="groups.store" className="space-y-4">
            {({ errors }) => (
              <>
                <Input
                  label="Nome da Play"
                  name="name"
                  id="name"
                  placeholder="Ex: Play da terça"
                  error={errors.name}
                />
                <button type="submit" className={buttonClassName('primary', 'md', true)}>
                  Criar Play
                </button>
              </>
            )}
          </Form>
        </Card>
      )}

      {showJoin && (
        <Card className="mb-4">
          <Form route="groups.join" className="space-y-4">
            {({ errors }) => (
              <>
                <Input
                  label="Código de convite"
                  name="inviteCode"
                  id="inviteCode"
                  maxLength={6}
                  placeholder="ABC123"
                  className="uppercase"
                  error={errors.inviteCode}
                />
                <button type="submit" className={buttonClassName('primary', 'md', true)}>
                  Entrar na Play
                </button>
              </>
            )}
          </Form>
        </Card>
      )}

      {groups.length === 0 && !showCreate && !showJoin ? (
        <EmptyState
          icon={Users}
          title="Nenhuma Play ainda"
          description="Crie uma Play ou entre com um código de convite."
        />
      ) : (
        <ul className="space-y-3">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                route="groups.show"
                routeParams={{ id: group.id }}
                className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md active:scale-[0.99]"
              >
                <div>
                  <p className="font-semibold text-stone-900">{group.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-stone-500">{group.inviteCode}</p>
                </div>
                <span className="text-brand-600">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
