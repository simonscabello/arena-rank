/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'health': {
    methods: ["GET","HEAD"]
    pattern: '/health'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
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
  'auth.google.redirect': {
    methods: ["GET","HEAD"]
    pattern: '/auth/google/redirect'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/google_auth_controller').default['redirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/google_auth_controller').default['redirect']>>>
    }
  }
  'auth.google.callback': {
    methods: ["GET","HEAD"]
    pattern: '/auth/google/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/google_auth_controller').default['callback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/google_auth_controller').default['callback']>>>
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
  'ranking.index': {
    methods: ["GET","HEAD"]
    pattern: '/ranking'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/ranking_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/ranking_controller').default['index']>>>
    }
  }
  'profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/perfil'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/history').historyFiltersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
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
  'profile.equip': {
    methods: ["POST"]
    pattern: '/perfil/equipar'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/cosmetics').equipCosmeticValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/cosmetics').equipCosmeticValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['equip']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['equip']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.unequip': {
    methods: ["POST"]
    pattern: '/perfil/desequipar'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/cosmetics').unequipCosmeticValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/cosmetics').unequipCosmeticValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['unequip']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['unequip']>>> | { status: 422; response: { errors: SimpleError[] } }
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
