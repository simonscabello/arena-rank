import TeamCard from '~/components/TeamCard'
import type { PlayerType } from '~/lib/player_type'

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
}

type Props = {
  groupId: number
  side1: Player[]
  side2: Player[]
  winnerSide: number | null
  scoreLabel: string | null
}

export default function MatchTeamsBlock({
  groupId,
  side1,
  side2,
  winnerSide,
  scoreLabel,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <TeamCard groupId={groupId} side={1} players={side1} isWinner={winnerSide === 1} />
      <div className="flex justify-center">
        {scoreLabel ? (
          <span className="text-center text-sm font-bold leading-tight text-brand-700">
            {scoreLabel}
          </span>
        ) : (
          <span className="text-xs font-bold uppercase tracking-wide text-stone-400">vs</span>
        )}
      </div>
      <TeamCard groupId={groupId} side={2} players={side2} isWinner={winnerSide === 2} />
    </div>
  )
}
