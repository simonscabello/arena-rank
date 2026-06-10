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
}

type Props = {
  achievements: Achievement[]
  lockedAchievements: Achievement[]
  maxTitleSlots: number
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
            Ainda bloqueadas
          </p>
          <div className="grid gap-2">
            {lockedAchievements.slice(0, 6).map((achievement) => (
              <div
                key={achievement.id}
                className="rounded-xl border border-dashed border-stone-200 px-3 py-2.5 opacity-70"
              >
                <p className="font-medium text-stone-700">
                  {achievement.icon} {achievement.name}
                </p>
                <p className="text-xs text-stone-500">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
