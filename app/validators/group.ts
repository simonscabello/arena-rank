import vine from '@vinejs/vine'

export const createGroupValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(100),
})

export const joinGroupValidator = vine.create({
  inviteCode: vine.string().trim().fixedLength(6),
})
