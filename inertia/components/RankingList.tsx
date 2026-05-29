import { Link } from '@adonisjs/inertia/react'
import { Trophy } from 'lucide-react'
import { cn, displayName } from '~/lib/match'
import Avatar from '~/components/Avatar'
import ProfileBadge from '~/components/ProfileBadge'

export type RankingEntry = {
  userId: number
  fullName: string | null
  email: string
  nickname?: string | null
  totalPoints: number
  betsPlaced: number
  betsCorrect: number
  accuracyPercent: number | null
  currentStreak: number
  initials?: string
  avatarUrl?: string | null
  equippedTitles?: { icon: string; name: string }[]
  avatarFrameSrc?: string | null
  avatarFrameInset?: number
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

function rankingSubtitle(entry: RankingEntry) {
  if (entry.betsPlaced === 0) {
    return 'ainda não palpitou'
  }

  return `${entry.accuracyPercent}% acerto (${entry.betsCorrect}/${entry.betsPlaced})`
}

export default function RankingList({
  entries,
  highlightUserId,
  groupId,
  emptyMessage = 'Nenhum ponto ainda.',
}: Props) {
  if (entries.length === 0) {
    return <p className="text-center text-sm text-stone-500 py-4">{emptyMessage}</p>
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

        const rowClassName = cn(
          'flex items-center gap-3 rounded-xl border px-3 py-2.5',
          index < 3 ? podiumStyles[index] : 'border-stone-100 bg-stone-50/50',
          isMe && 'ring-2 ring-brand-500/30',
          groupId ? 'transition hover:border-brand-200 hover:bg-brand-50/30' : undefined
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
                {entry.currentStreak >= 3 && (
                  <span className="ml-1.5 text-xs font-semibold text-orange-600">
                    🔥 {entry.currentStreak}
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-stone-500">{rankingSubtitle(entry)}</p>
            </div>
            <span className="shrink-0 font-semibold text-brand-700">{entry.totalPoints} pts</span>
          </>
        )

        return (
          <li key={entry.userId}>
            {groupId ? (
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
