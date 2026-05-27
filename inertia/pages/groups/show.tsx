import { Link } from '@adonisjs/inertia/react'
import { Calendar, Plus, Users } from 'lucide-react'
import BackLink from '~/components/BackLink'
import Badge from '~/components/Badge'
import Card from '~/components/Card'
import CopyInviteCode from '~/components/CopyInviteCode'
import EmptyState from '~/components/EmptyState'
import PageHeader from '~/components/PageHeader'
import RankingList, { type RankingEntry } from '~/components/RankingList'
import Avatar from '~/components/Avatar'
import { buttonClassName } from '~/lib/button_styles'
import { displayName } from '~/lib/match'

type Member = {
  id: number
  fullName: string | null
  email: string
  nickname: string | null
  funLabel: string | null
  initials: string
  avatarUrl: string | null
}

type MatchItem = {
  id: number
  status: string
  arenaName: string
}

type Props = {
  group: { id: number; name: string; inviteCode: string }
  members: Member[]
  matches: MatchItem[]
  ranking: RankingEntry[]
  currentUserId: number
}

export default function GroupShow({ group, members, matches, ranking, currentUserId }: Props) {
  return (
    <>
      <PageHeader
        back={<BackLink route="groups.index" label="Plays" />}
        title={group.name}
        subtitle={
          <span className="block text-sm text-stone-500">
            Convide amigos com o código abaixo
          </span>
        }
      />

      <div className="mb-6 space-y-4">
        <CopyInviteCode code={group.inviteCode} />
        <Link
          route="groups.matches.create"
          routeParams={{ id: group.id }}
          className={buttonClassName('primary', 'lg', true)}
        >
          <Plus className="h-5 w-5" />
          Nova partida
        </Link>
      </div>

      <div className="space-y-6">
        <Card title="Partidas ativas">
          {matches.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhuma partida ativa"
              description="Crie uma partida para começar os palpites."
            />
          ) : (
            <ul className="space-y-2">
              {matches.map((match) => (
                <li key={match.id}>
                  <Link
                    route="matches.show"
                    routeParams={{ id: match.id }}
                    className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-3 transition hover:border-brand-200 hover:bg-brand-50/50"
                  >
                    <div>
                      <p className="font-medium text-stone-900">{match.arenaName}</p>
                      <div className="mt-1">
                        <Badge status={match.status} />
                      </div>
                    </div>
                    <span className="text-stone-400">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Ranking">
          <RankingList entries={ranking} highlightUserId={currentUserId} />
        </Card>

        <Card title={`Membros (${members.length})`}>
          <ul className="flex flex-wrap gap-2">
            {members.map((member) => (
              <li key={member.id}>
                <Link
                  route="members.show"
                  routeParams={{ groupId: group.id, userId: member.id }}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm transition hover:border-brand-200 hover:bg-brand-50/50"
                >
                  <Avatar initials={member.initials} src={member.avatarUrl} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate">{displayName(member)}</span>
                    {member.funLabel && (
                      <span className="block max-w-[140px] truncate text-xs italic text-stone-500">
                        {member.funLabel}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {members.length === 0 && (
            <EmptyState icon={Users} title="Sem membros" description="Convide amigos pelo código." />
          )}
        </Card>
      </div>
    </>
  )
}
