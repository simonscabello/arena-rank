import { Form } from '@adonisjs/inertia/react'
import { Target, Users } from 'lucide-react'
import BackLink from '~/components/BackLink'
import Avatar from '~/components/Avatar'
import Badge from '~/components/Badge'
import Card from '~/components/Card'
import EmptyState from '~/components/EmptyState'
import MatchFinalizeCard from '~/components/MatchFinalizeCard'
import MatchManageCard from '~/components/MatchManageCard'
import MatchTeamsBlock from '~/components/MatchTeamsBlock'
import PageHeader from '~/components/PageHeader'
import ShareMatchResult from '~/components/ShareMatchResult'
import RankingList, { type RankingEntry } from '~/components/RankingList'
import { buttonClassName } from '~/lib/button_styles'
import { cn, displayName, teamLabel } from '~/lib/match'
import type { PlayerType } from '~/lib/player_type'

type Player = {
  id: number
  userId: number | null
  side: number
  displayName: string
  playerType: PlayerType
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
    shareText: string | null
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

function sideLabelFor(side: number, side1Label: string, side2Label: string) {
  return side === 1 ? side1Label : side2Label
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
          back={<BackLink route="groups.show" routeParams={{ id: match.groupId }} label="Play" />}
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
        back={<BackLink route="groups.show" routeParams={{ id: match.groupId }} label="Play" />}
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

      {match.status === 'finalizada' && match.shareText && (
        <div className="mb-6">
          <ShareMatchResult shareText={match.shareText} />
        </div>
      )}

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
            match.status === 'finalizada' &&
              userBet.pointsAwarded !== null &&
              userBet.pointsAwarded > 0
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
        (match.status === 'em_andamento' || (match.status === 'palpites_abertos' && skipsBets)) && (
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
              description={skipsBets ? 'O ranking de pontos não muda nesta partida.' : undefined}
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
          <RankingList entries={ranking} highlightUserId={currentUserId} groupId={match.groupId} />
        </Card>
      </div>
    </>
  )
}
