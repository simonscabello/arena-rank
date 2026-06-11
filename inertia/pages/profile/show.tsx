import { usePage } from '@inertiajs/react'
import BackLink from '~/components/BackLink'
import PageHeader from '~/components/PageHeader'
import ProfileAccountSection from '~/components/profile/ProfileAccountSection'
import ProfileAchievementsSection from '~/components/profile/ProfileAchievementsSection'
import ProfileHub from '~/components/profile/ProfileHub'
import ProfilePlaySection from '~/components/profile/ProfilePlaySection'
import ProfileProgressionSection from '~/components/profile/ProfileProgressionSection'
import type {
  LockedAchievement,
  Option,
  ProfileAchievement,
  ProfileData,
  ProfileFrame,
  ProfileProgression,
  ProfileSection,
} from '~/components/profile/types'

type Props = {
  section: ProfileSection | null
  maxTitleSlots: number
  progression: ProfileProgression
  achievements: ProfileAchievement[]
  lockedAchievements: LockedAchievement[]
  frames: ProfileFrame[]
  account: {
    fullName: string | null
    email: string
  }
  profile: ProfileData
  statusSuggestions: string[]
  options: {
    dominantHands: Option[]
    courtSides: Option[]
    skillLevels: Option[]
  }
}

const SECTION_META: Record<
  ProfileSection,
  { title: string; subtitle: string }
> = {
  progression: {
    title: 'Progressão',
    subtitle: 'ELO, nível e títulos equipados',
  },
  achievements: {
    title: 'Conquistas',
    subtitle: 'Títulos e molduras de avatar',
  },
  play: {
    title: 'Perfil na Play',
    subtitle: 'Como você aparece nas Plays',
  },
  account: {
    title: 'Conta',
    subtitle: 'Dados vinculados ao Google',
  },
}

function isProfileSection(value: unknown): value is ProfileSection {
  return (
    value === 'progression' ||
    value === 'achievements' ||
    value === 'play' ||
    value === 'account'
  )
}

export default function ProfileShow({
  section,
  maxTitleSlots,
  progression,
  achievements,
  lockedAchievements,
  frames,
  account,
  profile,
  statusSuggestions,
  options,
}: Props) {
  const page = usePage()
  const urlSection = new URLSearchParams(page.url.split('?')[1] ?? '').get('section')
  const activeSection = section ?? (isProfileSection(urlSection) ? urlSection : null)

  const meta = activeSection ? SECTION_META[activeSection] : null

  return (
    <>
      <PageHeader
        back={
          activeSection ? (
            <BackLink href="/perfil" label="Meu perfil" />
          ) : (
            <BackLink route="groups.index" label="Plays" />
          )
        }
        title={meta?.title ?? 'Meu perfil'}
        subtitle={meta?.subtitle ?? 'Escolha o que quer ver ou editar'}
      />

      {!activeSection && (
        <ProfileHub
          profile={profile}
          progression={progression}
          achievementsUnlocked={achievements.length}
          accountEmail={account.email}
        />
      )}

      {activeSection === 'progression' && (
        <ProfileProgressionSection progression={progression} profile={profile} />
      )}

      {activeSection === 'achievements' && (
        <ProfileAchievementsSection
          maxTitleSlots={maxTitleSlots}
          achievements={achievements}
          lockedAchievements={lockedAchievements}
          frames={frames}
          initials={profile.initials}
          avatarUrl={profile.avatarUrl}
        />
      )}

      {activeSection === 'play' && (
        <ProfilePlaySection
          profile={profile}
          statusSuggestions={statusSuggestions}
          options={options}
        />
      )}

      {activeSection === 'account' && <ProfileAccountSection account={account} />}
    </>
  )
}
