import BackLink from '~/components/BackLink'
import Badge from '~/components/Badge'
import Card from '~/components/Card'
import EloRankingHint from '~/components/EloRankingHint'
import GuestClaimReminder from '~/components/GuestClaimReminder'
import MatchAdminSection from '~/components/MatchAdminSection'
import MatchCelebrationCard from '~/components/MatchCelebrationCard'
import MatchFinalizeCard from '~/components/MatchFinalizeCard'
import MatchManageCard from '~/components/MatchManageCard'
import MatchTeamsBlock from '~/components/MatchTeamsBlock'
import PageHeader from '~/components/PageHeader'
import ShareMatchResult from '~/components/ShareMatchResult'
import RankingList, { type RankingEntry } from '~/components/RankingList'
import { formatEloDelta, teamLabel } from '~/lib/match'
import { parseCelebrationFlash } from '~/lib/match_celebration'
import type { MatchShareCardPayload } from '~/lib/match_share_card'
import type { PlayerType } from '~/lib/player_type'
import { usePage } from '@inertiajs/react'

type Player = {
  id: number
  userId: number | null
  side: number
  displayName: string
  playerType: PlayerType
  initials: string
  avatarUrl?: string | null
  avatarFrameSrc?: string | null
  avatarFrameInset?: number
  funLabel?: string | null
  equippedTitles?: { icon: string; name: string }[]
  claimStatus?: 'pending' | 'claimed'
  guestInviteId?: number | null
  guestInviteUrl?: string | null
  xpAwarded?: number | null
  eloDelta?: number | null
  eloAfter?: number | null
}

type RankContext = {
  position: number | null
  elo: number
  eloToNext: number | null
  leaderElo: number
  nextRankName: string | null
  nextRankPosition: number | null
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
    shareCard: MatchShareCardPayload | null
  }
  players: Player[]
  ranking: RankingEntry[]
  rankContext: RankContext
  currentUserId: number
  canFinalizeMatch: boolean
  canManageMatchActions: boolean
  isOrganizerOverride: boolean
}

function playersBySide(players: Player[], side: number) {
  return players.filter((p) => p.side === side)
}

function rankContextMessage(rankContext: RankContext) {
  if (rankContext.position === 1) {
    return `Você lidera a Play com ${rankContext.elo} ELO`
  }

  if (rankContext.position && rankContext.eloToNext && rankContext.nextRankName) {
    return `Faltam ${rankContext.eloToNext} ELO para alcançar ${rankContext.nextRankName} (${rankContext.nextRankPosition}º)`
  }

  return null
}

export default function MatchShow({
  match,
  players,
  ranking,
  rankContext,
  currentUserId,
  canFinalizeMatch,
  canManageMatchActions,
  isOrganizerOverride,
}: Props) {
  const page = usePage()
  const celebration = parseCelebrationFlash(
    (page.props as { flash?: { celebration?: unknown } }).flash?.celebration
  )
  const side1 = playersBySide(players, 1)
  const side2 = playersBySide(players, 2)
  const side1Label = teamLabel(side1)
  const side2Label = teamLabel(side2)
  const rankMessage = rankContextMessage(rankContext)
  const showFinalizeCard = canFinalizeMatch && match.status === 'em_andamento'
  const hasManageActions =
    canManageMatchActions &&
    (match.status === 'em_andamento' || match.status === 'finalizada')
  const showAdminSection = showFinalizeCard || hasManageActions
  const pendingGuests = players
    .filter(
      (player) =>
        player.playerType === 'guest_invite' &&
        player.claimStatus === 'pending' &&
        player.guestInviteUrl
    )
    .map((player) => ({
      displayName: player.displayName,
      guestInviteId: player.guestInviteId ?? null,
      guestInviteUrl: player.guestInviteUrl ?? null,
    }))

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

      {celebration && <MatchCelebrationCard celebration={celebration} />}

      <Card className="mb-6">
        <MatchTeamsBlock
          groupId={match.groupId}
          side1={side1}
          side2={side2}
          winnerSide={match.winnerSide}
          scoreLabel={match.scoreLabel}
        />
      </Card>

      {pendingGuests.length > 0 && (
        <GuestClaimReminder groupId={match.groupId} guests={pendingGuests} />
      )}

      {match.status === 'finalizada' && match.shareCard && match.shareText && (
        <div className="mb-6">
          <ShareMatchResult shareText={match.shareText} shareCard={match.shareCard} />
        </div>
      )}

      {match.status === 'finalizada' && (
        <Card title="Progressão da partida" className="mb-6">
          <ul className="divide-y divide-stone-100">
            {players
              .filter((player) => player.userId && player.xpAwarded !== null)
              .map((player) => (
                <li key={player.id} className="flex items-center justify-between py-3 first:pt-0">
                  <span className="font-medium text-stone-800">{player.displayName}</span>
                  <span className="text-sm text-stone-600">
                    +{player.xpAwarded} XP · {formatEloDelta(player.eloDelta ?? 0)} ELO
                    {player.eloAfter !== null && (
                      <span className="ml-1 text-stone-500">({player.eloAfter})</span>
                    )}
                  </span>
                </li>
              ))}
          </ul>
        </Card>
      )}

      {showAdminSection && (
        <MatchAdminSection defaultOpen={showFinalizeCard}>
          {showFinalizeCard && (
            <MatchFinalizeCard matchId={match.id} side1Label={side1Label} side2Label={side2Label} />
          )}
          {hasManageActions && (
            <MatchManageCard
              matchId={match.id}
              status={match.status}
              manageWindowOpen={match.manageWindowOpen}
              manageWindowExpiresAt={match.manageWindowExpiresAt}
              isOrganizerOverride={isOrganizerOverride}
            />
          )}
        </MatchAdminSection>
      )}

      <div className="space-y-6">
        {rankMessage && (
          <Card className="border-brand-100 bg-brand-50/40">
            <p className="text-sm font-medium text-brand-800">{rankMessage}</p>
          </Card>
        )}

        <Card title="Ranking da Play">
          <EloRankingHint className="mb-3" />
          <RankingList entries={ranking} highlightUserId={currentUserId} groupId={match.groupId} />
        </Card>
      </div>
    </>
  )
}
