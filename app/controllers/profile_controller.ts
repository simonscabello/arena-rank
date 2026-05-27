import { FUN_LABEL_SUGGESTIONS } from '#constants/fun_label_suggestions'
import {
  COURT_SIDE_LABELS,
  COURT_SIDES,
  DOMINANT_HAND_LABELS,
  DOMINANT_HANDS,
  SKILL_LEVEL_LABELS,
  SKILL_LEVELS,
} from '#enums/sport_profile'
import { removeUserAvatar, saveUserAvatar } from '#helpers/avatar_storage'
import User from '#models/user'
import { updateAccountValidator } from '#validators/account'
import { updateProfileValidator } from '#validators/profile'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async show({ inertia, auth }: HttpContext) {
    const user = auth.user!

    return inertia.render('profile/show', {
      account: {
        fullName: user.fullName,
        email: user.email,
      },
      profile: {
        nickname: user.nickname,
        funLabel: user.funLabel,
        dominantHand: user.dominantHand,
        courtSide: user.courtSide,
        skillLevel: user.skillLevel,
        avatarUrl: user.avatarUrl,
        initials: user.initials,
      },
      funLabelSuggestions: [...FUN_LABEL_SUGGESTIONS],
      options: {
        dominantHands: DOMINANT_HANDS.map((value: (typeof DOMINANT_HANDS)[number]) => ({
          value,
          label: DOMINANT_HAND_LABELS[value],
        })),
        courtSides: COURT_SIDES.map((value: (typeof COURT_SIDES)[number]) => ({
          value,
          label: COURT_SIDE_LABELS[value],
        })),
        skillLevels: SKILL_LEVELS.map((value: (typeof SKILL_LEVELS)[number]) => ({
          value,
          label: SKILL_LEVEL_LABELS[value],
        })),
      },
    })
  }

  async update({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const rawFunLabel = request.input('funLabel')
    if (typeof rawFunLabel === 'string' && rawFunLabel.trim().length > 60) {
      session.flash('error', 'A label deve ter no máximo 60 caracteres')
      response.redirect().back()
      return
    }

    const payload = await request.validateUsing(updateProfileValidator)

    if (payload.removeAvatar) {
      await removeUserAvatar(user)
    } else {
      const avatar = request.file('avatar', {
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })

      if (avatar) {
        try {
          await saveUserAvatar(user, avatar)
        } catch (error) {
          session.flash('error', error instanceof Error ? error.message : 'Erro ao salvar foto')
          response.redirect().back()
          return
        }
      }
    }

    user.nickname = payload.nickname ?? null
    user.funLabel = payload.funLabel ?? null
    user.dominantHand = payload.dominantHand ?? null
    user.courtSide = payload.courtSide ?? null
    user.skillLevel = payload.skillLevel ?? null
    await user.save()

    session.flash('success', 'Perfil atualizado')
    response.redirect().toRoute('profile.show')
  }

  async updateAccount({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(updateAccountValidator)

    const emailTaken = await User.query()
      .where('email', payload.email)
      .whereNot('id', user.id)
      .first()
    if (emailTaken) {
      session.flash('error', 'Este email já está em uso')
      response.redirect().toRoute('profile.show')
      return
    }

    if (payload.password) {
      if (!payload.currentPassword) {
        session.flash('error', 'Informe a senha atual para alterar a senha')
        response.redirect().toRoute('profile.show')
        return
      }

      if (payload.password !== payload.passwordConfirmation) {
        session.flash('error', 'A confirmação da nova senha não confere')
        response.redirect().toRoute('profile.show')
        return
      }

      const passwordValid = await hash.verify(user.password, payload.currentPassword)
      if (!passwordValid) {
        session.flash('error', 'Senha atual incorreta')
        response.redirect().toRoute('profile.show')
        return
      }

      user.password = payload.password
    }

    user.fullName = payload.fullName ?? null
    user.email = payload.email
    await user.save()

    session.flash('success', 'Dados da conta atualizados')
    response.redirect().toRoute('profile.show')
  }
}
