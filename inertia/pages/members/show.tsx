import { Link } from '@adonisjs/inertia/react'
import { MapPin, Trophy } from 'lucide-react'
import BackLink from '~/components/BackLink'
import Avatar from '~/components/Avatar'
import Card from '~/components/Card'
import EmptyState from '~/components/EmptyState'
import PageHeader from '~/components/PageHeader'
import { displayName } from '~/lib/match'

type Member = {
  id: number
  fullName: string | null
  email: string
  nickname: string | null
  funLabel: string | null
  initials: string
  avatarUrl: string | null
  dominantHandLabel: string | null
  courtSideLabel: string | null
  skillLevelLabel: string | null
}

type PartnerSummary = {
  userId: number
  fullName: string | null
  email: string
  nickname: string | null
  winsTogether: number
  gamesTogether: number
}

type Stats = {
  wins: number
  losses: number
  matchesPlayed: number
  betPoints: number
  bestPartner: PartnerSummary | null
  worstPartner: PartnerSummary | null
  byArena: {
    arenaId: number
    arenaName: string
    city: string | null
    wins: number
    losses: number
    played: number
  }[]
  recentMatches: {
    matchId: number
    arenaName: string
    city: string | null
    won: boolean
    playedAt: string
    partnerName: string | null
  }[]
}

type Props = {
  group: { id: number; name: string }
  member: Member
  stats: Stats
  isSelf: boolean
}

function partnerName(partner: PartnerSummary) {
  return partner.nickname || partner.fullName || partner.email.split('@')[0]
}

export default function MemberShow({ group, member, stats, isSelf }: Props) {
  const winRate =
    stats.matchesPlayed > 0 ? Math.round((stats.wins / stats.matchesPlayed) * 100) : 0

  return (
    <>
      <PageHeader
        back={<BackLink route="groups.show" routeParams={{ id: group.id }} label={group.name} />}
        title={displayName(member)}
        subtitle={
          <span className="block space-y-1">
            {member.funLabel && (
              <span className="block text-sm italic text-brand-700">{member.funLabel}</span>
            )}
            {isSelf ? (
              <Link route="profile.show" className="text-sm font-medium text-brand-600 hover:underline">
                Editar meu perfil
              </Link>
            ) : (
              !member.funLabel && (
                <span className="text-sm text-stone-500">Perfil na Play</span>
              )
            )}
          </span>
        }
      />

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <Avatar initials={member.initials} src={member.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1 text-sm text-stone-600">
          {member.skillLevelLabel && <p>Nível: {member.skillLevelLabel}</p>}
          {member.dominantHandLabel && <p>{member.dominantHandLabel}</p>}
          {member.courtSideLabel && <p>{member.courtSideLabel}</p>}
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center">
            <p className="text-2xl font-bold text-brand-700">{stats.wins}</p>
            <p className="text-xs text-stone-500">Vitórias</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-stone-700">{stats.losses}</p>
            <p className="text-xs text-stone-500">Derrotas</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-stone-900">{stats.matchesPlayed}</p>
            <p className="text-xs text-stone-500">Partidas</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-stone-900">{winRate}%</p>
            <p className="text-xs text-stone-500">Aproveitamento</p>
          </Card>
        </div>

        <Card title="Palpites na Play">
          <p className="text-2xl font-bold text-brand-700">{stats.betPoints}</p>
          <p className="text-sm text-stone-500">pontos acumulados</p>
        </Card>

        {stats.bestPartner && (
          <Card title="Melhor parceiro">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-stone-900">{partnerName(stats.bestPartner)}</p>
              <span className="text-sm text-stone-500">
                {stats.bestPartner.winsTogether} vitórias em {stats.bestPartner.gamesTogether}{' '}
                jogos
              </span>
            </div>
          </Card>
        )}

        {stats.worstPartner &&
          stats.worstPartner.userId !== stats.bestPartner?.userId && (
            <Card title="Parceiro mais difícil">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-stone-900">{partnerName(stats.worstPartner)}</p>
                <span className="text-sm text-stone-500">
                  {stats.worstPartner.winsTogether}/{stats.worstPartner.gamesTogether} vitórias
                </span>
              </div>
            </Card>
          )}

        <Card title="Por arena">
          {stats.byArena.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="Sem partidas finalizadas"
              description="As estatísticas por arena aparecem após partidas encerradas."
            />
          ) : (
            <ul className="space-y-2">
              {stats.byArena.map((arena) => (
                <li
                  key={arena.arenaId}
                  className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-stone-900">{arena.arenaName}</p>
                    {arena.city && <p className="text-stone-500">{arena.city}</p>}
                  </div>
                  <span className="text-stone-600">
                    {arena.wins}V · {arena.losses}D · {arena.played} jogos
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Histórico recente">
          {stats.recentMatches.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Nenhuma partida"
              description="Partidas finalizadas aparecem aqui."
            />
          ) : (
            <ul className="space-y-2">
              {stats.recentMatches.map((match) => (
                <li key={match.matchId}>
                  <Link
                    route="matches.show"
                    routeParams={{ id: match.matchId }}
                    className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-3 transition hover:border-brand-200"
                  >
                    <div>
                      <p className="font-medium text-stone-900">{match.arenaName}</p>
                      <p className="text-xs text-stone-500">
                        {match.partnerName ? `com ${match.partnerName}` : 'Sem parceiro'}
                        {match.city ? ` · ${match.city}` : ''}
                      </p>
                    </div>
                    <span
                      className={
                        match.won
                          ? 'rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 ring-inset'
                          : 'rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 ring-1 ring-stone-200 ring-inset'
                      }
                    >
                      {match.won ? 'Vitória' : 'Derrota'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
