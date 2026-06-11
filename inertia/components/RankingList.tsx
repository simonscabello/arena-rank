import { Link } from '@adonisjs/inertia/react'
import { Trophy } from 'lucide-react'
import { cn, displayName } from '~/lib/match'
import Avatar from '~/components/Avatar'
import EloTierBadge from '~/components/EloTierBadge'
import ProfileBadge from '~/components/ProfileBadge'

export type RankingEntry = {
  userId: number
  fullName: string | null
  email: string
  nickname?: string | null
  elo: number
  level: number
  eloTier: string
  eloTierLabel: string
  initials?: string
  avatarUrl?: string | null
  equippedTitles?: { icon: string; name: string }[]
  avatarFrameSrc?: string | null
  avatarFrameInset?: number
  historyPath?: string | null
}

type Props = {
  entries: RankingEntry[]
  highlightUserId?: number
  groupId?: number
  emptyMessage?: string
}

const podiumStyles = [
  'border-amber-200 bg-gradient-to-r from-amber-50 to-white',
  'border-stone-200 bg-gradient-to-r from-stone-100 to-white',
  'border-orange-200 bg-gradient-to-r from-orange-50/80 to-white',
]

export default function RankingList({
  entries,
  highlightUserId,
  groupId,
  emptyMessage = 'Nenhum jogador no ranking ainda.',
}: Props) {
  if (entries.length === 0) {
    return <p className="py-4 text-center text-sm text-stone-500">{emptyMessage}</p>
  }

  const frameSlotInset = entries.reduce(
    (maxInset, entry) => Math.max(maxInset, entry.avatarFrameInset ?? 18),
    18
  )

  return (
    <ol className="space-y-2">
      {entries.map((entry, index) => {
        const isMe = entry.userId === highlightUserId
        const initials =
          entry.initials ||
          (entry.fullName
            ? entry.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            : entry.email.slice(0, 2).toUpperCase())

        const isClickable = Boolean(entry.historyPath || groupId)
        const rowClassName = cn(
          'flex items-center gap-3 rounded-xl border px-3 py-2.5',
          index < 3 ? podiumStyles[index] : 'border-stone-100 bg-stone-50/50',
          isMe && 'ring-2 ring-brand-500/30',
          isClickable ? 'transition hover:border-brand-200 hover:bg-brand-50/30' : undefined
        )

        const content = (
          <>
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                index === 0 && 'bg-amber-400 text-amber-950',
                index === 1 && 'bg-stone-300 text-stone-800',
                index === 2 && 'bg-orange-300 text-orange-950',
                index > 2 && 'bg-stone-200 text-stone-600'
              )}
            >
              {index < 3 ? <Trophy className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <Avatar
              initials={initials}
              src={entry.avatarUrl}
              size="sm"
              frameSrc={entry.avatarFrameSrc}
              photoInset={entry.avatarFrameInset}
              reserveFrameSlot
              slotInset={frameSlotInset}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-stone-800">
                {displayName(entry)}
                {entry.equippedTitles?.map((title) => (
                  <span key={title.name} className="ml-1 inline-flex align-middle">
                    <ProfileBadge icon={title.icon} title={title.name} />
                  </span>
                ))}
                {isMe && <span className="ml-1 text-xs text-brand-600">(você)</span>}
              </p>
              <p className="truncate text-xs text-stone-500">
                Nível {entry.level} · <EloTierBadge tier={entry.eloTier} label={entry.eloTierLabel} />
              </p>
            </div>
            <span className="shrink-0 font-semibold text-brand-700">{entry.elo} ELO</span>
          </>
        )

        return (
          <li key={entry.userId}>
            {entry.historyPath ? (
              <Link href={entry.historyPath} className={rowClassName}>
                {content}
              </Link>
            ) : groupId ? (
              <Link
                route="members.show"
                routeParams={{ groupId, userId: entry.userId }}
                className={rowClassName}
              >
                {content}
              </Link>
            ) : (
              <div className={rowClassName}>{content}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
