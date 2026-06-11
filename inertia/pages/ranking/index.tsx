import { Link } from '@adonisjs/inertia/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import BackLink from '~/components/BackLink'
import EloRankingHint from '~/components/EloRankingHint'
import PageHeader from '~/components/PageHeader'
import RankingList, { type RankingEntry } from '~/components/RankingList'
import { buttonClassName } from '~/lib/button_styles'

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
        <div className="mt-6 flex items-center justify-between gap-3">
          {meta.currentPage > 1 ? (
            <Link
              href={`/ranking?page=${meta.currentPage - 1}`}
              className={buttonClassName('secondary', 'sm')}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Link>
          ) : (
            <span className={`${buttonClassName('secondary', 'sm')} pointer-events-none opacity-40`}>
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </span>
          )}

          <p className="text-center text-xs text-stone-500">
            Página {meta.currentPage} de {meta.lastPage} · {meta.total} jogadores
          </p>

          {meta.currentPage < meta.lastPage ? (
            <Link
              href={`/ranking?page=${meta.currentPage + 1}`}
              className={buttonClassName('secondary', 'sm')}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className={`${buttonClassName('secondary', 'sm')} pointer-events-none opacity-40`}>
              Próxima
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      )}
    </>
  )
}
