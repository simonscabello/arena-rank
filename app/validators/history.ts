import vine from '@vinejs/vine'

export const historyFiltersValidator = vine.create({
  tab: vine.enum(['matches', 'bets']).optional(),
  groupId: vine.number().withoutDecimals().optional(),
  arenaId: vine.number().withoutDecimals().optional(),
  partnerId: vine.number().withoutDecimals().optional(),
  from: vine.string().trim().optional(),
  to: vine.string().trim().optional(),
  page: vine.number().withoutDecimals().min(1).optional(),
})

export type ValidatedHistoryFilters = Awaited<ReturnType<typeof historyFiltersValidator.validate>>
