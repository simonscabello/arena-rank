import { generateInviteCode } from '#helpers/group_access'
import { getGroupRanking } from '#helpers/ranking'
import { getLifetimeBetPoints } from '#helpers/wallet'
import { getMemberDisplayWithRewards } from '#helpers/shop_rewards'
import Arena from '#models/arena'
import Bet from '#models/bet'
import GameMatch from '#models/game_match'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import MatchPlayer from '#models/match_player'
import ShopItem from '#models/shop_item'
import User from '#models/user'
import UserPurchase from '#models/user_purchase'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Shop', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  async function createUser(email: string) {
    return User.create({
      email,
      password: 'password123',
      fullName: email.split('@')[0],
      shopBalance: 0,
    })
  }

  async function seedTitle(icon = '🎯', slug = 'test-title') {
    return ShopItem.create({
      slug,
      name: 'Título Teste',
      description: 'Teste',
      price: 30,
      itemType: 'title',
      payload: { icon, category: 'meme' },
      active: true,
      sortOrder: 1,
    })
  }

  test('finalize awards shop balance without affecting ranking source', async ({ assert }) => {
    const owner = await createUser('owner@test.com')
    const bettor = await createUser('bettor@test.com')
    const arena = await Arena.create({ name: 'Arena' })
    const groupRecord = await Group.create({ name: 'Play', inviteCode: generateInviteCode() })
    await GroupMember.create({ groupId: groupRecord.id, userId: owner.id, role: 'organizador' })
    await GroupMember.create({ groupId: groupRecord.id, userId: bettor.id, role: 'membro' })

    const match = await GameMatch.create({
      groupId: groupRecord.id,
      arenaId: arena.id,
      createdByUserId: owner.id,
      status: 'finalizada',
      winnerSide: 1,
    })
    await MatchPlayer.create({ matchId: match.id, userId: owner.id, side: 1 })
    await MatchPlayer.create({ matchId: match.id, userId: bettor.id, side: 2 })
    await Bet.create({
      matchId: match.id,
      userId: bettor.id,
      predictedSide: 1,
      pointsAwarded: 10,
    })

    const { creditBetReward } = await import('#helpers/wallet')
    await db.transaction(async (trx) => {
      const bet = await Bet.query({ client: trx }).where('match_id', match.id).firstOrFail()
      await creditBetReward(bettor.id, bet.id, 10, trx)
    })

    await bettor.refresh()
    assert.equal(bettor.shopBalance, 10)

    const ranking = await getGroupRanking(groupRecord.id)
    const entry = ranking.find((row) => row.userId === bettor.id)
    assert.equal(entry?.totalPoints, 10)
  })

  test('purchase debits balance and keeps ranking points', async ({ client, assert }) => {
    const user = await createUser('buyer@test.com')
    user.shopBalance = 50
    await user.save()

    const item = await seedTitle()

    const response = await client.post(`/loja/${item.id}/comprar`).loginAs(user).redirects(0)

    assert.equal(response.status(), 302)

    await user.refresh()
    assert.equal(user.shopBalance, 20)

    const owned = await UserPurchase.query()
      .where('user_id', user.id)
      .where('shop_item_id', item.id)
      .first()
    assert.isNotNull(owned)

    const arena = await Arena.create({ name: 'Arena' })
    const groupRecord = await Group.create({ name: 'Play', inviteCode: generateInviteCode() })
    await GroupMember.create({ groupId: groupRecord.id, userId: user.id, role: 'organizador' })
    const match = await GameMatch.create({
      groupId: groupRecord.id,
      arenaId: arena.id,
      createdByUserId: user.id,
      status: 'finalizada',
      winnerSide: 1,
    })
    await Bet.create({
      matchId: match.id,
      userId: user.id,
      predictedSide: 1,
      pointsAwarded: 10,
    })

    const ranking = await getGroupRanking(groupRecord.id)
    assert.equal(ranking.find((row) => row.userId === user.id)?.totalPoints, 10)
  })

  test('purchase free item with zero balance', async ({ client, assert }) => {
    const user = await createUser('free@test.com')
    assert.equal(user.shopBalance, 0)

    const frame = await ShopItem.create({
      slug: 'test-free-frame',
      name: 'Moldura Grátis',
      description: 'Teste',
      price: 0,
      itemType: 'avatar_frame',
      payload: { frameSrc: '/shop/frames/12.png', inset: 18 },
      active: true,
      sortOrder: 1,
    })

    const response = await client.post(`/loja/${frame.id}/comprar`).loginAs(user).redirects(0)
    assert.equal(response.status(), 302)

    await user.refresh()
    assert.equal(user.shopBalance, 0)

    const owned = await UserPurchase.query()
      .where('user_id', user.id)
      .where('shop_item_id', frame.id)
      .first()
    assert.isNotNull(owned)
    assert.equal(owned!.pricePaid, 0)
  })

  test('purchase free title with zero balance', async ({ client, assert }) => {
    const user = await createUser('free-title@test.com')
    const title = await ShopItem.create({
      slug: 'test-free-title',
      name: 'On Fire',
      description: 'Grátis',
      price: 0,
      itemType: 'title',
      payload: { icon: '🔥', category: 'competitive' },
      active: true,
      sortOrder: 1,
    })

    const response = await client.post(`/loja/${title.id}/comprar`).loginAs(user).redirects(0)
    assert.equal(response.status(), 302)

    const display = await getMemberDisplayWithRewards(user.id)
    assert.equal(display.equippedTitles.length, 1)
    assert.equal(display.equippedTitles[0].icon, '🔥')
  })

  test('purchase fails with insufficient balance', async ({ client, assert }) => {
    const user = await createUser('poor@test.com')
    const item = await seedTitle()

    const response = await client.post(`/loja/${item.id}/comprar`).loginAs(user).redirects(0)

    assert.equal(response.status(), 302)
    await user.refresh()
    assert.equal(user.shopBalance, 0)
    const purchases = await UserPurchase.query().where('user_id', user.id)
    assert.equal(purchases.length, 0)
  })

  test('debitBetReversal reverses wallet credit', async ({ assert }) => {
    const owner = await createUser('owner2@test.com')
    const bettor = await createUser('bettor2@test.com')
    const arena = await Arena.create({ name: 'Arena' })
    const groupRecord = await Group.create({ name: 'Play', inviteCode: generateInviteCode() })
    const match = await GameMatch.create({
      groupId: groupRecord.id,
      arenaId: arena.id,
      createdByUserId: owner.id,
      status: 'finalizada',
      winnerSide: 1,
    })
    const bet = await Bet.create({
      matchId: match.id,
      userId: bettor.id,
      predictedSide: 1,
      pointsAwarded: 10,
    })

    const { creditBetReward, debitBetReversal } = await import('#helpers/wallet')

    await db.transaction(async (trx) => {
      await creditBetReward(bettor.id, bet.id, 10, trx)
    })
    await bettor.refresh()
    assert.equal(bettor.shopBalance, 10)

    await db.transaction(async (trx) => {
      await debitBetReversal(bettor.id, bet.id, 10, trx)
    })

    await bettor.refresh()
    assert.equal(bettor.shopBalance, 0)
  })

  test('equip shows frame src on member display', async ({ client, assert }) => {
    const user = await createUser('frame@test.com')
    user.shopBalance = 100
    await user.save()

    const frame = await ShopItem.create({
      slug: 'test-frame',
      name: 'Moldura Teste',
      description: 'Teste',
      price: 30,
      itemType: 'avatar_frame',
      payload: { frameSrc: '/shop/frames/1.png', inset: 20 },
      active: true,
      sortOrder: 1,
    })

    await client.post(`/loja/${frame.id}/comprar`).loginAs(user)

    const display = await getMemberDisplayWithRewards(user.id)
    assert.equal(display.avatarFrameSrc, '/shop/frames/1.png')
    assert.equal(display.avatarFrameInset, 20)
  })

  test('equip shows title on member display', async ({ client, assert }) => {
    const user = await createUser('equip@test.com')
    user.shopBalance = 50
    await user.save()
    const item = await seedTitle()

    await client.post(`/loja/${item.id}/comprar`).loginAs(user)

    const display = await getMemberDisplayWithRewards(user.id)
    assert.equal(display.equippedTitles.length, 1)
    assert.equal(display.equippedTitles[0].icon, '🎯')
  })

  test('can equip up to three titles', async ({ client, assert }) => {
    const user = await createUser('triple@test.com')
    user.shopBalance = 500
    await user.save()

    const items = await Promise.all([
      seedTitle('🎯', 'title-a'),
      seedTitle('🔥', 'title-b'),
      seedTitle('👑', 'title-c'),
    ])

    for (const item of items) {
      await client.post(`/loja/${item.id}/comprar`).loginAs(user)
    }

    const display = await getMemberDisplayWithRewards(user.id)
    assert.equal(display.equippedTitles.length, 3)
    assert.deepEqual(
      display.equippedTitles.map((t) => t.icon),
      ['🎯', '🔥', '👑']
    )
  })

  test('equip with explicit slot replaces that slot', async ({ client, assert }) => {
    const user = await createUser('slot@test.com')
    user.shopBalance = 200
    await user.save()

    const first = await seedTitle('🎯', 'title-first')
    const second = await seedTitle('🔥', 'title-second')

    await client.post(`/loja/${first.id}/comprar`).loginAs(user)
    await client.post(`/loja/${second.id}/comprar`).loginAs(user)
    await client.post('/loja/desequipar').loginAs(user).form({ shopItemId: second.id }).redirects(0)
    await client
      .post('/loja/equipar')
      .loginAs(user)
      .form({ shopItemId: second.id, slot: 1 })
      .redirects(0)

    const display = await getMemberDisplayWithRewards(user.id)
    assert.equal(display.equippedTitles.length, 1)
    assert.equal(display.equippedTitles[0].icon, '🔥')
  })

  test('lifetime bet points sums all plays', async ({ assert }) => {
    const user = await createUser('life@test.com')
    const arena = await Arena.create({ name: 'Arena' })
    const g1 = await Group.create({ name: 'G1', inviteCode: generateInviteCode() })
    const g2 = await Group.create({ name: 'G2', inviteCode: generateInviteCode() })

    for (const groupId of [g1.id, g2.id]) {
      const match = await GameMatch.create({
        groupId,
        arenaId: arena.id,
        createdByUserId: user.id,
        status: 'finalizada',
        winnerSide: 1,
      })
      await Bet.create({
        matchId: match.id,
        userId: user.id,
        predictedSide: 1,
        pointsAwarded: 10,
      })
    }

    assert.equal(await getLifetimeBetPoints(user.id), 20)
  })
})
