import BackLink from '~/components/BackLink'
import EloRankingHint from '~/components/EloRankingHint'
import PageHeader from '~/components/PageHeader'
import RankingList, { type RankingEntry } from '~/components/RankingList'

type Props = {
  ranking: RankingEntry[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
  currentUserId: number
}

export default function RankingIndex({ ranking, meta, currentUserId }: Props) {
  return (
    <>
      <PageHeader
        back={<BackLink route="groups.index" label="Plays" />}
        title="Ranking global"
        subtitle="ELO de todos os jogadores — vale em todas as Plays"
      />

      <EloRankingHint className="mb-4" />

      <RankingList entries={ranking} highlightUserId={currentUserId} />

      {meta.lastPage > 1 && (
        <p className="mt-4 text-center text-xs text-stone-500">
          Página {meta.currentPage} de {meta.lastPage} · {meta.total} jogadores
        </p>
      )}
    </>
  )
}
