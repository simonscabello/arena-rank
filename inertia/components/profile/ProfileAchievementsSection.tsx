import AchievementGrid from '~/components/AchievementGrid'
import FramePicker from '~/components/FramePicker'
import Card from '~/components/Card'
import type { LockedAchievement, ProfileAchievement, ProfileFrame } from '~/components/profile/types'

type Props = {
  maxTitleSlots: number
  achievements: ProfileAchievement[]
  lockedAchievements: LockedAchievement[]
  frames: ProfileFrame[]
  initials: string
  avatarUrl: string | null
}

export default function ProfileAchievementsSection({
  maxTitleSlots,
  achievements,
  lockedAchievements,
  frames,
  initials,
  avatarUrl,
}: Props) {
  return (
    <div className="space-y-4">
      <Card title="Conquistas">
        <AchievementGrid
          achievements={achievements}
          lockedAchievements={lockedAchievements}
          maxTitleSlots={maxTitleSlots}
        />
      </Card>

      <Card title="Molduras de avatar">
        <FramePicker frames={frames} initials={initials} avatarUrl={avatarUrl} />
      </Card>
    </div>
  )
}
