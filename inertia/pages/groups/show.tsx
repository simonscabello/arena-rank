import { Form, Link } from '@adonisjs/inertia/react'
import { Pencil, Plus, Trophy, X } from 'lucide-react'
import { useState } from 'react'
import BackLink from '~/components/BackLink'
import Card from '~/components/Card'
import CopyInviteLink from '~/components/CopyInviteLink'
import EmptyState from '~/components/EmptyState'
import EloRankingHint from '~/components/EloRankingHint'
import Input from '~/components/Input'
import RankingList, { type RankingEntry } from '~/components/RankingList'
import { buttonClassName } from '~/lib/button_styles'

type RecentMatchItem = {
  id: number
  playersLabel: string
  arenaName: string
  scoreLabel: string | null
  playedAt: string
}

type Props = {
  group: { id: number; name: string; inviteUrl: string }
  activitySummary: {
    matchesThisWeek: number
    activePlayersThisWeek: number
    leaderName: string | null
    leaderElo: number | null
  }
  members: RankingEntry[]
  recentMatches: RecentMatchItem[]
  ranking: RankingEntry[]
  currentUserId: number
  canManageGroup: boolean
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export default function GroupShow({
  group,
  activitySummary,
  members,
  recentMatches,
  ranking,
  currentUserId,
  canManageGroup,
}: Props) {
  const [isEditingName, setIsEditingName] = useState(false)

  return (
    <>
      <div className="mb-6">
        <BackLink route="groups.index" label="Plays" />
      </div>

      <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        {isEditingName ? (
          <Form
            route="groups.update"
            routeParams={{ id: group.id }}
            className="space-y-4"
            onSuccess={() => setIsEditingName(false)}
          >
            {({ errors }) => (
              <>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-stone-700">Editar nome</p>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
                    aria-label="Cancelar edição"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Input
                  label="Nome da Play"
                  name="name"
                  id="group-name"
                  defaultValue={group.name}
                  required
                  minLength={2}
                  maxLength={100}
                  error={errors.name}
                />
                <button type="submit" className={buttonClassName('primary', 'md', true)}>
                  Salvar
                </button>
              </>
            )}
          </Form>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate font-semibold text-stone-900">{group.name}</p>
            {canManageGroup && (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="shrink-0 rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-brand-600"
                aria-label="Editar nome da Play"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-6 space-y-4">
        <CopyInviteLink url={group.inviteUrl} />
        <Link
          route="groups.matches.create"
          routeParams={{ id: group.id }}
          className={buttonClassName('primary', 'lg', true)}
        >
          <Plus className="h-5 w-5" />
          Nova partida
        </Link>
      </div>

      <div className="space-y-6">
        <Card title="Esta semana">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-brand-700">{activitySummary.matchesThisWeek}</p>
              <p className="text-xs text-stone-500">Partidas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">
                {activitySummary.activePlayersThisWeek}
              </p>
              <p className="text-xs text-stone-500">Jogadores ativos</p>
            </div>
          </div>
          {activitySummary.leaderName && activitySummary.leaderElo !== null && (
            <p className="mt-3 text-sm text-stone-600">
              Líder: <span className="font-medium text-stone-900">{activitySummary.leaderName}</span>{' '}
              · {activitySummary.leaderElo} ELO
            </p>
          )}
        </Card>

        <Card title="Membros">
          <RankingList entries={members} highlightUserId={currentUserId} groupId={group.id} />
        </Card>

        <Card title="Histórico recente">
          {recentMatches.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Nenhuma partida finalizada ainda"
              description="Crie e finalize uma partida para ver o histórico aqui."
            />
          ) : (
            <>
              <ul className="space-y-2">
                {recentMatches.map((match) => (
                  <li key={match.id}>
                    <Link
                      route="matches.show"
                      routeParams={{ id: match.id }}
                      className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-3 transition hover:border-brand-200 hover:bg-brand-50/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-stone-900">{match.playersLabel}</p>
                        <p className="truncate text-sm text-stone-500">
                          {match.arenaName}
                          {match.scoreLabel ? ` · ${match.scoreLabel}` : ''}
                          {` · ${formatDate(match.playedAt)}`}
                        </p>
                      </div>
                      <span className="text-stone-400">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-center text-sm">
                <Link
                  href={`/historico?groupId=${group.id}`}
                  className="font-medium text-brand-600 hover:underline"
                >
                  Ver meu histórico nesta Play
                </Link>
              </p>
            </>
          )}
        </Card>

        <Card title="Ranking">
          <EloRankingHint className="mb-3" />
          <RankingList entries={ranking} highlightUserId={currentUserId} groupId={group.id} />
        </Card>
      </div>
    </>
  )
}
