import BackLink from '~/components/BackLink'
import PageHeader from '~/components/PageHeader'
import ProfileHistorySection from '~/components/profile/ProfileHistorySection'
import type {
  HistoryFilterOptions,
  HistoryFilters,
  HistoryMatchItem,
  HistoryPagination,
  HistorySummary,
} from '~/components/profile/types'

type Props = {
  player: {
    id: number
    name: string
  }
  history: {
    filters: HistoryFilters
    filterOptions: HistoryFilterOptions
    items: HistoryMatchItem[]
    summary: HistorySummary
    pagination: HistoryPagination
    currentUserId: number
  }
}

export default function PlayerHistoryShow({ player, history }: Props) {
  return (
    <>
      <PageHeader
        back={<BackLink route="ranking.index" label="Ranking" />}
        title={`Histórico de ${player.name}`}
        subtitle="Partidas finalizadas nas Plays em comum"
      />
      <ProfileHistorySection {...history} playerUserId={player.id} />
    </>
  )
}
