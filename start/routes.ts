import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.get('/health', ({ response }) => response.ok({ status: 'ok' })).as('health')

router.get('/', [controllers.Home, 'show']).as('home')

router.get('uploads/avatars/:file', [controllers.Avatars, 'show']).as('avatars.show')

router.get('convite/:code', [controllers.Groups, 'invite']).as('groups.invite')
router.get('convite-jogador/:token', [controllers.GuestInvites, 'show']).as('guest_invites.show')

router
  .group(() => {
    router.get('login', [controllers.Session, 'create']).as('session.create')

    router
      .get('auth/google/redirect', [controllers.GoogleAuth, 'redirect'])
      .as('auth.google.redirect')
    router
      .get('auth/google/callback', [controllers.GoogleAuth, 'callback'])
      .as('auth.google.callback')
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
    router.post('partidas/:id/finalizar', [controllers.Matches, 'finalize']).as('matches.finalize')
    router
      .post('partidas/:id/desfazer-resultado', [controllers.Matches, 'undoFinalize'])
      .as('matches.undoFinalize')
    router.post('partidas/:id/cancelar', [controllers.Matches, 'cancel']).as('matches.cancel')

    router.get('ranking', [controllers.Ranking, 'index']).as('ranking.index')

    router.get('perfil', [controllers.Profile, 'show']).as('profile.show')
    router.post('perfil', [controllers.Profile, 'update']).as('profile.update')
    router.post('perfil/conta', [controllers.Profile, 'updateAccount']).as('profile.updateAccount')
    router.post('perfil/equipar', [controllers.Profile, 'equip']).as('profile.equip')
    router.post('perfil/desequipar', [controllers.Profile, 'unequip']).as('profile.unequip')
    router.get('historico', [controllers.History, 'show']).as('history.show')
    router
      .get('jogadores/:userId/historico', [controllers.PlayerHistory, 'show'])
      .as('players.history.show')
    router.get('grupos/:groupId/membros/:userId', [controllers.Members, 'show']).as('members.show')
    router
      .get('grupos/:groupId/convidados/:inviteId', [controllers.GuestInvites, 'member'])
      .as('guest_invites.member')
  })
  .use(middleware.auth())
