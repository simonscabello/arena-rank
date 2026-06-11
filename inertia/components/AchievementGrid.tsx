import { Form } from '@adonisjs/inertia/react'
import ProfileBadge from '~/components/ProfileBadge'
import { buttonClassName } from '~/lib/button_styles'
import { cn } from '~/lib/match'

type Achievement = {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  categoryLabel: string
  unlockedAt?: string
  equipped?: boolean
  criteriaLabel?: string | null
  current?: number | null
  target?: number | null
  progressPercent?: number | null
}

type Props = {
  achievements: Achievement[]
  lockedAchievements: Achievement[]
  maxTitleSlots: number
}

function ProgressBar({ current, target }: { current: number; target: number }) {
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0

  return (
    <div className="mt-2">
      <div className="mb-1 flex justify-between text-xs text-stone-500">
        <span>
          {current}/{target}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default function AchievementGrid({
  achievements,
  lockedAchievements,
  maxTitleSlots,
}: Props) {
  const equippedCount = achievements.filter((item) => item.equipped).length

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600">
        {achievements.length} conquista(s) desbloqueada(s) · {equippedCount}/{maxTitleSlots} títulos
        equipados
      </p>

      {achievements.length > 0 && (
        <div className="grid gap-2">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                'flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5',
                achievement.equipped
                  ? 'border-brand-200 bg-brand-50/50'
                  : 'border-stone-200 bg-white'
              )}
            >
              <div className="min-w-0">
                <p className="font-medium text-stone-800">
                  <ProfileBadge icon={achievement.icon} title={achievement.name} />
                  <span className="ml-2">{achievement.name}</span>
                </p>
                <p className="text-xs text-stone-500">{achievement.description}</p>
              </div>
              {achievement.equipped ? (
                <Form route="profile.unequip" className="shrink-0">
                  <input type="hidden" name="achievementId" value={achievement.id} />
                  <button type="submit" className={buttonClassName('secondary', 'sm')}>
                    Desequipar
                  </button>
                </Form>
              ) : (
                <Form route="profile.equip" className="shrink-0">
                  <input type="hidden" name="achievementId" value={achievement.id} />
                  <button type="submit" className={buttonClassName('primary', 'sm')}>
                    Equipar
                  </button>
                </Form>
              )}
            </div>
          ))}
        </div>
      )}

      {lockedAchievements.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
            Ainda bloqueadas ({lockedAchievements.length})
          </p>
          <div className="grid gap-2">
            {lockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="rounded-xl border border-dashed border-stone-200 px-3 py-2.5 opacity-80"
              >
                <p className="font-medium text-stone-700">
                  {achievement.icon} {achievement.name}
                </p>
                <p className="text-xs text-stone-500">{achievement.description}</p>
                {achievement.criteriaLabel && (
                  <p className="mt-1 text-xs font-medium text-brand-700">
                    {achievement.criteriaLabel}
                  </p>
                )}
                {achievement.current !== null &&
                  achievement.current !== undefined &&
                  achievement.target !== null &&
                  achievement.target !== undefined &&
                  achievement.target > 0 && (
                    <ProgressBar current={achievement.current} target={achievement.target} />
                  )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
