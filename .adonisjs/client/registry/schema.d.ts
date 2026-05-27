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
      response: unknown
      errorResponse: unknown
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
  'groups.join': {
    methods: ["POST"]
    pattern: '/grupos/entrar'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/group').joinGroupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/group').joinGroupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['join']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['join']>>> | { status: 422; response: { errors: SimpleError[] } }
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
}
