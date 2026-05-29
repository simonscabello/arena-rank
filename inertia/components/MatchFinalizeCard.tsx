import { router } from '@inertiajs/react'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import Card from '~/components/Card'
import { buttonClassName } from '~/lib/button_styles'
import { inferWinnerSideFromSets } from '~/lib/match'

type SetRow = { side1: string; side2: string }

function hasPartialSetRow(row: SetRow) {
  const hasSide1 = row.side1.trim() !== ''
  const hasSide2 = row.side2.trim() !== ''
  return hasSide1 !== hasSide2
}

function buildSetsPayload(rows: SetRow[]) {
  const sets: { side1: number; side2: number }[] = []

  for (const row of rows) {
    const hasSide1 = row.side1.trim() !== ''
    const hasSide2 = row.side2.trim() !== ''
    if (!hasSide1 && !hasSide2) continue
    if (hasPartialSetRow(row)) return null
    sets.push({
      side1: Number.parseInt(row.side1, 10),
      side2: Number.parseInt(row.side2, 10),
    })
  }

  return sets.length > 0 ? sets : null
}

type Props = {
  matchId: number
  side1Label: string
  side2Label: string
}

export default function MatchFinalizeCard({ matchId, side1Label, side2Label }: Props) {
  const [setRows, setSetRows] = useState<SetRow[]>([{ side1: '', side2: '' }])
  const [error, setError] = useState('')

  function updateSetRow(index: number, field: 'side1' | 'side2', value: string) {
    setSetRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function addSetRow() {
    if (setRows.length >= 3) return
    setSetRows((prev) => [...prev, { side1: '', side2: '' }])
  }

  const sets = buildSetsPayload(setRows)
  const inferredWinner =
    sets && !setRows.some(hasPartialSetRow) ? inferWinnerSideFromSets(sets) : null
  const winnerLabel = inferredWinner === 1 ? side1Label : inferredWinner === 2 ? side2Label : null

  function submit() {
    if (setRows.some(hasPartialSetRow)) {
      setError('Preencha os dois lados de cada set')
      return
    }

    if (!sets) {
      setError('Informe o placar de pelo menos um set')
      return
    }

    if (sets.some((set) => set.side1 === set.side2)) {
      setError('Cada set precisa ter um vencedor (placares diferentes)')
      return
    }

    if (inferredWinner === null) {
      setError('O placar está empatado — adicione mais sets ou ajuste os placares')
      return
    }

    setError('')
    router.post(`/partidas/${matchId}/finalizar`, { sets })
  }

  return (
    <Card title="Registrar resultado" className="mb-6">
      <div className="mb-2 grid grid-cols-[3rem_1fr_1fr] gap-x-2 gap-y-2 text-xs font-medium text-stone-500">
        <span />
        <span className="truncate text-center text-brand-700">{side1Label}</span>
        <span className="truncate text-center text-amber-800">{side2Label}</span>
      </div>
      {setRows.map((row, index) => (
        <div key={index} className="mb-2 grid grid-cols-[3rem_1fr_1fr] items-center gap-x-2">
          <span className="text-xs font-medium text-stone-500">Set {index + 1}</span>
          <input
            type="number"
            min={0}
            max={99}
            inputMode="numeric"
            value={row.side1}
            onChange={(e) => updateSetRow(index, 'side1', e.target.value)}
            placeholder="—"
            aria-label={`Set ${index + 1} — ${side1Label}`}
            className="h-10 w-full rounded-xl border border-brand-200 bg-white px-2 text-center text-stone-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <input
            type="number"
            min={0}
            max={99}
            inputMode="numeric"
            value={row.side2}
            onChange={(e) => updateSetRow(index, 'side2', e.target.value)}
            placeholder="—"
            aria-label={`Set ${index + 1} — ${side2Label}`}
            className="h-10 w-full rounded-xl border border-amber-200 bg-white px-2 text-center text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      ))}

      {setRows.length < 3 && (
        <button
          type="button"
          onClick={addSetRow}
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
        >
          <Plus className="h-4 w-4" />
          Adicionar set
        </button>
      )}

      {winnerLabel && (
        <p className="mb-4 text-sm font-medium text-stone-800">
          Vencedor: <span className="text-brand-700">{winnerLabel}</span>
        </p>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <button type="button" onClick={submit} className={buttonClassName('primary', 'md', true)}>
        Finalizar partida
      </button>
    </Card>
  )
}
