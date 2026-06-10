import AvatarFrame from '#models/avatar_frame'
import UserUnlockedFrame from '#models/user_unlocked_frame'
import { DateTime } from 'luxon'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export async function unlockFramesUpToLevel(
  userId: number,
  level: number,
  trx: TransactionClientContract
) {
  const frames = await AvatarFrame.query({ client: trx })
    .where('unlock_level', '<=', level)
    .select('id')

  if (frames.length === 0) return

  const existing = await UserUnlockedFrame.query({ client: trx })
    .where('user_id', userId)
    .whereIn(
      'avatar_frame_id',
      frames.map((f) => f.id)
    )
    .select('avatar_frame_id')

  const existingIds = new Set(existing.map((row) => row.avatarFrameId))
  const now = DateTime.now()

  for (const frame of frames) {
    if (existingIds.has(frame.id)) continue
    await UserUnlockedFrame.create(
      {
        userId,
        avatarFrameId: frame.id,
        unlockedAt: now,
      },
      { client: trx }
    )
  }
}

export async function syncUnlockedFramesForLevel(
  userId: number,
  level: number,
  trx: TransactionClientContract
) {
  const allowedFrames = await AvatarFrame.query({ client: trx })
    .where('unlock_level', '<=', level)
    .select('id')

  const allowedIds = allowedFrames.map((f) => f.id)

  if (allowedIds.length === 0) {
    await UserUnlockedFrame.query({ client: trx }).where('user_id', userId).delete()
    return
  }

  await UserUnlockedFrame.query({ client: trx })
    .where('user_id', userId)
    .whereNotIn('avatar_frame_id', allowedIds)
    .delete()

  await unlockFramesUpToLevel(userId, level, trx)
}
