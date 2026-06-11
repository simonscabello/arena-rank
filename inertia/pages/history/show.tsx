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
  history: {
    filters: HistoryFilters
    filterOptions: HistoryFilterOptions
    items: HistoryMatchItem[]
    summary: HistorySummary
    pagination: HistoryPagination
    currentUserId: number
  }
}

export default function HistoryShow({ history }: Props) {
  return (
    <>
      <PageHeader
        back={<BackLink route="groups.index" label="Plays" />}
        title="Histórico"
        subtitle="Suas partidas finalizadas"
      />
      <ProfileHistorySection {...history} />
    </>
  )
}
