export type MatchSetScore = {
  side1: number
  side2: number
}

export type MatchScore = {
  sets: MatchSetScore[]
}

export type SetInput = {
  side1?: number | string | null
  side2?: number | string | null
}

function parseGames(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 99) return null
  return parsed
}

export function normalizeSets(input: SetInput[] | undefined): MatchSetScore[] | null {
  if (!input?.length) return null

  const sets: MatchSetScore[] = []
  let sawPartial = false

  for (const row of input) {
    const side1 = parseGames(row.side1)
    const side2 = parseGames(row.side2)
    const hasSide1 = side1 !== null
    const hasSide2 = side2 !== null

    if (!hasSide1 && !hasSide2) continue

    if (hasSide1 !== hasSide2) {
      sawPartial = true
      continue
    }

    sets.push({ side1: side1!, side2: side2! })
  }

  if (sawPartial && sets.length === 0) {
    return null
  }

  if (sets.length === 0) return null
  if (sets.length > 3) return null

  return sets
}

export function setsHavePartialInput(input: SetInput[] | undefined): boolean {
  if (!input?.length) return false

  for (const row of input) {
    const side1 = parseGames(row.side1)
    const side2 = parseGames(row.side2)
    const hasSide1 = side1 !== null
    const hasSide2 = side2 !== null
    if (hasSide1 !== hasSide2) return true
  }

  return false
}

export function validateSets(
  sets: MatchSetScore[] | null,
  winnerSide?: number
): { ok: true } | { ok: false; message: string } {
  if (!sets) return { ok: true }

  if (sets.length < 1 || sets.length > 3) {
    return { ok: false, message: 'Informe de 1 a 3 sets completos' }
  }

  let side1Sets = 0
  let side2Sets = 0

  for (const set of sets) {
    if (set.side1 === set.side2) {
      return { ok: false, message: 'Cada set precisa ter um vencedor (placares diferentes)' }
    }
    if (set.side1 > set.side2) side1Sets++
    else side2Sets++
  }

  if (winnerSide === 1 && side1Sets <= side2Sets) {
    return {
      ok: false,
      message: 'O placar não confere com a dupla vencedora informada',
    }
  }

  if (winnerSide === 2 && side2Sets <= side1Sets) {
    return {
      ok: false,
      message: 'O placar não confere com a dupla vencedora informada',
    }
  }

  return { ok: true }
}

export function parseMatchScore(raw: unknown): MatchScore | null {
  if (!raw || typeof raw !== 'object') return null
  const sets = (raw as MatchScore).sets
  if (!Array.isArray(sets) || sets.length === 0) return null

  const normalized = normalizeSets(
    sets.map((set) => ({
      side1: typeof set?.side1 === 'number' ? set.side1 : null,
      side2: typeof set?.side2 === 'number' ? set.side2 : null,
    }))
  )

  if (!normalized) return null
  return { sets: normalized }
}

export function formatMatchScore(score: MatchScore | null): string | null {
  if (!score?.sets.length) return null
  return score.sets.map((set) => `${set.side1}-${set.side2}`).join(' · ')
}
