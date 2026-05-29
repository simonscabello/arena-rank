import { Form } from '@adonisjs/inertia/react'
import { router } from '@inertiajs/react'
import { Plus, Target, Users } from 'lucide-react'
import { useState } from 'react'
import BackLink from '~/components/BackLink'
import Avatar from '~/components/Avatar'
import Badge from '~/components/Badge'
import Card from '~/components/Card'
import EmptyState from '~/components/EmptyState'
import MatchManageCard from '~/components/MatchManageCard'
import PageHeader from '~/components/PageHeader'
import RankingList, { type RankingEntry } from '~/components/RankingList'
import TeamCard from '~/components/TeamCard'
import { buttonClassName } from '~/lib/button_styles'
import { cn, displayName, inferWinnerSideFromSets, teamLabel } from '~/lib/match'

type Player = {
  id: number
  userId: number | null
  side: number
  displayName: string
  isDummy: boolean
  initials: string
  avatarUrl?: string | null
  funLabel?: string | null
  claimStatus?: 'pending' | 'claimed'
  guestInviteId?: number | null
}

type Bet = {
  userId: number
  predictedSide: number
  pointsAwarded: number | null
  fullName: string | null
  email: string
}

type RankContext = {
  position: number | null
  totalPoints: number
  pointsToNext: number | null
  leaderPoints: number
  nextRankName: string | null
  nextRankPosition: number | null
}

type BetParticipation = {
  eligibleCount: number
  betCount: number
  pendingMembers: {
    userId: number
    name: string
    initials: string
    avatarUrl: string | null
  }[]
}

type SetRow = { side1: string; side2: string }

type Props = {
  match: {
    id: number
    status: string
    winnerSide: number | null
    scoreLabel: string | null
    arenaName: string
    groupId: number
    manageWindowOpen: boolean
    manageWindowExpiresAt: string
  }
  players: Player[]
  bets: Bet[]
  ranking: RankingEntry[]
  rankContext: RankContext
  betParticipation: BetParticipation | null
  isPlayer: boolean
  userBet: { predictedSide: number; pointsAwarded: number | null } | null
  currentUserId: number
  canManageMatch: boolean
  betsPossible: boolean
  skipsBets: boolean
}

function playersBySide(players: Player[], side: number) {
  return players.filter((p) => p.side === side)
}

function hasPartialSetRow(row: SetRow) {
  const hasSide1 = row.side1.trim() !== ''
  const hasSide2 = row.side2.trim() !== ''
  return hasSide1 !== hasSide2
}

function buildSetsPayload(rows: SetRow[]) {
  const sets: { side1: number; side2: number }[] = []

  for (const row of rows) {
    const hasSide1 = row.side1.trim() !== ''
    const hasSide2 = row.side2.trim() !== ''
    if (!hasSide1 && !hasSide2) continue
    if (hasPartialSetRow(row)) return null
    sets.push({
      side1: Number.parseInt(row.side1, 10),
      side2: Number.parseInt(row.side2, 10),
    })
  }

  return sets.length > 0 ? sets : null
}

function sideLabelFor(side: number, side1Label: string, side2Label: string) {
  return side === 1 ? side1Label : side2Label
}

function MatchTeamsBlock({
  groupId,
  side1,
  side2,
  winnerSide,
  scoreLabel,
}: {
  groupId: number
  side1: Player[]
  side2: Player[]
  winnerSide: number | null
  scoreLabel: string | null
}) {
  return (
    <div className="flex flex-col gap-4">
      <TeamCard groupId={groupId} side={1} players={side1} isWinner={winnerSide === 1} />
      <div className="flex justify-center">
        {scoreLabel ? (
          <span className="text-center text-sm font-bold leading-tight text-brand-700">{scoreLabel}</span>
        ) : (
          <span className="text-xs font-bold uppercase tracking-wide text-stone-400">vs</span>
        )}
      </div>
      <TeamCard groupId={groupId} side={2} players={side2} isWinner={winnerSide === 2} />
    </div>
  )
}

function MatchFinalizeCard({
  matchId,
  side1Label,
  side2Label,
}: {
  matchId: number
  side1Label: string
  side2Label: string
}) {
  const [setRows, setSetRows] = useState<SetRow[]>([{ side1: '', side2: '' }])
  const [error, setError] = useState('')

  function updateSetRow(index: number, field: 'side1' | 'side2', value: string) {
    setSetRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  function addSetRow() {
    if (setRows.length >= 3) return
    setSetRows((prev) => [...prev, { side1: '', side2: '' }])
  }

  const sets = buildSetsPayload(setRows)
  const inferredWinner =
    sets && !setRows.some(hasPartialSetRow) ? inferWinnerSideFromSets(sets) : null
  const winnerLabel =
    inferredWinner === 1 ? side1Label : inferredWinner === 2 ? side2Label : null

  function submit() {
    if (setRows.some(hasPartialSetRow)) {
      setError('Preencha os dois lados de cada set')
      return
    }

    if (!sets) {
      setError('Informe o placar de pelo menos um set')
      return
    }

    if (sets.some((set) => set.side1 === set.side2)) {
      setError('Cada set precisa ter um vencedor (placares diferentes)')
      return
    }

    if (inferredWinner === null) {
      setError('O placar está empatado — adicione mais sets ou ajuste os placares')
      return
    }

    setError('')
    router.post(`/partidas/${matchId}/finalizar`, { sets })
  }

  return (
    <Card title="Registrar resultado" className="mb-6">
      <div className="mb-2 grid grid-cols-[3rem_1fr_1fr] gap-x-2 gap-y-2 text-xs font-medium text-stone-500">
        <span />
        <span className="truncate text-center text-brand-700">{side1Label}</span>
        <span className="truncate text-center text-amber-800">{side2Label}</span>
      </div>
      {setRows.map((row, index) => (
        <div key={index} className="mb-2 grid grid-cols-[3rem_1fr_1fr] items-center gap-x-2">
          <span className="text-xs font-medium text-stone-500">Set {index + 1}</span>
          <input
            type="number"
            min={0}
            max={99}
            inputMode="numeric"
            value={row.side1}
            onChange={(e) => updateSetRow(index, 'side1', e.target.value)}
            placeholder="—"
            aria-label={`Set ${index + 1} — ${side1Label}`}
            className="h-10 w-full rounded-xl border border-brand-200 bg-white px-2 text-center text-stone-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <input
            type="number"
            min={0}
            max={99}
            inputMode="numeric"
            value={row.side2}
            onChange={(e) => updateSetRow(index, 'side2', e.target.value)}
            placeholder="—"
            aria-label={`Set ${index + 1} — ${side2Label}`}
            className="h-10 w-full rounded-xl border border-amber-200 bg-white px-2 text-center text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      ))}

      {setRows.length < 3 && (
        <button
          type="button"
          onClick={addSetRow}
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
        >
          <Plus className="h-4 w-4" />
          Adicionar set
        </button>
      )}

      {winnerLabel && (
        <p className="mb-4 text-sm font-medium text-stone-800">
          Vencedor: <span className="text-brand-700">{winnerLabel}</span>
        </p>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <button type="button" onClick={submit} className={buttonClassName('primary', 'md', true)}>
        Finalizar partida
      </button>
    </Card>
  )
}

function rankContextMessage(rankContext: RankContext, hasUserBet: boolean) {
  if (!hasUserBet && rankContext.position === null && rankContext.totalPoints === 0) {
    return 'Faça seu primeiro palpite para entrar no ranking.'
  }

  if (rankContext.position === 1) {
    return `Você lidera com ${rankContext.totalPoints} pts`
  }

  if (rankContext.position && rankContext.pointsToNext && rankContext.nextRankName) {
    return `Faltam ${rankContext.pointsToNext} pts para alcançar ${rankContext.nextRankName} (${rankContext.nextRankPosition}º)`
  }

  return null
}

export default function MatchShow({
  match,
  players,
  bets,
  ranking,
  rankContext,
  betParticipation,
  isPlayer,
  userBet,
  currentUserId,
  canManageMatch,
  betsPossible,
  skipsBets,
}: Props) {
  const side1 = playersBySide(players, 1)
  const side2 = playersBySide(players, 2)
  const side1Label = teamLabel(side1)
  const side2Label = teamLabel(side2)
  const rankMessage = rankContextMessage(rankContext, Boolean(userBet))
  const betsRevealed = match.status !== 'palpites_abertos' && betsPossible
  const betsTitle = betsRevealed ? `Palpites (${bets.length})` : 'Palpites'
  const pendingPreview = betParticipation?.pendingMembers.slice(0, 5) ?? []
  const pendingOverflow =
    betParticipation && betParticipation.pendingMembers.length > pendingPreview.length
      ? betParticipation.pendingMembers.length - pendingPreview.length
      : 0

  if (match.status === 'cancelada') {
    return (
      <>
        <PageHeader
          back={
            <BackLink route="groups.show" routeParams={{ id: match.groupId }} label="Play" />
          }
          title={match.arenaName}
          subtitle={<Badge status={match.status} />}
        />

        <Card className="mb-6">
          <MatchTeamsBlock
            groupId={match.groupId}
            side1={side1}
            side2={side2}
            winnerSide={match.winnerSide}
            scoreLabel={match.scoreLabel}
          />
        </Card>

        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Esta partida foi cancelada e não conta no ranking nem no histórico.
        </p>
      </>
    )
  }

  return (
    <>
      <PageHeader
        back={
          <BackLink route="groups.show" routeParams={{ id: match.groupId }} label="Play" />
        }
        title={match.arenaName}
        subtitle={<Badge status={match.status} />}
      />

      <Card className="mb-6">
        <MatchTeamsBlock
          groupId={match.groupId}
          side1={side1}
          side2={side2}
          winnerSide={match.winnerSide}
          scoreLabel={match.scoreLabel}
        />
      </Card>

      {skipsBets && match.status !== 'finalizada' && (
        <p className="mb-6 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          Partida sem palpites — apenas histórico de vitórias e derrotas.
        </p>
      )}

      {match.status === 'palpites_abertos' && betsPossible && betParticipation && (
        <Card className="mb-6 border-brand-100 bg-brand-50/30">
          <p className="text-sm font-medium text-stone-900">
            {betParticipation.betCount} de {betParticipation.eligibleCount} já palpitaram
          </p>
          {pendingPreview.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-stone-500">Faltam:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {pendingPreview.map((member) => (
                  <span
                    key={member.userId}
                    title={member.name}
                    className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-2 py-0.5 text-xs text-stone-600"
                  >
                    <Avatar initials={member.initials} src={member.avatarUrl} size="sm" />
                    {member.name}
                  </span>
                ))}
                {pendingOverflow > 0 && (
                  <span className="text-xs font-medium text-stone-500">+{pendingOverflow}</span>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {match.status === 'palpites_abertos' && betsPossible && !isPlayer && (
        <Card title={userBet ? 'Alterar palpite' : 'Seu palpite'} className="mb-6">
          <p className="mb-4 text-sm text-stone-500">
            {userBet
              ? `Seu palpite atual: ${sideLabelFor(userBet.predictedSide, side1Label, side2Label)}. Toque na outra dupla para trocar.`
              : 'Quem vence esta partida?'}
          </p>
          <div className="flex flex-col gap-3">
            <Form route="matches.bet" routeParams={{ id: match.id }} className="contents">
              <input type="hidden" name="predictedSide" value="1" />
              <button
                type="submit"
                className={buttonClassName(
                  userBet?.predictedSide === 1 ? 'primary' : 'secondary',
                  'lg',
                  true
                )}
              >
                {side1Label}
              </button>
            </Form>
            <Form route="matches.bet" routeParams={{ id: match.id }} className="contents">
              <input type="hidden" name="predictedSide" value="2" />
              <button
                type="submit"
                className={cn(
                  buttonClassName(
                    !userBet || userBet.predictedSide === 2 ? 'primary' : 'secondary',
                    'lg',
                    true
                  ),
                  (!userBet || userBet.predictedSide === 2) && 'bg-amber-500 hover:bg-amber-600'
                )}
              >
                {side2Label}
              </button>
            </Form>
          </div>
        </Card>
      )}

      {userBet && match.status !== 'palpites_abertos' && (
        <Card
          className={cn(
            'mb-6',
            match.status === 'finalizada' && userBet.pointsAwarded !== null && userBet.pointsAwarded > 0
              ? 'border-emerald-200 bg-emerald-50/80'
              : match.status === 'finalizada'
                ? 'border-stone-200 bg-stone-50'
                : 'border-brand-200 bg-brand-50/50'
          )}
        >
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-brand-600" />
            <div>
              <p className="font-semibold text-stone-900">
                Seu palpite: {sideLabelFor(userBet.predictedSide, side1Label, side2Label)}
              </p>
              {userBet.pointsAwarded !== null && (
                <p
                  className={cn(
                    'text-sm',
                    userBet.pointsAwarded > 0 ? 'font-medium text-emerald-700' : 'text-stone-600'
                  )}
                >
                  {userBet.pointsAwarded > 0
                    ? `+${userBet.pointsAwarded} pts — subiu no ranking!`
                    : 'Errou desta vez — 0 pts nesta partida'}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {isPlayer && match.status === 'palpites_abertos' && betsPossible && (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Você está jogando — não pode palpitar nesta partida.
        </p>
      )}

      {canManageMatch &&
        (match.status === 'em_andamento' ||
          (match.status === 'palpites_abertos' && skipsBets)) && (
        <MatchFinalizeCard matchId={match.id} side1Label={side1Label} side2Label={side2Label} />
      )}

      {canManageMatch && (
        <MatchManageCard
          matchId={match.id}
          status={match.status}
          betsPossible={betsPossible}
          manageWindowOpen={match.manageWindowOpen}
          manageWindowExpiresAt={match.manageWindowExpiresAt}
        />
      )}

      <div className="space-y-6">
        <Card title={betsTitle}>
          {!betsRevealed && betsPossible ? (
            <EmptyState
              icon={Users}
              title="Palpites em segredo"
              description="Os palpites ficam em segredo até a partida começar."
            />
          ) : bets.length === 0 ? (
            <EmptyState
              icon={Users}
              title={skipsBets ? 'Partida sem palpites' : 'Nenhum palpite ainda'}
              description={
                skipsBets
                  ? 'O ranking de pontos não muda nesta partida.'
                  : undefined
              }
            />
          ) : (
            <ul className="divide-y divide-stone-100">
              {bets.map((bet) => (
                <li key={bet.userId} className="flex items-center justify-between py-3 first:pt-0">
                  <span className="font-medium text-stone-800">{displayName(bet)}</span>
                  <span className="text-sm text-stone-500">
                    {sideLabelFor(bet.predictedSide, side1Label, side2Label)}
                    {bet.pointsAwarded !== null && (
                      <span className="ml-2 font-semibold text-brand-700">
                        {bet.pointsAwarded > 0 ? `+${bet.pointsAwarded}` : '0'} pts
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {rankMessage && (
          <Card className="border-brand-100 bg-brand-50/40">
            <p className="text-sm font-medium text-brand-800">{rankMessage}</p>
          </Card>
        )}

        <Card title="Ranking da Play">
          <RankingList
            entries={ranking}
            highlightUserId={currentUserId}
            groupId={match.groupId}
          />
        </Card>
      </div>
    </>
  )
}
