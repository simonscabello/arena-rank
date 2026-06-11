import { buildCelebrationPayload } from '#helpers/match_celebration'
import { scoreMatchProgression } from '#helpers/match_progression'
import { createMatchWithPlayers } from '#helpers/match_creation'
import { assertGroupMember } from '#helpers/group_access'
import {
  assertCanFinalizeMatch,
  assertCanUndoOrCancelMatch,
  canFinalizeMatch,
  canUndoOrCancelMatch,
  isOrganizerOverride,
} from '#helpers/match_access'
import { clearMatchResult } from '#helpers/match_lifecycle'
import {
  isManageWindowOpen,
  manageWindowExpiresAt,
  markStatusChanged,
} from '#helpers/match_manage_window'
import { resolveDisplayFunLabelsByUserIds } from '#helpers/fun_label_display'
import { serializeMatchPlayer } from '#helpers/match_players'
import { DEFAULT_FRAME_INSET, getEquippedDisplayByUserIds } from '#helpers/cosmetic_display'
import { validateAndResolveMatchPlayers } from '#helpers/match_player_validation'
import { buildMatchShareCard } from '#helpers/match_share_card'
import {
  formatMatchScore,
  inferWinnerSideFromSets,
  normalizeSets,
  parseMatchScore,
  setsHavePartialInput,
  validateSets,
  type MatchScore,
} from '#helpers/match_score'
import { getGroupRanking, getMatchWithRelations, getRankContext } from '#helpers/ranking'
import GameMatch from '#models/game_match'
import Group from '#models/group'
import { createMatchValidator, finalizeMatchValidator } from '#validators/match'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class MatchesController {
  async store({ request, response, auth, session, params }: HttpContext) {
    const user = auth.user!
    const groupId = Number(params.groupId)
    await assertGroupMember(groupId, user)

    const payload = await request.validateUsing(createMatchValidator)
    const validation = await validateAndResolveMatchPlayers(payload.players, groupId)

    if (!validation.ok) {
      session.flash('error', validation.error)
      response.redirect().back()
      return
    }

    const created = await createMatchWithPlayers(groupId, user, payload, validation.resolved)

    if (!created.ok) {
      session.flash('error', created.error)
      response.redirect().back()
      return
    }

    session.flash('success', 'Partida criada')
    response.redirect().toRoute('matches.show', { id: created.match.id })
  }

  async show({ inertia, auth, params }: HttpContext) {
    const user = auth.user!
    const match = await getMatchWithRelations(Number(params.id))
    await assertGroupMember(match.groupId, user)

    const ranking = await getGroupRanking(match.groupId)
    const rankContext = getRankContext(ranking, user.id)
    const canFinalize = await canFinalizeMatch(match, user.id, match.groupId)
    const canManageActions = await canUndoOrCancelMatch(match, user.id, match.groupId)
    const organizerOverride = await isOrganizerOverride(match, user.id, match.groupId)
    const parsedScore = parseMatchScore(match.score)
    const serializedPlayers = match.players.map((player) => serializeMatchPlayer(player))
    const playerUserIdsForRewards = serializedPlayers
      .map((player) => player.userId)
      .filter((userId): userId is number => userId !== null)
    const equippedDisplayByUserId = await getEquippedDisplayByUserIds(playerUserIdsForRewards)
    const funLabelByUserId = await resolveDisplayFunLabelsByUserIds(
      serializedPlayers
        .filter((player) => player.userId !== null)
        .map((player) => ({
          userId: player.userId!,
          funLabel: player.funLabel,
        }))
    )

    const rewardsByUserId = new Map(
      match.rewards.map((reward) => [
        reward.userId,
        {
          xpAwarded: reward.xpAwarded,
          eloDelta: reward.eloDelta,
          eloAfter: reward.eloAfter,
        },
      ])
    )

    const playersPayload = serializedPlayers.map((player) => {
      const rewards = player.userId ? equippedDisplayByUserId.get(player.userId) : null
      const progression = player.userId ? rewardsByUserId.get(player.userId) : null

      return {
        ...player,
        funLabel: player.userId
          ? (funLabelByUserId.get(player.userId) ?? player.funLabel)
          : player.funLabel,
        equippedTitles: rewards?.equippedTitles ?? [],
        avatarFrameSrc: rewards?.avatarFrameSrc ?? null,
        avatarFrameInset: rewards?.avatarFrameInset ?? DEFAULT_FRAME_INSET,
        xpAwarded: progression?.xpAwarded ?? null,
        eloDelta: progression?.eloDelta ?? null,
        eloAfter: progression?.eloAfter ?? null,
      }
    })

    const play = await Group.findOrFail(match.groupId)
    const shareCardPayload =
      match.status === 'finalizada' && match.winnerSide
        ? await buildMatchShareCard({
            viewerUserId: user.id,
            playName: play.name,
            arenaName: match.arena.name,
            scoreLabel: formatMatchScore(parsedScore) ?? '',
            winnerSide: match.winnerSide,
            score: parsedScore,
            players: match.players,
            serializedPlayers: playersPayload,
            statusChangedAt: match.statusChangedAt,
            rankPosition: rankContext.position,
          })
        : null

    return inertia.render('matches/show', {
      match: {
        id: match.id,
        status: match.status,
        winnerSide: match.winnerSide,
        scoreLabel: formatMatchScore(parsedScore),
        arenaName: match.arena.name,
        groupId: match.groupId,
        manageWindowOpen: isManageWindowOpen(match.statusChangedAt),
        manageWindowExpiresAt: manageWindowExpiresAt(match.statusChangedAt).toISO() ?? '',
        shareText: shareCardPayload?.shareText ?? null,
        shareCard: shareCardPayload,
      },
      players: playersPayload,
      ranking,
      rankContext,
      currentUserId: user.id,
      canFinalizeMatch: canFinalize,
      canManageMatchActions: canManageActions,
      isOrganizerOverride: organizerOverride,
    })
  }

  async finalize({ request, response, auth, session, params }: HttpContext) {
    const user = auth.user!
    const match = await GameMatch.findOrFail(Number(params.id))
    await assertGroupMember(match.groupId, user)
    await assertCanFinalizeMatch(match, user)

    if (match.status !== 'em_andamento') {
      session.flash('error', 'Partida precisa estar em andamento para finalizar')
      response.redirect().back()
      return
    }

    const payload = await request.validateUsing(finalizeMatchValidator)

    if (setsHavePartialInput(payload.sets)) {
      session.flash('error', 'Preencha os dois lados de cada set ou deixe o set em branco')
      response.redirect().back()
      return
    }

    const sets = normalizeSets(payload.sets)
    const scoreValidation = validateSets(sets)
    if (!scoreValidation.ok) {
      session.flash('error', scoreValidation.message)
      response.redirect().back()
      return
    }

    const winnerSide = inferWinnerSideFromSets(sets!)
    if (winnerSide === null) {
      session.flash('error', 'O placar está empatado — adicione mais sets ou ajuste os placares')
      response.redirect().back()
      return
    }

    const score: MatchScore = { sets: sets! }

    const rankingBefore = await getGroupRanking(match.groupId)
    const rankBefore = getRankContext(rankingBefore, user.id).position

    const progression = await db.transaction(async (trx) => {
      return scoreMatchProgression(match, winnerSide, score, trx)
    })

    const rankingAfter = await getGroupRanking(match.groupId)
    const rankAfter = getRankContext(rankingAfter, user.id).position

    const celebration = buildCelebrationPayload({
      userId: user.id,
      progression,
      rankBefore,
      rankAfter,
    })

    if (celebration) {
      session.flash('celebration', JSON.stringify(celebration))
    }

    session.flash('success', 'Partida finalizada')
    response.redirect().back()
  }

  async undoFinalize({ response, auth, session, params }: HttpContext) {
    const user = auth.user!
    const match = await GameMatch.findOrFail(Number(params.id))
    await assertGroupMember(match.groupId, user)
    await assertCanUndoOrCancelMatch(match, user)

    if (match.status !== 'finalizada') {
      session.flash('error', 'Só é possível desfazer resultado de partida finalizada')
      response.redirect().back()
      return
    }

    await db.transaction(async (trx) => {
      match.useTransaction(trx)
      await clearMatchResult(match, trx)
      match.status = 'em_andamento'
      markStatusChanged(match)
      await match.save()
    })

    session.flash('success', 'Resultado desfeito — partida em andamento')
    response.redirect().back()
  }

  async cancel({ response, auth, session, params }: HttpContext) {
    const user = auth.user!
    const match = await GameMatch.findOrFail(Number(params.id))
    await assertGroupMember(match.groupId, user)
    await assertCanUndoOrCancelMatch(match, user)

    if (match.status === 'cancelada') {
      session.flash('error', 'Partida já está cancelada')
      response.redirect().back()
      return
    }

    const groupId = match.groupId

    await db.transaction(async (trx) => {
      match.useTransaction(trx)
      if (match.status === 'finalizada') {
        await clearMatchResult(match, trx)
      }
      match.status = 'cancelada'
      markStatusChanged(match)
      await match.save()
    })

    session.flash('success', 'Partida cancelada')
    response.redirect().toRoute('groups.show', { id: groupId })
  }
}
