import ForbiddenException from '#exceptions/forbidden_exception'
import { assertGroupMember } from '#helpers/group_access'
import { createGuestPlayerInvite } from '#helpers/guest_player_invite'
import { assertMatchCreator, isMatchCreator } from '#helpers/match_access'
import { canHaveBets } from '#helpers/match_bets'
import { clearMatchResult } from '#helpers/match_lifecycle'
import {
  isManageWindowOpen,
  manageWindowExpiresAt,
  markStatusChanged,
  rejectExpiredManageWindow,
} from '#helpers/match_manage_window'
import { realPlayerUserIds, serializeMatchPlayer } from '#helpers/match_players'
import { validateAndResolveMatchPlayers } from '#helpers/match_player_validation'
import { buildMatchShareText } from '#helpers/match_share'
import {
  formatMatchScore,
  inferWinnerSideFromSets,
  normalizeSets,
  parseMatchScore,
  setsHavePartialInput,
  validateSets,
  type MatchScore,
} from '#helpers/match_score'
import { isUniqueConstraintError } from '#helpers/db_errors'
import { creditBetReward } from '#helpers/wallet'
import {
  getBetParticipation,
  getGroupRanking,
  getMatchWithRelations,
  getRankContext,
  isMatchPlayer,
} from '#helpers/ranking'
import Arena from '#models/arena'
import Bet from '#models/bet'
import GameMatch from '#models/game_match'
import MatchPlayer from '#models/match_player'
import { createMatchValidator, finalizeMatchValidator, placeBetValidator } from '#validators/match'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

const POINTS_CORRECT = 10

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

    let arenaId = payload.arenaId
    if (!arenaId && payload.arenaName) {
      const arena = await Arena.firstOrCreate(
        { name: payload.arenaName },
        { city: payload.arenaCity ?? null }
      )
      if (payload.arenaCity && !arena.city) {
        arena.city = payload.arenaCity
        await arena.save()
      }
      arenaId = arena.id
    }
    if (!arenaId) {
      session.flash('error', 'Informe uma arena')
      response.redirect().back()
      return
    }

    const realUserIds = realPlayerUserIds(validation.resolved)
    const betsPossible = await canHaveBets(groupId, realUserIds)
    const skipBets = payload.skipBets === true || !betsPossible
    const initialStatus = skipBets ? 'em_andamento' : 'palpites_abertos'

    const match = await db.transaction(async (trx) => {
      const now = DateTime.now()
      const created = await GameMatch.create(
        {
          groupId,
          arenaId,
          createdByUserId: user.id,
          status: initialStatus,
          statusChangedAt: now,
        },
        { client: trx }
      )

      for (const player of validation.resolved) {
        let guestInviteId = player.guestInviteId

        if (!player.userId && !guestInviteId && player.displayName) {
          const invite = await createGuestPlayerInvite(groupId, player.displayName, user.id, trx)
          guestInviteId = invite.id
        }

        await MatchPlayer.create(
          {
            matchId: created.id,
            userId: player.userId,
            displayName: player.userId ? null : player.displayName,
            guestInviteId: player.userId ? null : guestInviteId,
            side: player.side,
          },
          { client: trx }
        )
      }

      return created
    })

    session.flash(
      'success',
      skipBets ? 'Partida criada — registre o resultado (sem palpites)' : 'Partida criada'
    )
    response.redirect().toRoute('matches.show', { id: match.id })
  }

  async show({ inertia, auth, params }: HttpContext) {
    const user = auth.user!
    const match = await getMatchWithRelations(Number(params.id))
    await assertGroupMember(match.groupId, user)

    const playerUserIds = realPlayerUserIds(match.players)
    const betsPossible = await canHaveBets(match.groupId, playerUserIds)
    const skipsBets = !betsPossible
    const ranking = await getGroupRanking(match.groupId)
    const rankContext = getRankContext(ranking, user.id)
    const betParticipation =
      match.status === 'palpites_abertos' && betsPossible
        ? await getBetParticipation(match.id, match.groupId, playerUserIds)
        : null
    const isPlayer = await isMatchPlayer(match.id, user.id)
    const userBet = match.bets.find((b) => b.userId === user.id)
    const canManageMatch = isMatchCreator(match, user.id)
    const betsRevealed = match.status !== 'palpites_abertos' || !betsPossible
    const parsedScore = parseMatchScore(match.score)

    return inertia.render('matches/show', {
      match: {
        id: match.id,
        status: match.status,
        winnerSide: match.winnerSide,
        score: parsedScore,
        scoreLabel: formatMatchScore(parsedScore),
        arenaName: match.arena.name,
        groupId: match.groupId,
        manageWindowOpen: isManageWindowOpen(match.statusChangedAt),
        manageWindowExpiresAt: manageWindowExpiresAt(match.statusChangedAt).toISO(),
        shareText:
          match.status === 'finalizada' && match.winnerSide
            ? buildMatchShareText({
                score: parsedScore,
                winnerSide: match.winnerSide,
                players: match.players,
                bets: match.bets,
                skipsBets,
              })
            : null,
      },
      players: match.players.map((player) => serializeMatchPlayer(player)),
      bets: betsRevealed
        ? match.bets.map((b) => ({
            userId: b.userId,
            predictedSide: b.predictedSide,
            pointsAwarded: b.pointsAwarded,
            fullName: b.user.fullName,
            email: b.user.email,
            nickname: b.user.nickname,
            funLabel: b.user.funLabel,
          }))
        : [],
      ranking,
      rankContext,
      betParticipation,
      isPlayer,
      userBet: userBet
        ? { predictedSide: userBet.predictedSide, pointsAwarded: userBet.pointsAwarded }
        : null,
      currentUserId: user.id,
      canManageMatch,
      betsPossible,
      skipsBets,
    })
  }

  async placeBet({ request, response, auth, session, params }: HttpContext) {
    const user = auth.user!
    const match = await GameMatch.findOrFail(Number(params.id))
    await assertGroupMember(match.groupId, user)

    if (match.status !== 'palpites_abertos') {
      session.flash('error', 'Palpites fechados para esta partida')
      response.redirect().back()
      return
    }

    if (await isMatchPlayer(match.id, user.id)) {
      throw new ForbiddenException('Jogadores não podem palpitar na própria partida')
    }

    const { predictedSide } = await request.validateUsing(placeBetValidator)

    let existing = await Bet.query().where('match_id', match.id).where('user_id', user.id).first()

    if (!existing) {
      try {
        await Bet.create({
          matchId: match.id,
          userId: user.id,
          predictedSide,
        })
        session.flash('success', 'Palpite registrado')
        response.redirect().back()
        return
      } catch (error) {
        if (!isUniqueConstraintError(error)) {
          throw error
        }

        existing = await Bet.query()
          .where('match_id', match.id)
          .where('user_id', user.id)
          .firstOrFail()
      }
    }

    if (existing.predictedSide === predictedSide) {
      session.flash('success', 'Palpite mantido')
      response.redirect().back()
      return
    }

    existing.predictedSide = predictedSide
    await existing.save()
    session.flash('success', 'Palpite atualizado')
    response.redirect().back()
  }

  async start({ response, auth, session, params }: HttpContext) {
    const user = auth.user!
    const match = await GameMatch.findOrFail(Number(params.id))
    await assertGroupMember(match.groupId, user)
    await assertMatchCreator(match, user)

    if (match.status !== 'palpites_abertos') {
      session.flash('error', 'Partida não está aberta para palpites')
      response.redirect().back()
      return
    }

    match.status = 'em_andamento'
    markStatusChanged(match)
    await match.save()

    session.flash('success', 'Partida iniciada — palpites fechados')
    response.redirect().back()
  }

  async finalize({ request, response, auth, session, params }: HttpContext) {
    const user = auth.user!
    const match = await GameMatch.findOrFail(Number(params.id))
    await assertGroupMember(match.groupId, user)
    await assertMatchCreator(match, user)

    const matchPlayers = await MatchPlayer.query().where('match_id', match.id).select('user_id')
    const playerIds = realPlayerUserIds(matchPlayers)
    const betsPossible = await canHaveBets(match.groupId, playerIds)
    const canFinalizeNow =
      match.status === 'em_andamento' || (match.status === 'palpites_abertos' && !betsPossible)

    if (!canFinalizeNow) {
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

    await db.transaction(async (trx) => {
      match.useTransaction(trx)
      match.status = 'finalizada'
      match.winnerSide = winnerSide
      match.score = score
      markStatusChanged(match)
      await match.save()

      const bets = await Bet.query({ client: trx }).where('match_id', match.id)
      for (const bet of bets) {
        bet.useTransaction(trx)
        bet.pointsAwarded = bet.predictedSide === winnerSide ? POINTS_CORRECT : 0
        await bet.save()
        if (bet.pointsAwarded > 0) {
          await creditBetReward(bet.userId, bet.id, bet.pointsAwarded, trx)
        }
      }
    })

    session.flash('success', 'Partida finalizada')
    response.redirect().back()
  }

  async reopenBets({ response, auth, session, params }: HttpContext) {
    const user = auth.user!
    const match = await GameMatch.findOrFail(Number(params.id))
    await assertGroupMember(match.groupId, user)
    await assertMatchCreator(match, user)
    if (rejectExpiredManageWindow(match, { session, response })) return

    if (match.status !== 'em_andamento') {
      session.flash('error', 'Só é possível reabrir palpites em partida em andamento')
      response.redirect().back()
      return
    }

    const matchPlayers = await MatchPlayer.query().where('match_id', match.id).select('user_id')
    const playerIds = realPlayerUserIds(matchPlayers)
    const betsPossible = await canHaveBets(match.groupId, playerIds)

    if (!betsPossible) {
      session.flash('error', 'Esta partida não aceita palpites')
      response.redirect().back()
      return
    }

    match.status = 'palpites_abertos'
    markStatusChanged(match)
    await match.save()

    session.flash('success', 'Palpites reabertos')
    response.redirect().back()
  }

  async undoFinalize({ response, auth, session, params }: HttpContext) {
    const user = auth.user!
    const match = await GameMatch.findOrFail(Number(params.id))
    await assertGroupMember(match.groupId, user)
    await assertMatchCreator(match, user)
    if (rejectExpiredManageWindow(match, { session, response })) return

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
    await assertMatchCreator(match, user)
    if (rejectExpiredManageWindow(match, { session, response })) return

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
