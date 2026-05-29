import { displayPerson } from '#helpers/person_display'
import db from '@adonisjs/lucid/services/db'
import type { DatabaseQueryBuilderContract } from '@adonisjs/lucid/types/querybuilder'

export type PartnerNameRow = {
  partnerFullName: string | null
  partnerEmail: string | null
  partnerNickname: string | null
  partnerDisplayName: string | null
}

export function applyFinalizedPlayerMatchScope(
  query: DatabaseQueryBuilderContract,
  groupId: number,
  userId: number
) {
  query
    .innerJoin('matches as m', 'mp.match_id', 'm.id')
    .where('m.group_id', groupId)
    .where('m.status', 'finalizada')
    .where('mp.user_id', userId)
}

export function winLossAggregation() {
  return {
    wins: db.raw('SUM(CASE WHEN mp.side = m.winner_side THEN 1 ELSE 0 END) as wins'),
    losses: db.raw('SUM(CASE WHEN mp.side != m.winner_side THEN 1 ELSE 0 END) as losses'),
    played: db.raw('COUNT(*) as played'),
  }
}

export function joinTeammateForUser(query: DatabaseQueryBuilderContract, userId: number) {
  query.leftJoin('match_players as teammate', (join) => {
    join
      .on('teammate.match_id', 'mp.match_id')
      .andOn('teammate.side', 'mp.side')
      .andOnVal('teammate.user_id', '!=', userId)
  })
  query.leftJoin('users as partner', 'teammate.user_id', 'partner.id')
}

export function partnerNameSelectColumns() {
  return [
    'partner.full_name as partnerFullName',
    'partner.email as partnerEmail',
    'partner.nickname as partnerNickname',
    'teammate.display_name as partnerDisplayName',
  ]
}

export function resolvePartnerName(row: PartnerNameRow) {
  if (row.partnerEmail) {
    return displayPerson({
      fullName: row.partnerFullName,
      email: row.partnerEmail,
      nickname: row.partnerNickname,
    })
  }

  if (row.partnerDisplayName) {
    return String(row.partnerDisplayName)
  }

  return null
}

export function mapMatchOutcome(row: { side: unknown; winnerSide: unknown }) {
  return Number(row.side) === Number(row.winnerSide)
}
