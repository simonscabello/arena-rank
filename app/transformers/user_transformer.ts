import type User from '#models/user'
import { DEFAULT_FRAME_INSET } from '#helpers/shop_rewards'
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
      shopBalance: this.resource.shopBalance ?? 0,
      avatarFrameSrc: this.#frame.avatarFrameSrc,
      avatarFrameInset: this.#frame.avatarFrameInset,
    }
  }
}
