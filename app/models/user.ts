import { avatarUrl } from '#helpers/avatar_storage'
import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  get avatarUrl() {
    return avatarUrl(this.avatarPath)
  }

  get initials() {
    const label = this.nickname || this.fullName || this.email
    const [first, last] = label.includes(' ') ? label.split(' ') : [label, '']
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }
}
