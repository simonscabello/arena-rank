import { Link } from '@adonisjs/inertia/react'
import { Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import Card from '~/components/Card'
import EmptyState from '~/components/EmptyState'
import Input from '~/components/Input'
import Select from '~/components/Select'
import { navigateHistory, navigatePlayerHistory } from '~/components/profile/navigate_section'
import type {
  HistoryFilterOptions,
  HistoryFilters,
  HistoryMatchItem,
  HistoryPagination,
  HistorySummary,
} from '~/components/profile/types'
import { buttonClassName } from '~/lib/button_styles'

type Props = {
  filters: HistoryFilters
  filterOptions: HistoryFilterOptions
  items: HistoryMatchItem[]
  summary: HistorySummary
  pagination: HistoryPagination
  currentUserId: number
  playerUserId?: number
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export default function ProfileHistorySection({
  filters,
  filterOptions,
  items,
  summary,
  pagination,
  currentUserId,
  playerUserId,
}: Props) {
  const [draftFrom, setDraftFrom] = useState(filters.from ?? '')
  const [draftTo, setDraftTo] = useState(filters.to ?? '')

  function navigate(next: HistoryFilters) {
    if (playerUserId !== undefined) {
      navigatePlayerHistory(playerUserId, next)
      return
    }
    navigateHistory(next)
  }

  const arenaOptions = useMemo(() => {
    if (!filters.groupId) return filterOptions.arenas
    return filterOptions.arenas.filter((arena) => arena.groupId === filters.groupId)
  }, [filterOptions.arenas, filters.groupId])

  const partnerOptions = useMemo(() => {
    if (!filters.groupId) return filterOptions.partners
    return filterOptions.partners.filter((partner) => partner.groupId === filters.groupId)
  }, [filterOptions.partners, filters.groupId])

  function updateFilters(patch: Partial<HistoryFilters>) {
    navigate({ ...filters, ...patch, page: 1 })
  }

  function clearFilters() {
    setDraftFrom('')
    setDraftTo('')
    navigate({ page: 1 })
  }

  function applyPeriod() {
    updateFilters({ from: draftFrom || undefined, to: draftTo || undefined })
  }

  return (
    <div className="space-y-4">
      <Card title="Filtros">
        <div className="space-y-3">
          <Select
            label="Play"
            value={filters.groupId ?? ''}
            onChange={(event) =>
              updateFilters({
                groupId: event.target.value ? Number(event.target.value) : undefined,
                arenaId: undefined,
                partnerId: undefined,
              })
            }
          >
            <option value="">Todas</option>
            {filterOptions.groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </Select>

          <Select
            label="Arena"
            value={filters.arenaId ?? ''}
            onChange={(event) =>
              updateFilters({
                arenaId: event.target.value ? Number(event.target.value) : undefined,
              })
            }
          >
            <option value="">Todas</option>
            {arenaOptions.map((arena) => (
              <option key={`${arena.groupId}-${arena.id}`} value={arena.id}>
                {arena.name}
                {arena.city ? ` · ${arena.city}` : ''}
              </option>
            ))}
          </Select>

          <Select
            label="Parceiro"
            value={filters.partnerId ?? ''}
            onChange={(event) =>
              updateFilters({
                partnerId: event.target.value ? Number(event.target.value) : undefined,
              })
            }
          >
            <option value="">Todos</option>
            {partnerOptions.map((partner) => (
              <option key={`${partner.groupId}-${partner.userId}`} value={partner.userId}>
                {partner.name}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="De"
              type="date"
              value={draftFrom}
              onChange={(event) => setDraftFrom(event.target.value)}
            />
            <Input
              label="Até"
              type="date"
              value={draftTo}
              onChange={(event) => setDraftTo(event.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyPeriod}
              className={buttonClassName('secondary', 'md')}
            >
              Aplicar período
            </button>
            <button type="button" onClick={clearFilters} className={buttonClassName('ghost', 'md')}>
              Limpar filtros
            </button>
          </div>
        </div>
      </Card>

      {filters.groupId && (
        <p className="text-sm">
          <Link
            route="members.show"
            routeParams={{ groupId: filters.groupId, userId: currentUserId }}
            className="font-medium text-brand-600 hover:underline"
          >
            Ver perfil completo na Play
          </Link>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand-700">{summary.wins}</p>
          <p className="text-xs text-stone-500">Vitórias</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-stone-700">{summary.losses}</p>
          <p className="text-xs text-stone-500">Derrotas</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-stone-900">{summary.matchesPlayed}</p>
          <p className="text-xs text-stone-500">Partidas</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-stone-900">{summary.winRate}%</p>
          <p className="text-xs text-stone-500">Aproveitamento</p>
        </Card>
      </div>

      <Card title="Partidas">
        {items.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Nenhuma partida encontrada"
            description={
              filterOptions.groups.length === 0
                ? 'Entre em uma Play para começar a registrar histórico.'
                : 'Ajuste os filtros ou jogue novas partidas.'
            }
          />
        ) : (
          <ul className="space-y-2">
            {items.map((match) => (
              <li key={match.matchId}>
                <Link
                  route="matches.show"
                  routeParams={{ id: match.matchId }}
                  className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-3 transition hover:border-brand-200"
                >
                  <div>
                    <p className="font-medium text-stone-900">{match.arenaName}</p>
                    <p className="text-xs text-stone-500">
                      {match.groupName}
                      {match.partnerName ? ` · com ${match.partnerName}` : ''}
                      {match.city ? ` · ${match.city}` : ''}
                      {match.scoreLabel ? ` · ${match.scoreLabel}` : ''}
                      {` · ${formatDate(match.playedAt)}`}
                    </p>
                  </div>
                  <span
                    className={
                      match.won
                        ? 'rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 ring-inset'
                        : 'rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 ring-1 ring-stone-200 ring-inset'
                    }
                  >
                    {match.won ? 'Vitória' : 'Derrota'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {pagination.lastPage > 1 && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => navigate({ ...filters, page: pagination.page - 1 })}
            className={buttonClassName('secondary', 'md', false, 'disabled:opacity-40')}
          >
            Anterior
          </button>
          <span className="text-sm text-stone-500">
            Página {pagination.page} de {pagination.lastPage}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.lastPage}
            onClick={() => navigate({ ...filters, page: pagination.page + 1 })}
            className={buttonClassName('secondary', 'md', false, 'disabled:opacity-40')}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}
