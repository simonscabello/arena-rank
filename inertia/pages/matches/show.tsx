import { Form } from '@adonisjs/inertia/react'
import { Target, Users } from 'lucide-react'
import BackLink from '~/components/BackLink'
import Badge from '~/components/Badge'
import Card from '~/components/Card'
import EmptyState from '~/components/EmptyState'
import PageHeader from '~/components/PageHeader'
import RankingList, { type RankingEntry } from '~/components/RankingList'
import TeamCard from '~/components/TeamCard'
import { buttonClassName } from '~/lib/button_styles'
import { displayName } from '~/lib/match'

type Player = {
  userId: number
  side: number
  fullName: string | null
  email: string
  nickname?: string | null
  funLabel?: string | null
  initials: string
  avatarUrl?: string | null
}

type Bet = {
  userId: number
  predictedSide: number
  pointsAwarded: number | null
  fullName: string | null
  email: string
}

type Props = {
  match: {
    id: number
    status: string
    winnerSide: number | null
    arenaName: string
    groupId: number
  }
  players: Player[]
  bets: Bet[]
  ranking: RankingEntry[]
  isPlayer: boolean
  userBet: { predictedSide: number; pointsAwarded: number | null } | null
  currentUserId: number
  canManageMatch: boolean
  betsPossible: boolean
  skipsBets: boolean
}

function playersBySide(players: Player[], side: number) {
  return players.filter((p) => p.side === side)
}

export default function MatchShow({
  match,
  players,
  bets,
  ranking,
  isPlayer,
  userBet,
  currentUserId,
  canManageMatch,
  betsPossible,
  skipsBets,
}: Props) {
  const side1 = playersBySide(players, 1)
  const side2 = playersBySide(players, 2)

  return (
    <>
      <PageHeader
        back={
          <BackLink route="groups.show" routeParams={{ id: match.groupId }} label="Play" />
        }
        title={match.arenaName}
        subtitle={<Badge status={match.status} />}
      />

      <Card className="mb-6">
        <div className="flex gap-3">
          <TeamCard side={1} players={side1} isWinner={match.winnerSide === 1} />
          <div className="flex shrink-0 items-center text-xs font-bold text-stone-400">VS</div>
          <TeamCard side={2} players={side2} isWinner={match.winnerSide === 2} />
        </div>
      </Card>

      {skipsBets && match.status !== 'finalizada' && (
        <p className="mb-6 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          Partida sem palpites — apenas histórico de vitórias e derrotas.
        </p>
      )}

      {match.status === 'palpites_abertos' && betsPossible && !isPlayer && !userBet && (
        <Card title="Seu palpite" className="mb-6">
          <p className="mb-4 text-sm text-stone-500">Quem vence esta partida?</p>
          <div className="grid grid-cols-2 gap-3">
            <Form route="matches.bet" routeParams={{ id: match.id }} className="contents">
              <input type="hidden" name="predictedSide" value="1" />
              <button type="submit" className={buttonClassName('primary', 'lg', true)}>
                Dupla 1
              </button>
            </Form>
            <Form route="matches.bet" routeParams={{ id: match.id }} className="contents">
              <input type="hidden" name="predictedSide" value="2" />
              <button
                type="submit"
                className={buttonClassName('primary', 'lg', true, 'bg-amber-500 hover:bg-amber-600')}
              >
                Dupla 2
              </button>
            </Form>
          </div>
        </Card>
      )}

      {userBet && (
        <Card className="mb-6 border-brand-200 bg-brand-50/50">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-brand-600" />
            <div>
              <p className="font-semibold text-stone-900">Seu palpite: Dupla {userBet.predictedSide}</p>
              {userBet.pointsAwarded !== null && (
                <p className="text-sm text-stone-600">
                  {userBet.pointsAwarded > 0
                    ? `+${userBet.pointsAwarded} pontos`
                    : '0 pontos nesta partida'}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {isPlayer && match.status === 'palpites_abertos' && betsPossible && (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Você está jogando — não pode palpitar nesta partida.
        </p>
      )}

      {match.status === 'palpites_abertos' && betsPossible && canManageMatch && (
        <Form route="matches.start" routeParams={{ id: match.id }} className="mb-6">
          <button type="submit" className={buttonClassName('secondary', 'lg', true)}>
            Iniciar partida (fechar palpites)
          </button>
        </Form>
      )}

      {canManageMatch &&
        (match.status === 'em_andamento' ||
          (match.status === 'palpites_abertos' && skipsBets)) && (
        <Card title="Registrar resultado" className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            <Form route="matches.finalize" routeParams={{ id: match.id }}>
              <input type="hidden" name="winnerSide" value="1" />
              <button type="submit" className={buttonClassName('primary', 'md', true)}>
                Dupla 1 venceu
              </button>
            </Form>
            <Form route="matches.finalize" routeParams={{ id: match.id }}>
              <input type="hidden" name="winnerSide" value="2" />
              <button
                type="submit"
                className={buttonClassName('primary', 'md', true, 'bg-amber-500 hover:bg-amber-600')}
              >
                Dupla 2 venceu
              </button>
            </Form>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        <Card title={`Palpites (${bets.length})`}>
          {bets.length === 0 ? (
            <EmptyState
              icon={Users}
              title={skipsBets ? 'Partida sem palpites' : 'Nenhum palpite ainda'}
              description={
                skipsBets
                  ? 'O ranking de pontos não muda nesta partida.'
                  : undefined
              }
            />
          ) : (
            <ul className="divide-y divide-stone-100">
              {bets.map((bet) => (
                <li key={bet.userId} className="flex items-center justify-between py-3 first:pt-0">
                  <span className="font-medium text-stone-800">{displayName(bet)}</span>
                  <span className="text-sm text-stone-500">
                    Dupla {bet.predictedSide}
                    {bet.pointsAwarded !== null && (
                      <span className="ml-2 font-semibold text-brand-700">
                        {bet.pointsAwarded > 0 ? `+${bet.pointsAwarded}` : '0'} pts
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Ranking da Play">
          <RankingList entries={ranking} highlightUserId={currentUserId} />
        </Card>
      </div>
    </>
  )
}
