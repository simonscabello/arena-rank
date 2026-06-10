import vine from '@vinejs/vine'

const email = () => vine.string().email().maxLength(254)

export const updateAccountValidator = vine.create({
  fullName: vine
    .string()
    .trim()
    .maxLength(100)
    .optional()
    .nullable()
    .transform((value) => (value === '' || value === undefined ? null : value)),
  email: email(),
})
