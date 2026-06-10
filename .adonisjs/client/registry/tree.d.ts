/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  health: typeof routes['health']
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
  session: {
    create: typeof routes['session.create']
    destroy: typeof routes['session.destroy']
  }
  auth: {
    google: {
      redirect: typeof routes['auth.google.redirect']
      callback: typeof routes['auth.google.callback']
    }
  }
  matches: {
    store: typeof routes['matches.store']
    show: typeof routes['matches.show']
    finalize: typeof routes['matches.finalize']
    undoFinalize: typeof routes['matches.undoFinalize']
    cancel: typeof routes['matches.cancel']
  }
  ranking: {
    index: typeof routes['ranking.index']
  }
  profile: {
    show: typeof routes['profile.show']
    update: typeof routes['profile.update']
    updateAccount: typeof routes['profile.updateAccount']
    equip: typeof routes['profile.equip']
    unequip: typeof routes['profile.unequip']
  }
  history: {
    show: typeof routes['history.show']
  }
  members: {
    show: typeof routes['members.show']
  }
}
