import {
  getHistoryFilterOptions,
  getMatchHistory,
  type HistoryFilters,
} from '#helpers/player_history'

export function normalizeHistoryFilters(raw: Record<string, unknown>): HistoryFilters {
  return {
    groupId: raw.groupId ? Number(raw.groupId) : undefined,
    arenaId: raw.arenaId ? Number(raw.arenaId) : undefined,
    partnerId: raw.partnerId ? Number(raw.partnerId) : undefined,
    from: raw.from ? String(raw.from) : undefined,
    to: raw.to ? String(raw.to) : undefined,
    page: raw.page ? Number(raw.page) : undefined,
  }
}

export async function buildHistoryPagePayload(
  userId: number,
  filters: HistoryFilters,
  visibleGroupIds?: number[]
) {
  const filterOptions = await getHistoryFilterOptions(userId, visibleGroupIds)
  const historyData = await getMatchHistory(userId, filters, visibleGroupIds)

  return {
    filters,
    filterOptions,
    items: historyData.items,
    summary: historyData.summary,
    pagination: historyData.pagination,
    currentUserId: userId,
  }
}
