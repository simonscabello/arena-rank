import { COURT_SIDES, DOMINANT_HANDS, SKILL_LEVELS } from '#enums/sport_profile'
import vine from '@vinejs/vine'

function optionalSportField<const T extends readonly string[]>(values: T) {
  return vine
    .string()
    .trim()
    .in([...values, ''])
    .optional()
    .nullable()
    .transform((value) => (value === '' ? null : value))
}

export const updateProfileValidator = vine.create({
  nickname: vine.string().trim().maxLength(50).optional().nullable(),
  funLabel: vine
    .string()
    .trim()
    .maxLength(60)
    .nullable()
    .optional()
    .transform((value) => (value === '' || value === undefined ? null : value)),
  dominantHand: optionalSportField(DOMINANT_HANDS),
  courtSide: optionalSportField(COURT_SIDES),
  skillLevel: optionalSportField(SKILL_LEVELS),
  removeAvatar: vine
    .any()
    .optional()
    .transform((value) => value === true || value === 'on' || value === '1' || value === 1),
})
