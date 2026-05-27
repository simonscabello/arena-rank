import vine from '@vinejs/vine'

export const createMatchValidator = vine.create({
  arenaId: vine.number().optional(),
  arenaName: vine.string().trim().minLength(2).maxLength(100).optional(),
  arenaCity: vine.string().trim().maxLength(100).optional(),
  players: vine
    .array(
      vine.object({
        userId: vine.number(),
        side: vine.number().in([1, 2]),
      })
    )
    .minLength(4)
    .maxLength(4),
  skipBets: vine.boolean().optional(),
})

export const placeBetValidator = vine.create({
  predictedSide: vine.number().in([1, 2]),
})

export const finalizeMatchValidator = vine.create({
  winnerSide: vine.number().in([1, 2]),
})
