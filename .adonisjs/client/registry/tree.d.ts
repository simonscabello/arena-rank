/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  avatars: {
    show: typeof routes['avatars.show']
  }
  groups: {
    invite: typeof routes['groups.invite']
    index: typeof routes['groups.index']
    store: typeof routes['groups.store']
    update: typeof routes['groups.update']
    show: typeof routes['groups.show']
    matches: {
      create: typeof routes['groups.matches.create']
    }
  }
  guestInvites: {
    show: typeof routes['guest_invites.show']
    member: typeof routes['guest_invites.member']
  }
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  matches: {
    store: typeof routes['matches.store']
    show: typeof routes['matches.show']
    bet: typeof routes['matches.bet']
    start: typeof routes['matches.start']
    finalize: typeof routes['matches.finalize']
    reopenBets: typeof routes['matches.reopenBets']
    undoFinalize: typeof routes['matches.undoFinalize']
    cancel: typeof routes['matches.cancel']
  }
  profile: {
    show: typeof routes['profile.show']
    update: typeof routes['profile.update']
    updateAccount: typeof routes['profile.updateAccount']
  }
  history: {
    show: typeof routes['history.show']
  }
  shop: {
    index: typeof routes['shop.index']
    purchase: typeof routes['shop.purchase']
    equip: typeof routes['shop.equip']
    unequip: typeof routes['shop.unequip']
  }
  members: {
    show: typeof routes['members.show']
  }
}
