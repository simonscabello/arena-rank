type SetScore = { side1: number; side2: number }

export function finalizePayload(winnerSide: 1 | 2, sets?: SetScore[]) {
  if (sets) {
    return { sets }
  }

  if (winnerSide === 1) {
    return { sets: [{ side1: 6, side2: 4 }] }
  }

  return { sets: [{ side1: 4, side2: 6 }] }
}
