import type User from '#models/user'
import { buildProgressionDisplay, DEFAULT_FRAME_INSET } from '#helpers/cosmetic_display'
import { BaseTransformer } from '@adonisjs/core/transformers'

type AvatarFrame = {
  avatarFrameSrc: string | null
  avatarFrameInset: number
}

export default class UserTransformer extends BaseTransformer<User> {
  #frame: AvatarFrame

  constructor(resource: User, frame?: AvatarFrame) {
    super(resource)
    this.#frame = frame ?? { avatarFrameSrc: null, avatarFrameInset: DEFAULT_FRAME_INSET }
  }

  toObject() {
    const progression = buildProgressionDisplay(this.resource)

    return {
      ...this.pick(this.resource, [
        'id',
        'fullName',
        'email',
        'createdAt',
        'updatedAt',
        'initials',
      ]),
      avatarUrl: this.resource.avatarUrl,
      avatarFrameSrc: this.#frame.avatarFrameSrc,
      avatarFrameInset: this.#frame.avatarFrameInset,
      xp: progression.xp,
      level: progression.level,
      xpToNextLevel: progression.xpToNextLevel,
      xpProgressCurrent: progression.xpProgressCurrent,
      xpProgressNeeded: progression.xpProgressNeeded,
      elo: progression.elo,
      eloTier: progression.eloTier,
      eloTierLabel: progression.eloTierLabel,
    }
  }
}
