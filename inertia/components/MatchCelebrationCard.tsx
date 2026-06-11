import { X } from 'lucide-react'
import { useState } from 'react'
import Card from '~/components/Card'
import { formatEloDelta, cn } from '~/lib/match'
import type { MatchCelebrationPayload } from '~/lib/match_celebration'

type Props = {
  celebration: MatchCelebrationPayload
}

function rankMessage(
  rankPosition: number | null,
  previousRankPosition: number | null
): string | null {
  if (rankPosition === null || previousRankPosition === null) return null
  if (rankPosition === previousRankPosition) return null
  if (rankPosition < previousRankPosition) {
    return `Você subiu para ${rankPosition}º na Play`
  }
  return `Você caiu para ${rankPosition}º na Play`
}

export default function MatchCelebrationCard({ celebration }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const rankChange = rankMessage(celebration.rankPosition, celebration.previousRankPosition)
  const hasTrollAchievement = celebration.achievements.some(
    (achievement) => achievement.category === 'troll'
  )

  return (
    <Card
      className={cn(
        'relative mb-6',
        hasTrollAchievement
          ? 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-stone-50'
          : 'border-brand-200 bg-gradient-to-br from-brand-50 to-white'
      )}
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
      <p
        className={cn(
          'mb-2 text-sm font-semibold',
          hasTrollAchievement ? 'text-amber-900' : 'text-brand-800'
        )}
      >
        Progressão registrada!
      </p>
      <p className="text-lg font-bold text-stone-900">
        +{celebration.xpAwarded} XP · {formatEloDelta(celebration.eloDelta)} ELO
      </p>
      {celebration.levelUp && (
        <p className="mt-2 text-sm font-medium text-brand-700">
          Subiu para o nível {celebration.levelUp.newLevel}!
        </p>
      )}
      {celebration.achievements.length > 0 && (
        <ul className="mt-3 space-y-1">
          {celebration.achievements.map((achievement) => {
            const isTroll = achievement.category === 'troll'
            return (
              <li key={achievement.name} className="text-sm text-stone-700">
                {achievement.icon}{' '}
                {isTroll ? (
                  <>
                    Novo título (sem orgulho):{' '}
                    <span className="font-medium text-amber-900">{achievement.name}</span>
                  </>
                ) : (
                  <>
                    Conquista desbloqueada:{' '}
                    <span className="font-medium">{achievement.name}</span>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {rankChange && <p className="mt-2 text-sm font-medium text-brand-700">{rankChange}</p>}
    </Card>
  )
}
