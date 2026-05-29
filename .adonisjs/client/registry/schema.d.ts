/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/home_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/home_controller').default['show']>>>
    }
  }
  'avatars.show': {
    methods: ["GET","HEAD"]
    pattern: '/uploads/avatars/:file'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { file: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/avatars_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/avatars_controller').default['show']>>>
    }
  }
  'groups.invite': {
    methods: ["GET","HEAD"]
    pattern: '/convite/:code'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { code: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['invite']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['invite']>>>
    }
  }
  'guest_invites.show': {
    methods: ["GET","HEAD"]
    pattern: '/convite-jogador/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/guest_invites_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/guest_invites_controller').default['show']>>>
    }
  }
  'new_account.create': {
    methods: ["GET","HEAD"]
    pattern: '/signup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
    }
  }
  'new_account.store': {
    methods: ["POST"]
    pattern: '/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.create': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
    }
  }
  'session.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
    }
  }
  'session.destroy': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
    }
  }
  'groups.index': {
    methods: ["GET","HEAD"]
    pattern: '/grupos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['index']>>>
    }
  }
  'groups.store': {
    methods: ["POST"]
    pattern: '/grupos'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/group').createGroupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/group').createGroupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'groups.update': {
    methods: ["POST"]
    pattern: '/grupos/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/group').updateGroupValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/group').updateGroupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'groups.show': {
    methods: ["GET","HEAD"]
    pattern: '/grupos/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['show']>>>
    }
  }
  'groups.matches.create': {
    methods: ["GET","HEAD"]
    pattern: '/grupos/:id/partidas/nova'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['createMatchForm']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['createMatchForm']>>>
    }
  }
  'matches.store': {
    methods: ["POST"]
    pattern: '/grupos/:groupId/partidas'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/match').createMatchValidator)>>
      paramsTuple: [ParamValue]
      params: { groupId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/match').createMatchValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'matches.show': {
    methods: ["GET","HEAD"]
    pattern: '/partidas/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['show']>>>
    }
  }
  'matches.bet': {
    methods: ["POST"]
    pattern: '/partidas/:id/palpite'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/match').placeBetValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/match').placeBetValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['placeBet']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['placeBet']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'matches.start': {
    methods: ["POST"]
    pattern: '/partidas/:id/iniciar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['start']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['start']>>>
    }
  }
  'matches.finalize': {
    methods: ["POST"]
    pattern: '/partidas/:id/finalizar'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/match').finalizeMatchValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/match').finalizeMatchValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['finalize']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['finalize']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'matches.reopenBets': {
    methods: ["POST"]
    pattern: '/partidas/:id/reabrir-palpites'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['reopenBets']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['reopenBets']>>>
    }
  }
  'matches.undoFinalize': {
    methods: ["POST"]
    pattern: '/partidas/:id/desfazer-resultado'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['undoFinalize']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['undoFinalize']>>>
    }
  }
  'matches.cancel': {
    methods: ["POST"]
    pattern: '/partidas/:id/cancelar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['cancel']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/matches_controller').default['cancel']>>>
    }
  }
  'profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/perfil'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'profile.update': {
    methods: ["POST"]
    pattern: '/perfil'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/profile').updateProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/profile').updateProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.updateAccount': {
    methods: ["POST"]
    pattern: '/perfil/conta'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/account').updateAccountValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/account').updateAccountValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['updateAccount']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['updateAccount']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'history.show': {
    methods: ["GET","HEAD"]
    pattern: '/historico'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/history').historyFiltersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/history_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/history_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'shop.index': {
    methods: ["GET","HEAD"]
    pattern: '/loja'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shop_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shop_controller').default['index']>>>
    }
  }
  'shop.purchase': {
    methods: ["POST"]
    pattern: '/loja/:id/comprar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shop_controller').default['purchase']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shop_controller').default['purchase']>>>
    }
  }
  'shop.equip': {
    methods: ["POST"]
    pattern: '/loja/equipar'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/shop').equipShopItemValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/shop').equipShopItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shop_controller').default['equip']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shop_controller').default['equip']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'shop.unequip': {
    methods: ["POST"]
    pattern: '/loja/desequipar'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/shop').unequipShopItemValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/shop').unequipShopItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shop_controller').default['unequip']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shop_controller').default['unequip']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'members.show': {
    methods: ["GET","HEAD"]
    pattern: '/grupos/:groupId/membros/:userId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { groupId: ParamValue; userId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/members_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/members_controller').default['show']>>>
    }
  }
  'guest_invites.member': {
    methods: ["GET","HEAD"]
    pattern: '/grupos/:groupId/convidados/:inviteId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { groupId: ParamValue; inviteId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/guest_invites_controller').default['member']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/guest_invites_controller').default['member']>>>
    }
  }
}
