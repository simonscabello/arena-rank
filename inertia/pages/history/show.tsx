import { Link } from '@adonisjs/inertia/react'
import { router } from '@inertiajs/react'
import { Target, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import BackLink from '~/components/BackLink'
import Card from '~/components/Card'
import EmptyState from '~/components/EmptyState'
import Input from '~/components/Input'
import PageHeader from '~/components/PageHeader'
import Select from '~/components/Select'
import { buttonClassName } from '~/lib/button_styles'
import { cn } from '~/lib/match'

type FilterOptions = {
  groups: { id: number; name: string }[]
  arenas: { id: number; name: string; city: string | null; groupId: number }[]
  partners: { userId: number; name: string; groupId: number }[]
}

type Filters = {
  tab: 'matches' | 'bets'
  groupId?: number
  arenaId?: number
  partnerId?: number
  from?: string
  to?: string
  page?: number
}

type MatchItem = {
  matchId: number
  groupId: number
  groupName: string
  arenaName: string
  city: string | null
  won: boolean
  partnerName: string | null
  playedAt: string
  scoreLabel: string | null
}

type BetItem = {
  matchId: number
  groupId: number
  groupName: string
  arenaName: string
  predictedSide: number
  pointsAwarded: number | null
  correct: boolean | null
  playedAt: string
}

type MatchSummary = {
  wins: number
  losses: number
  matchesPlayed: number
  winRate: number
}

type BetSummary = {
  totalBets: number
  correctBets: number
  wrongBets: number
  pendingBets: number
  totalPoints: number
}

type Pagination = {
  page: number
  pageSize: number
  total: number
  lastPage: number
}

type Props = {
  filters: Filters
  filterOptions: FilterOptions
  items: MatchItem[] | BetItem[]
  summary: MatchSummary | BetSummary
  pagination: Pagination
  currentUserId: number
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function buildQuery(filters: Filters) {
  const query: Record<string, string | number> = { tab: filters.tab }

  if (filters.groupId) query.groupId = filters.groupId
  if (filters.arenaId) query.arenaId = filters.arenaId
  if (filters.partnerId) query.partnerId = filters.partnerId
  if (filters.from) query.from = filters.from
  if (filters.to) query.to = filters.to
  if (filters.page && filters.page > 1) query.page = filters.page

  return query
}

function historyUrl(filters: Filters) {
  const params = new URLSearchParams()
  const query = buildQuery(filters)

  for (const [key, value] of Object.entries(query)) {
    params.set(key, String(value))
  }

  const qs = params.toString()
  return qs ? `/historico?${qs}` : '/historico'
}

function navigate(filters: Filters) {
  router.get(historyUrl(filters), {}, { preserveState: true, replace: true })
}

function isMatchSummary(summary: MatchSummary | BetSummary): summary is MatchSummary {
  return 'matchesPlayed' in summary
}

export default function HistoryShow({
  filters,
  filterOptions,
  items,
  summary,
  pagination,
  currentUserId,
}: Props) {
  const isMatchesTab = filters.tab === 'matches'
  const [draftFrom, setDraftFrom] = useState(filters.from ?? '')
  const [draftTo, setDraftTo] = useState(filters.to ?? '')

  const arenaOptions = useMemo(() => {
    if (!filters.groupId) return filterOptions.arenas
    return filterOptions.arenas.filter((arena) => arena.groupId === filters.groupId)
  }, [filterOptions.arenas, filters.groupId])

  const partnerOptions = useMemo(() => {
    if (!filters.groupId) return filterOptions.partners
    return filterOptions.partners.filter((partner) => partner.groupId === filters.groupId)
  }, [filterOptions.partners, filters.groupId])

  function updateFilters(updates: Partial<Filters>) {
    navigate({ ...filters, ...updates, page: 1 })
  }

  function clearFilters() {
    setDraftFrom('')
    setDraftTo('')
    navigate({ tab: filters.tab, page: 1 })
  }

  function applyPeriod() {
    updateFilters({ from: draftFrom || undefined, to: draftTo || undefined })
  }

  return (
    <>
      <PageHeader
        back={<BackLink route="home" label="Início" />}
        title="Meu histórico"
        subtitle="Partidas e palpites em todas as suas Plays"
      />

      <div className="mb-4 flex rounded-xl border border-stone-200 bg-stone-50 p-1">
        <button
          type="button"
          onClick={() => updateFilters({ tab: 'matches', partnerId: undefined })}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm font-medium transition',
            isMatchesTab ? 'bg-white text-brand-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          )}
        >
          Partidas
        </button>
        <button
          type="button"
          onClick={() => updateFilters({ tab: 'bets', partnerId: undefined })}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm font-medium transition',
            !isMatchesTab ? 'bg-white text-brand-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          )}
        >
          Palpites
        </button>
      </div>

      <Card title="Filtros" className="mb-4">
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

          {isMatchesTab && (
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
          )}

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
            <button type="button" onClick={applyPeriod} className={buttonClassName('secondary', 'md')}>
              Aplicar período
            </button>
            <button type="button" onClick={clearFilters} className={buttonClassName('ghost', 'md')}>
              Limpar filtros
            </button>
          </div>
        </div>
      </Card>

      {filters.groupId && (
        <p className="mb-4 text-sm">
          <Link
            route="members.show"
            routeParams={{ groupId: filters.groupId, userId: currentUserId }}
            className="font-medium text-brand-600 hover:underline"
          >
            Ver perfil completo na Play
          </Link>
        </p>
      )}

      {isMatchesTab && isMatchSummary(summary) ? (
        <div className="mb-4 grid grid-cols-2 gap-3">
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
      ) : (
        !isMatchesTab &&
        !isMatchSummary(summary) && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <Card className="text-center">
              <p className="text-2xl font-bold text-stone-900">{summary.totalBets}</p>
              <p className="text-xs text-stone-500">Palpites</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-brand-700">{summary.correctBets}</p>
              <p className="text-xs text-stone-500">Acertos</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-stone-700">{summary.wrongBets}</p>
              <p className="text-xs text-stone-500">Erros</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-brand-700">{summary.totalPoints}</p>
              <p className="text-xs text-stone-500">Pontos</p>
            </Card>
          </div>
        )
      )}

      <Card title={isMatchesTab ? 'Partidas' : 'Palpites'}>
        {items.length === 0 ? (
          <EmptyState
            icon={isMatchesTab ? Trophy : Target}
            title={isMatchesTab ? 'Nenhuma partida encontrada' : 'Nenhum palpite encontrado'}
            description={
              filterOptions.groups.length === 0
                ? 'Entre em uma Play para começar a registrar histórico.'
                : 'Ajuste os filtros ou jogue novas partidas.'
            }
          />
        ) : (
          <ul className="space-y-2">
            {isMatchesTab
              ? (items as MatchItem[]).map((match) => (
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
                ))
              : (items as BetItem[]).map((bet) => (
                  <li key={`${bet.matchId}-${bet.predictedSide}`}>
                    <Link
                      route="matches.show"
                      routeParams={{ id: bet.matchId }}
                      className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-3 transition hover:border-brand-200"
                    >
                      <div>
                        <p className="font-medium text-stone-900">{bet.arenaName}</p>
                        <p className="text-xs text-stone-500">
                          {bet.groupName} · Dupla {bet.predictedSide} · {formatDate(bet.playedAt)}
                        </p>
                      </div>
                      <span
                        className={
                          bet.correct === null
                            ? 'rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200 ring-inset'
                            : bet.correct
                              ? 'rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 ring-inset'
                              : 'rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 ring-1 ring-stone-200 ring-inset'
                        }
                      >
                        {bet.correct === null
                          ? 'Pendente'
                          : bet.correct
                            ? `+${bet.pointsAwarded} pts`
                            : '0 pts'}
                      </span>
                    </Link>
                  </li>
                ))}
          </ul>
        )}
      </Card>

      {pagination.lastPage > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
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
    </>
  )
}
