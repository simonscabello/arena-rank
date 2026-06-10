import { ChevronRight, History, Medal, Settings, Sparkles, TrendingUp, User } from 'lucide-react'
import Avatar from '~/components/Avatar'
import { navigateProfileSection } from '~/components/profile/navigate_section'
import type { ProfileData, ProfileProgression } from '~/components/profile/types'
import { cn } from '~/lib/match'

type HubCard = {
  section: 'progression' | 'achievements' | 'play' | 'account' | 'history'
  title: string
  description: string
  icon: typeof TrendingUp
}

type Props = {
  profile: ProfileData
  progression: ProfileProgression
  achievementsUnlocked: number
  accountEmail: string
  historyMatchesPlayed: number
}

function truncateEmail(email: string) {
  if (email.length <= 28) return email
  const [local, domain] = email.split('@')
  if (!domain) return email
  const shortLocal = local.length > 12 ? `${local.slice(0, 12)}…` : local
  return `${shortLocal}@${domain}`
}

export default function ProfileHub({
  profile,
  progression,
  achievementsUnlocked,
  accountEmail,
  historyMatchesPlayed,
}: Props) {
  const displayName = profile.nickname || profile.initials

  const cards: HubCard[] = [
    {
      section: 'progression',
      title: 'Progressão',
      description: `Nível ${progression.level} · ${progression.elo} ELO`,
      icon: TrendingUp,
    },
    {
      section: 'achievements',
      title: 'Conquistas',
      description:
        achievementsUnlocked > 0
          ? `${achievementsUnlocked} desbloqueada${achievementsUnlocked === 1 ? '' : 's'}`
          : 'Nenhuma desbloqueada ainda',
      icon: Medal,
    },
    {
      section: 'play',
      title: 'Perfil na Play',
      description: profile.nickname ? profile.nickname : 'Completar perfil',
      icon: User,
    },
    {
      section: 'account',
      title: 'Conta',
      description: truncateEmail(accountEmail),
      icon: Settings,
    },
    {
      section: 'history',
      title: 'Histórico',
      description:
        historyMatchesPlayed > 0
          ? `${historyMatchesPlayed} partida${historyMatchesPlayed === 1 ? '' : 's'}`
          : 'Suas partidas finalizadas',
      icon: History,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
        <Avatar
          initials={profile.initials}
          src={profile.avatarUrl}
          size="2xl"
          frameSrc={profile.avatarFrameSrc}
          photoInset={profile.avatarFrameInset}
        />
        <div>
          <p className="text-xl font-bold text-stone-900">{displayName}</p>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-stone-500">
            <Sparkles className="h-4 w-4 text-brand-600" />
            Nível {progression.level} · {progression.elo} ELO
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, index) => {
          const Icon = card.icon
          const isLastOdd = cards.length % 2 !== 0 && index === cards.length - 1

          return (
            <button
              key={card.section}
              type="button"
              onClick={() => navigateProfileSection(card.section)}
              className={cn(
                'flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-brand-200 hover:bg-brand-50/30',
                isLastOdd && 'col-span-2'
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-stone-900">{card.title}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
                </span>
                <span className="mt-0.5 block truncate text-sm text-stone-500">{card.description}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
