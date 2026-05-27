import { cn, displayName } from '~/lib/match'
import Avatar from '~/components/Avatar'

type Player = {
  userId: number
  fullName: string | null
  email: string
  nickname?: string | null
  funLabel?: string | null
  initials: string
  avatarUrl?: string | null
}

type Props = {
  side: 1 | 2
  players: Player[]
  isWinner?: boolean
}

export default function TeamCard({ side, players, isWinner }: Props) {
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
        Dupla {side}
        {isWinner && <span className="ml-1 text-emerald-600">✓</span>}
      </p>
      <ul className="space-y-2">
        {players.map((p) => (
          <li key={p.userId} className="flex items-center gap-2">
            <Avatar initials={p.initials} src={p.avatarUrl} size="sm" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-stone-800">{displayName(p)}</span>
              {p.funLabel && (
                <span className="block truncate text-xs italic text-stone-500">{p.funLabel}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
