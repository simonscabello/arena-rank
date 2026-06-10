import EloTierBadge from '~/components/EloTierBadge'
import ProfileBadge from '~/components/ProfileBadge'
import Card from '~/components/Card'
import XpBar from '~/components/XpBar'
import type { ProfileData, ProfileProgression } from '~/components/profile/types'

type Props = {
  progression: ProfileProgression
  profile: Pick<ProfileData, 'equippedTitles'>
}

export default function ProfileProgressionSection({ progression, profile }: Props) {
  return (
    <Card title="Progressão">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-stone-500">Ranking competitivo</p>
            <p className="text-2xl font-bold text-brand-700">{progression.elo} ELO</p>
          </div>
          <EloTierBadge tier={progression.eloTier} label={progression.eloTierLabel} />
        </div>
        <XpBar
          current={progression.xpProgressCurrent}
          needed={progression.xpProgressNeeded}
          level={progression.level}
          xpToNextLevel={progression.xpToNextLevel}
        />
        {profile.equippedTitles.length > 0 && (
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-stone-700">
            <span className="font-medium text-stone-600">Títulos equipados:</span>
            {profile.equippedTitles.map((title) => (
              <ProfileBadge key={title.name} icon={title.icon} title={title.name} />
            ))}
          </p>
        )}
      </div>
    </Card>
  )
}
