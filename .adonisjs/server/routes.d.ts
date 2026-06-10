import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'health': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'avatars.show': { paramsTuple: [ParamValue]; params: {'file': ParamValue} }
    'groups.invite': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'guest_invites.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'groups.index': { paramsTuple?: []; params?: {} }
    'groups.store': { paramsTuple?: []; params?: {} }
    'groups.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.matches.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.store': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'matches.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.finalize': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.undoFinalize': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'ranking.index': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'profile.updateAccount': { paramsTuple?: []; params?: {} }
    'profile.equip': { paramsTuple?: []; params?: {} }
    'profile.unequip': { paramsTuple?: []; params?: {} }
    'history.show': { paramsTuple?: []; params?: {} }
    'members.show': { paramsTuple: [ParamValue,ParamValue]; params: {'groupId': ParamValue,'userId': ParamValue} }
    'guest_invites.member': { paramsTuple: [ParamValue,ParamValue]; params: {'groupId': ParamValue,'inviteId': ParamValue} }
  }
  GET: {
    'health': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'avatars.show': { paramsTuple: [ParamValue]; params: {'file': ParamValue} }
    'groups.invite': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'guest_invites.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'groups.index': { paramsTuple?: []; params?: {} }
    'groups.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.matches.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'ranking.index': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'history.show': { paramsTuple?: []; params?: {} }
    'members.show': { paramsTuple: [ParamValue,ParamValue]; params: {'groupId': ParamValue,'userId': ParamValue} }
    'guest_invites.member': { paramsTuple: [ParamValue,ParamValue]; params: {'groupId': ParamValue,'inviteId': ParamValue} }
  }
  HEAD: {
    'health': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'avatars.show': { paramsTuple: [ParamValue]; params: {'file': ParamValue} }
    'groups.invite': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'guest_invites.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'groups.index': { paramsTuple?: []; params?: {} }
    'groups.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.matches.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'ranking.index': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'history.show': { paramsTuple?: []; params?: {} }
    'members.show': { paramsTuple: [ParamValue,ParamValue]; params: {'groupId': ParamValue,'userId': ParamValue} }
    'guest_invites.member': { paramsTuple: [ParamValue,ParamValue]; params: {'groupId': ParamValue,'inviteId': ParamValue} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'groups.store': { paramsTuple?: []; params?: {} }
    'groups.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.store': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'matches.finalize': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.undoFinalize': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'profile.updateAccount': { paramsTuple?: []; params?: {} }
    'profile.equip': { paramsTuple?: []; params?: {} }
    'profile.unequip': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}