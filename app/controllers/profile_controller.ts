import { STATUS_SUGGESTIONS } from '#constants/fun_label_suggestions'
import {
  COURT_SIDE_LABELS,
  COURT_SIDES,
  DOMINANT_HAND_LABELS,
  DOMINANT_HANDS,
  SKILL_LEVEL_LABELS,
  SKILL_LEVELS,
} from '#enums/sport_profile'
import { ACHIEVEMENT_CATEGORY_LABELS } from '#enums/achievement_criteria_type'
import { MAX_TITLE_SLOTS } from '#enums/cosmetic_item_type'
import { enrichLockedAchievements } from '#helpers/achievement_progress'
import { getUnlockedFrames, getUserAchievements } from '#helpers/achievements'
import { removeUserAvatar, saveUserAvatar } from '#helpers/avatar_storage'
import {
  applyEquipAchievement,
  applyEquipFrame,
  applyUnequipByAchievementId,
  applyUnequipByFrameId,
  applyUnequipByItemType,
} from '#helpers/cosmetic_equipment'
import { getEquippedCosmetics } from '#helpers/cosmetic_display'
import Achievement from '#models/achievement'
import User from '#models/user'
import { updateAccountValidator } from '#validators/account'
import { equipCosmeticValidator, unequipCosmeticValidator } from '#validators/cosmetics'
import { updateProfileValidator } from '#validators/profile'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

const PROFILE_SECTIONS = ['progression', 'achievements', 'play', 'account'] as const

type ProfileSection = (typeof PROFILE_SECTIONS)[number]

function parseProfileSection(value: unknown): ProfileSection | null {
  if (typeof value !== 'string') return null
  return PROFILE_SECTIONS.includes(value as ProfileSection) ? (value as ProfileSection) : null
}

function parseFramePayload(payload: unknown) {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload) as { frameSrc?: string; inset?: number }
    } catch {
      return {}
    }
  }
  if (payload && typeof payload === 'object') {
    return payload as { frameSrc?: string; inset?: number }
  }
  return {}
}

export default class ProfileController {
  async show({ inertia, auth, request }: HttpContext) {
    const user = auth.user!
    await user.refresh()

    const section = parseProfileSection(request.qs().section)

    const cosmetics = await getEquippedCosmetics(user.id)
    const achievements = await getUserAchievements(user.id)
    const frames = await getUnlockedFrames(user.id)

    const equippedRows = await db
      .from('user_equipped_items')
      .where('user_id', user.id)
      .where((query) => {
        query.whereNotNull('achievement_id').orWhereNotNull('avatar_frame_id')
      })
      .select(
        'item_type as itemType',
        'achievement_id as achievementId',
        'avatar_frame_id as avatarFrameId',
        'slot'
      )

    const equippedAchievementIds = new Set(
      equippedRows.filter((row) => row.achievementId).map((row) => Number(row.achievementId))
    )
    const equippedFrameId = equippedRows.find(
      (row) => row.itemType === 'avatar_frame'
    )?.avatarFrameId

    const allAchievements = await Achievement.query().orderBy('sort_order', 'asc')

    const lockedRaw = allAchievements.filter(
      (achievement) => !achievements.some((unlocked) => Number(unlocked.id) === achievement.id)
    )
    const enrichedLocked = await enrichLockedAchievements(user.id, lockedRaw)

    return inertia.render('profile/show', {
      section,
      maxTitleSlots: MAX_TITLE_SLOTS,
      progression: {
        xp: cosmetics.xp,
        level: cosmetics.level,
        xpToNextLevel: cosmetics.xpToNextLevel,
        xpProgressCurrent: cosmetics.xpProgressCurrent,
        xpProgressNeeded: cosmetics.xpProgressNeeded,
        elo: cosmetics.elo,
        eloTier: cosmetics.eloTier,
        eloTierLabel: cosmetics.eloTierLabel,
      },
      achievements: achievements.map((row) => ({
        id: Number(row.id),
        slug: String(row.slug),
        name: String(row.name),
        description: String(row.description ?? ''),
        icon: String(row.icon),
        category: String(row.category),
        categoryLabel: ACHIEVEMENT_CATEGORY_LABELS[String(row.category)] ?? String(row.category),
        unlockedAt: row.unlockedAt,
        equipped: equippedAchievementIds.has(Number(row.id)),
      })),
      lockedAchievements: enrichedLocked.map((achievement) => ({
        id: achievement.id,
        slug: achievement.slug,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        categoryLabel: ACHIEVEMENT_CATEGORY_LABELS[achievement.category] ?? achievement.category,
        criteriaLabel: achievement.progress?.criteriaLabel ?? null,
        current: achievement.progress?.current ?? null,
        target: achievement.progress?.target ?? null,
        progressPercent: achievement.progress?.progressPercent ?? null,
      })),
      frames: frames.map((row) => ({
        id: Number(row.id),
        slug: String(row.slug),
        name: String(row.name),
        description: String(row.description ?? ''),
        unlockLevel: Number(row.unlockLevel),
        frameSrc: parseFramePayload(row.payload).frameSrc ?? null,
        inset: parseFramePayload(row.payload).inset ?? 18,
        equipped: Number(equippedFrameId) === Number(row.id),
      })),
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
        avatarFrameSrc: cosmetics.avatarFrameSrc,
        avatarFrameInset: cosmetics.avatarFrameInset,
        equippedTitles: cosmetics.equippedTitles,
        initials: user.initials,
      },
      statusSuggestions: [...STATUS_SUGGESTIONS],
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

  async equip({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(equipCosmeticValidator)

    if (payload.achievementId) {
      const unlocked = await db
        .from('user_achievements')
        .where('user_id', user.id)
        .where('achievement_id', payload.achievementId)
        .first()

      if (!unlocked) {
        session.flash('error', 'Conquista ainda não desbloqueada')
        response.redirect().back()
        return
      }

      const result = await applyEquipAchievement(user, payload.achievementId, payload.slot)
      if (!result.ok) {
        session.flash('error', 'Os 3 slots de título estão cheios. Desequipe um ou escolha o slot.')
        response.redirect().back()
        return
      }

      session.flash('success', 'Título equipado')
      response.redirect().back()
      return
    }

    if (payload.avatarFrameId) {
      const unlocked = await db
        .from('user_unlocked_frames')
        .where('user_id', user.id)
        .where('avatar_frame_id', payload.avatarFrameId)
        .first()

      if (!unlocked) {
        session.flash('error', 'Moldura ainda não desbloqueada')
        response.redirect().back()
        return
      }

      await applyEquipFrame(user, payload.avatarFrameId)
      session.flash('success', 'Moldura equipada')
      response.redirect().back()
      return
    }

    session.flash('error', 'Item inválido')
    response.redirect().back()
  }

  async unequip({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(unequipCosmeticValidator)

    if (payload.achievementId) {
      await applyUnequipByAchievementId(user, payload.achievementId)
      session.flash('success', 'Título desequipado')
      response.redirect().back()
      return
    }

    if (payload.avatarFrameId) {
      await applyUnequipByFrameId(user, payload.avatarFrameId)
      session.flash('success', 'Moldura desequipada')
      response.redirect().back()
      return
    }

    if (payload.itemType) {
      await applyUnequipByItemType(user, payload.itemType)
      session.flash('success', 'Item desequipado')
      response.redirect().back()
      return
    }

    session.flash('error', 'Item inválido')
    response.redirect().back()
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

    user.fullName = payload.fullName ?? null
    user.email = payload.email
    await user.save()

    session.flash('success', 'Dados da conta atualizados')
    response.redirect().toRoute('profile.show')
  }
}
