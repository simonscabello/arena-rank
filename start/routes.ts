/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.get('/', [controllers.Home, 'show']).as('home')

router.get('uploads/avatars/:file', [controllers.Avatars, 'show']).as('avatars.show')

router.get('convite/:code', [controllers.Groups, 'invite']).as('groups.invite')
router.get('convite-jogador/:token', [controllers.GuestInvites, 'show']).as('guest_invites.show')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])

    router.get('grupos', [controllers.Groups, 'index']).as('groups.index')
    router.post('grupos', [controllers.Groups, 'store']).as('groups.store')
    router.post('grupos/:id', [controllers.Groups, 'update']).as('groups.update')
    router.get('grupos/:id', [controllers.Groups, 'show']).as('groups.show')
    router
      .get('grupos/:id/partidas/nova', [controllers.Groups, 'createMatchForm'])
      .as('groups.matches.create')
    router.post('grupos/:groupId/partidas', [controllers.Matches, 'store']).as('matches.store')

    router.get('partidas/:id', [controllers.Matches, 'show']).as('matches.show')
    router.post('partidas/:id/palpite', [controllers.Matches, 'placeBet']).as('matches.bet')
    router.post('partidas/:id/iniciar', [controllers.Matches, 'start']).as('matches.start')
    router.post('partidas/:id/finalizar', [controllers.Matches, 'finalize']).as('matches.finalize')
    router
      .post('partidas/:id/reabrir-palpites', [controllers.Matches, 'reopenBets'])
      .as('matches.reopenBets')
    router
      .post('partidas/:id/desfazer-resultado', [controllers.Matches, 'undoFinalize'])
      .as('matches.undoFinalize')
    router.post('partidas/:id/cancelar', [controllers.Matches, 'cancel']).as('matches.cancel')

    router.get('perfil', [controllers.Profile, 'show']).as('profile.show')
    router.post('perfil', [controllers.Profile, 'update']).as('profile.update')
    router.post('perfil/conta', [controllers.Profile, 'updateAccount']).as('profile.updateAccount')
    router.get('historico', [controllers.History, 'show']).as('history.show')
    router.get('loja', [controllers.Shop, 'index']).as('shop.index')
    router.post('loja/:id/comprar', [controllers.Shop, 'purchase']).as('shop.purchase')
    router.post('loja/equipar', [controllers.Shop, 'equip']).as('shop.equip')
    router.post('loja/desequipar', [controllers.Shop, 'unequip']).as('shop.unequip')
    router.get('grupos/:groupId/membros/:userId', [controllers.Members, 'show']).as('members.show')
    router
      .get('grupos/:groupId/convidados/:inviteId', [controllers.GuestInvites, 'member'])
      .as('guest_invites.member')
  })
  .use(middleware.auth())
