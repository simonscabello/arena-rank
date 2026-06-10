import { generateInviteCode } from '#helpers/group_access'
import { applyEquipFrame } from '#helpers/cosmetic_equipment'
import AvatarFrame from '#models/avatar_frame'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import User from '#models/user'
import UserUnlockedFrame from '#models/user_unlocked_frame'
import { finalizePayload } from '#tests/helpers/finalize_match'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Cosmetics', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  async function createUser(email: string) {
    return User.create({
      email,
      password: 'password123',
      fullName: email.split('@')[0],
      level: 5,
      xp: 300,
      elo: 1000,
    })
  }

  test('user can equip unlocked frame', async ({ assert }) => {
    const user = await createUser('cosmetic@test.com')
    const frame = await AvatarFrame.create({
      slug: 'test-frame',
      name: 'Test Frame',
      description: 'Test',
      unlockLevel: 1,
      payload: { frameSrc: '/shop/frames/12.png', inset: 18 },
      sortOrder: 999,
    })

    await UserUnlockedFrame.create({
      userId: user.id,
      avatarFrameId: frame.id,
      unlockedAt: DateTime.now(),
    })

    const result = await applyEquipFrame(user, frame.id)
    assert.isTrue(result.ok)

    const equipped = await db
      .from('user_equipped_items')
      .where('user_id', user.id)
      .where('item_type', 'avatar_frame')
      .first()

    assert.equal(Number(equipped?.avatar_frame_id), frame.id)
  })
})

test.group('Progression', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  async function createUser(email: string) {
    return User.create({
      email,
      password: 'password123',
      fullName: email.split('@')[0],
    })
  }

  async function createGroupWithFourPlayers() {
    const owner = await createUser('prog-owner@test.com')
    const p1 = await createUser('prog-p1@test.com')
    const p2 = await createUser('prog-p2@test.com')
    const p3 = await createUser('prog-p3@test.com')
    const p4 = await createUser('prog-p4@test.com')

    const groupRecord = await Group.create({ name: 'Prog', inviteCode: generateInviteCode() })
    for (const user of [owner, p1, p2, p3, p4]) {
      await GroupMember.create({
        groupId: groupRecord.id,
        userId: user.id,
        role: user.id === owner.id ? 'organizador' : 'membro',
      })
    }

    return { owner, p1, p2, p3, p4, group: groupRecord }
  }

  test('ranking page loads for authenticated user', async ({ client }) => {
    const user = await createUser('ranking-page@test.com')

    const response = await client.get('/ranking').loginAs(user)
    response.assertStatus(200)
    response.assertTextIncludes('data-page')
  })

  test('finalize unlocks starter frame at level threshold', async ({ client, assert }) => {
    const setup = await createGroupWithFourPlayers()
    const { owner, p1, p2, p3, p4, group: play } = setup

    await AvatarFrame.create({
      slug: 'starter-frame',
      name: 'Starter',
      description: 'Starter frame',
      unlockLevel: 1,
      payload: { frameSrc: '/shop/frames/12.png', inset: 18 },
      sortOrder: 1,
    })

    const createResponse = await client
      .post(`/grupos/${play.id}/partidas`)
      .loginAs(owner)
      .json({
        arenaName: 'Arena Prog',
        players: [
          { userId: p1.id, side: 1 },
          { userId: p2.id, side: 1 },
          { userId: p3.id, side: 2 },
          { userId: p4.id, side: 2 },
        ],
      })

    const matchId = Number(createResponse.redirects().pop()!.split('/').pop())
    await client.post(`/partidas/${matchId}/finalizar`).loginAs(owner).json(finalizePayload(1))

    const unlocked = await UserUnlockedFrame.query().where('user_id', p1.id)
    assert.isAtLeast(unlocked.length, 1)
  })
})
