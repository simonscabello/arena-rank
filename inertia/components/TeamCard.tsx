import { Link } from '@adonisjs/inertia/react'
import { cn, teamLabel } from '~/lib/match'
import type { PlayerType } from '~/lib/player_type'
import { isGuestPlayerType } from '~/lib/player_type'
import Avatar from '~/components/Avatar'
import ProfileBadge from '~/components/ProfileBadge'

type Player = {
  id: number
  userId: number | null
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
  side: 1 | 2
  players: Player[]
  isWinner?: boolean
}

export default function TeamCard({ groupId, side, players, isWinner }: Props) {
  const frameSlotInset = players.reduce(
    (maxInset, player) => Math.max(maxInset, player.avatarFrameInset ?? 18),
    18
  )

  return (
    <div
      className={cn(
        'flex-1 rounded-2xl border-2 p-4 transition',
        side === 1 ? 'border-brand-200 bg-brand-50/50' : 'border-amber-200 bg-amber-50/40',
        isWinner && 'ring-2 ring-emerald-400 ring-offset-2'
      )}
    >
      <p
        className={cn(
          'mb-3 text-center text-xs font-bold uppercase tracking-wide',
          side === 1 ? 'text-brand-700' : 'text-amber-800'
        )}
      >
        {teamLabel(players)}
        {isWinner && <span className="ml-1 text-emerald-600">✓</span>}
      </p>
      <ul className="space-y-3">
        {players.map((player) => (
          <li key={player.id}>
            <div className="flex items-center gap-3">
              <Avatar
                initials={player.initials}
                src={player.avatarUrl}
                size="sm"
                frameSrc={player.avatarFrameSrc}
                photoInset={player.avatarFrameInset}
                reserveFrameSlot
                slotInset={frameSlotInset}
              />
              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-center gap-1">
                  {player.playerType === 'guest_invite' &&
                  player.claimStatus === 'pending' &&
                  player.guestInviteId ? (
                    <Link
                      route="guest_invites.member"
                      routeParams={{ groupId, inviteId: player.guestInviteId }}
                      className="truncate text-sm font-medium text-brand-700 hover:underline"
                    >
                      {player.displayName}
                    </Link>
                  ) : (
                    <span className="truncate text-sm font-medium text-stone-800">
                      {player.displayName}
                    </span>
                  )}
                  {player.equippedTitles?.map((title) => (
                    <ProfileBadge
                      key={title.name}
                      icon={title.icon}
                      title={title.name}
                      showLabel={false}
                    />
                  ))}
                </span>
                {player.funLabel && (
                  <span className="block truncate text-xs italic text-stone-500">
                    {player.funLabel}
                  </span>
                )}
              </span>
              {isGuestPlayerType(player.playerType) && (
                <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                  Convidado
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
