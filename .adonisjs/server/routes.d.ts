import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'avatars.show': { paramsTuple: [ParamValue]; params: {'file': ParamValue} }
    'groups.invite': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'groups.index': { paramsTuple?: []; params?: {} }
    'groups.store': { paramsTuple?: []; params?: {} }
    'groups.join': { paramsTuple?: []; params?: {} }
    'groups.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.matches.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.store': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'matches.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.bet': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.start': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.finalize': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.reopenBets': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.undoFinalize': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'profile.updateAccount': { paramsTuple?: []; params?: {} }
    'history.show': { paramsTuple?: []; params?: {} }
    'members.show': { paramsTuple: [ParamValue,ParamValue]; params: {'groupId': ParamValue,'userId': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'avatars.show': { paramsTuple: [ParamValue]; params: {'file': ParamValue} }
    'groups.invite': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'groups.index': { paramsTuple?: []; params?: {} }
    'groups.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.matches.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'history.show': { paramsTuple?: []; params?: {} }
    'members.show': { paramsTuple: [ParamValue,ParamValue]; params: {'groupId': ParamValue,'userId': ParamValue} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'avatars.show': { paramsTuple: [ParamValue]; params: {'file': ParamValue} }
    'groups.invite': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'groups.index': { paramsTuple?: []; params?: {} }
    'groups.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.matches.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'history.show': { paramsTuple?: []; params?: {} }
    'members.show': { paramsTuple: [ParamValue,ParamValue]; params: {'groupId': ParamValue,'userId': ParamValue} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'groups.store': { paramsTuple?: []; params?: {} }
    'groups.join': { paramsTuple?: []; params?: {} }
    'groups.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.store': { paramsTuple: [ParamValue]; params: {'groupId': ParamValue} }
    'matches.bet': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.start': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.finalize': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.reopenBets': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.undoFinalize': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'matches.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'profile.updateAccount': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}