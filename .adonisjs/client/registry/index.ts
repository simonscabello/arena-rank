/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'health': {
    methods: ["GET","HEAD"],
    pattern: '/health',
    tokens: [{"old":"/health","type":0,"val":"health","end":""}],
    types: placeholder as Registry['health']['types'],
  },
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'avatars.show': {
    methods: ["GET","HEAD"],
    pattern: '/uploads/avatars/:file',
    tokens: [{"old":"/uploads/avatars/:file","type":0,"val":"uploads","end":""},{"old":"/uploads/avatars/:file","type":0,"val":"avatars","end":""},{"old":"/uploads/avatars/:file","type":1,"val":"file","end":""}],
    types: placeholder as Registry['avatars.show']['types'],
  },
  'groups.invite': {
    methods: ["GET","HEAD"],
    pattern: '/convite/:code',
    tokens: [{"old":"/convite/:code","type":0,"val":"convite","end":""},{"old":"/convite/:code","type":1,"val":"code","end":""}],
    types: placeholder as Registry['groups.invite']['types'],
  },
  'guest_invites.show': {
    methods: ["GET","HEAD"],
    pattern: '/convite-jogador/:token',
    tokens: [{"old":"/convite-jogador/:token","type":0,"val":"convite-jogador","end":""},{"old":"/convite-jogador/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['guest_invites.show']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'groups.index': {
    methods: ["GET","HEAD"],
    pattern: '/grupos',
    tokens: [{"old":"/grupos","type":0,"val":"grupos","end":""}],
    types: placeholder as Registry['groups.index']['types'],
  },
  'groups.store': {
    methods: ["POST"],
    pattern: '/grupos',
    tokens: [{"old":"/grupos","type":0,"val":"grupos","end":""}],
    types: placeholder as Registry['groups.store']['types'],
  },
  'groups.update': {
    methods: ["POST"],
    pattern: '/grupos/:id',
    tokens: [{"old":"/grupos/:id","type":0,"val":"grupos","end":""},{"old":"/grupos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['groups.update']['types'],
  },
  'groups.show': {
    methods: ["GET","HEAD"],
    pattern: '/grupos/:id',
    tokens: [{"old":"/grupos/:id","type":0,"val":"grupos","end":""},{"old":"/grupos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['groups.show']['types'],
  },
  'groups.matches.create': {
    methods: ["GET","HEAD"],
    pattern: '/grupos/:id/partidas/nova',
    tokens: [{"old":"/grupos/:id/partidas/nova","type":0,"val":"grupos","end":""},{"old":"/grupos/:id/partidas/nova","type":1,"val":"id","end":""},{"old":"/grupos/:id/partidas/nova","type":0,"val":"partidas","end":""},{"old":"/grupos/:id/partidas/nova","type":0,"val":"nova","end":""}],
    types: placeholder as Registry['groups.matches.create']['types'],
  },
  'matches.store': {
    methods: ["POST"],
    pattern: '/grupos/:groupId/partidas',
    tokens: [{"old":"/grupos/:groupId/partidas","type":0,"val":"grupos","end":""},{"old":"/grupos/:groupId/partidas","type":1,"val":"groupId","end":""},{"old":"/grupos/:groupId/partidas","type":0,"val":"partidas","end":""}],
    types: placeholder as Registry['matches.store']['types'],
  },
  'matches.show': {
    methods: ["GET","HEAD"],
    pattern: '/partidas/:id',
    tokens: [{"old":"/partidas/:id","type":0,"val":"partidas","end":""},{"old":"/partidas/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['matches.show']['types'],
  },
  'matches.finalize': {
    methods: ["POST"],
    pattern: '/partidas/:id/finalizar',
    tokens: [{"old":"/partidas/:id/finalizar","type":0,"val":"partidas","end":""},{"old":"/partidas/:id/finalizar","type":1,"val":"id","end":""},{"old":"/partidas/:id/finalizar","type":0,"val":"finalizar","end":""}],
    types: placeholder as Registry['matches.finalize']['types'],
  },
  'matches.undoFinalize': {
    methods: ["POST"],
    pattern: '/partidas/:id/desfazer-resultado',
    tokens: [{"old":"/partidas/:id/desfazer-resultado","type":0,"val":"partidas","end":""},{"old":"/partidas/:id/desfazer-resultado","type":1,"val":"id","end":""},{"old":"/partidas/:id/desfazer-resultado","type":0,"val":"desfazer-resultado","end":""}],
    types: placeholder as Registry['matches.undoFinalize']['types'],
  },
  'matches.cancel': {
    methods: ["POST"],
    pattern: '/partidas/:id/cancelar',
    tokens: [{"old":"/partidas/:id/cancelar","type":0,"val":"partidas","end":""},{"old":"/partidas/:id/cancelar","type":1,"val":"id","end":""},{"old":"/partidas/:id/cancelar","type":0,"val":"cancelar","end":""}],
    types: placeholder as Registry['matches.cancel']['types'],
  },
  'ranking.index': {
    methods: ["GET","HEAD"],
    pattern: '/ranking',
    tokens: [{"old":"/ranking","type":0,"val":"ranking","end":""}],
    types: placeholder as Registry['ranking.index']['types'],
  },
  'profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/perfil',
    tokens: [{"old":"/perfil","type":0,"val":"perfil","end":""}],
    types: placeholder as Registry['profile.show']['types'],
  },
  'profile.update': {
    methods: ["POST"],
    pattern: '/perfil',
    tokens: [{"old":"/perfil","type":0,"val":"perfil","end":""}],
    types: placeholder as Registry['profile.update']['types'],
  },
  'profile.updateAccount': {
    methods: ["POST"],
    pattern: '/perfil/conta',
    tokens: [{"old":"/perfil/conta","type":0,"val":"perfil","end":""},{"old":"/perfil/conta","type":0,"val":"conta","end":""}],
    types: placeholder as Registry['profile.updateAccount']['types'],
  },
  'profile.equip': {
    methods: ["POST"],
    pattern: '/perfil/equipar',
    tokens: [{"old":"/perfil/equipar","type":0,"val":"perfil","end":""},{"old":"/perfil/equipar","type":0,"val":"equipar","end":""}],
    types: placeholder as Registry['profile.equip']['types'],
  },
  'profile.unequip': {
    methods: ["POST"],
    pattern: '/perfil/desequipar',
    tokens: [{"old":"/perfil/desequipar","type":0,"val":"perfil","end":""},{"old":"/perfil/desequipar","type":0,"val":"desequipar","end":""}],
    types: placeholder as Registry['profile.unequip']['types'],
  },
  'history.show': {
    methods: ["GET","HEAD"],
    pattern: '/historico',
    tokens: [{"old":"/historico","type":0,"val":"historico","end":""}],
    types: placeholder as Registry['history.show']['types'],
  },
  'members.show': {
    methods: ["GET","HEAD"],
    pattern: '/grupos/:groupId/membros/:userId',
    tokens: [{"old":"/grupos/:groupId/membros/:userId","type":0,"val":"grupos","end":""},{"old":"/grupos/:groupId/membros/:userId","type":1,"val":"groupId","end":""},{"old":"/grupos/:groupId/membros/:userId","type":0,"val":"membros","end":""},{"old":"/grupos/:groupId/membros/:userId","type":1,"val":"userId","end":""}],
    types: placeholder as Registry['members.show']['types'],
  },
  'guest_invites.member': {
    methods: ["GET","HEAD"],
    pattern: '/grupos/:groupId/convidados/:inviteId',
    tokens: [{"old":"/grupos/:groupId/convidados/:inviteId","type":0,"val":"grupos","end":""},{"old":"/grupos/:groupId/convidados/:inviteId","type":1,"val":"groupId","end":""},{"old":"/grupos/:groupId/convidados/:inviteId","type":0,"val":"convidados","end":""},{"old":"/grupos/:groupId/convidados/:inviteId","type":1,"val":"inviteId","end":""}],
    types: placeholder as Registry['guest_invites.member']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
