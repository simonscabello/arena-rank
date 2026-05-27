/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  avatars: {
    show: typeof routes['avatars.show']
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
  groups: {
    index: typeof routes['groups.index']
    store: typeof routes['groups.store']
    join: typeof routes['groups.join']
    show: typeof routes['groups.show']
    matches: {
      create: typeof routes['groups.matches.create']
    }
  }
  matches: {
    store: typeof routes['matches.store']
    show: typeof routes['matches.show']
    bet: typeof routes['matches.bet']
    start: typeof routes['matches.start']
    finalize: typeof routes['matches.finalize']
  }
  profile: {
    show: typeof routes['profile.show']
    update: typeof routes['profile.update']
    updateAccount: typeof routes['profile.updateAccount']
  }
  history: {
    show: typeof routes['history.show']
  }
  members: {
    show: typeof routes['members.show']
  }
}
