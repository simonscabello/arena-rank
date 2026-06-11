import { Form, Link } from '@adonisjs/inertia/react'
import { Plus, Users } from 'lucide-react'
import { useState } from 'react'
import Card from '~/components/Card'
import EmptyState from '~/components/EmptyState'
import Input from '~/components/Input'
import InstallPwaPrompt from '~/components/InstallPwaPrompt'
import PageHeader from '~/components/PageHeader'
import { buttonClassName } from '~/lib/button_styles'
import { cn } from '~/lib/match'

type GroupItem = {
  id: number
  name: string
  memberCount: number
  matchesThisWeek: number
  lastMatchAt: string | null
  lastMatchLabel: string | null
  userPosition: number | null
}

type Props = {
  groups: GroupItem[]
}

function formatRelativeDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

function groupMeta(group: GroupItem) {
  const parts = [`${group.memberCount} membros`]
  if (group.matchesThisWeek > 0) {
    parts.push(
      `${group.matchesThisWeek} partida${group.matchesThisWeek === 1 ? '' : 's'} esta semana`
    )
  }
  if (group.userPosition) {
    parts.push(`${group.userPosition}º no ranking`)
  }
  return parts.join(' · ')
}

export default function GroupsIndex({ groups }: Props) {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <>
      <PageHeader
        title="Plays"
        subtitle="Suas Plays de beach tennis"
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(!showCreate)}
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

      {groups.length === 0 && !showCreate ? (
        <EmptyState
          icon={Users}
          title="Nenhuma Play ainda"
          description="Crie uma Play ou peça um link de convite."
        />
      ) : (
        <ul className="space-y-3">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                route="groups.show"
                routeParams={{ id: group.id }}
                className="flex flex-col gap-1 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-stone-900">{group.name}</p>
                  <span className="text-brand-600">→</span>
                </div>
                <p className="text-sm text-stone-500">{groupMeta(group)}</p>
                {group.lastMatchLabel && group.lastMatchAt && (
                  <p className="truncate text-xs text-stone-400">
                    Última: {group.lastMatchLabel} · {formatRelativeDate(group.lastMatchAt)}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <InstallPwaPrompt />
      </div>
    </>
  )
}
