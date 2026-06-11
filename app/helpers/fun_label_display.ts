import { resolveDisplayFunLabel } from '#helpers/streak_fun_label'
import { getStreaksForUser } from '#helpers/match_streaks'

export async function resolveUserDisplayFunLabel(
  userId: number,
  storedFunLabel: string | null | undefined
): Promise<string | null> {
  const { winStreak, lossStreak } = await getStreaksForUser(userId)
  return resolveDisplayFunLabel(storedFunLabel, winStreak, lossStreak, userId)
}

export async function resolveDisplayFunLabelsByUserIds(
  entries: { userId: number; funLabel: string | null | undefined }[]
): Promise<Map<number, string | null>> {
  const result = new Map<number, string | null>()

  await Promise.all(
    entries.map(async ({ userId, funLabel }) => {
      result.set(userId, await resolveUserDisplayFunLabel(userId, funLabel))
    })
  )

  return result
}
