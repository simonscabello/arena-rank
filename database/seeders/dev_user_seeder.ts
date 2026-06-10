import { generateInviteCode } from '#helpers/group_access'
import Group from '#models/group'
import GroupMember from '#models/group_member'
import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

const GROUP_ID = 1

const USERS = [
  {
    googleId: 'dev-joao',
    email: 'joao@palpiteiro.test',
    fullName: 'João Silva',
    nickname: 'Juão',
    funLabel: 'Se entrar o saque já é lucro',
    dominantHand: 'direita',
    courtSide: 'direita',
    skillLevel: 'intermediario',
  },
  {
    googleId: 'dev-maria',
    email: 'maria@palpiteiro.test',
    fullName: 'Maria Costa',
    nickname: 'Mari',
    funLabel: 'Rainha da Rede',
    dominantHand: 'direita',
    courtSide: 'esquerda',
    skillLevel: 'avancado',
  },
  {
    googleId: 'dev-pedro',
    email: 'pedro@palpiteiro.test',
    fullName: 'Pedro Alves',
    nickname: null,
    dominantHand: 'esquerda',
    courtSide: 'direita',
    skillLevel: 'intermediario',
  },
  {
    googleId: 'dev-ana',
    email: 'ana@palpiteiro.test',
    fullName: 'Ana Ferreira',
    nickname: 'Aninha',
    dominantHand: 'direita',
    courtSide: 'esquerda',
    skillLevel: 'iniciante',
  },
  {
    googleId: 'dev-lucas',
    email: 'lucas@palpiteiro.test',
    fullName: 'Lucas Mendes',
    nickname: null,
    dominantHand: 'direita',
    courtSide: 'direita',
    skillLevel: 'avancado',
  },
  {
    googleId: 'dev-carla',
    email: 'carla@palpiteiro.test',
    fullName: 'Carla Ribeiro',
    nickname: 'Carlinha',
    dominantHand: 'esquerda',
    courtSide: 'esquerda',
    skillLevel: 'intermediario',
  },
  {
    googleId: 'dev-rafa',
    email: 'rafa@palpiteiro.test',
    fullName: 'Rafael Souza',
    nickname: 'Rafa',
    dominantHand: 'direita',
    courtSide: 'direita',
    skillLevel: 'intermediario',
  },
  {
    googleId: 'dev-bia',
    email: 'bia@palpiteiro.test',
    fullName: 'Beatriz Lima',
    nickname: 'Bia',
    dominantHand: 'direita',
    courtSide: 'esquerda',
    skillLevel: 'iniciante',
  },
] as const

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    let group = await Group.find(GROUP_ID)
    if (!group) {
      group = await Group.create({
        id: GROUP_ID,
        name: 'Play Dev',
        inviteCode: generateInviteCode(),
      })
    }

    for (const data of USERS) {
      const user = await User.updateOrCreate(
        { email: data.email },
        {
          ...data,
          password: null,
          xp: 0,
          level: 1,
          elo: 1000,
        }
      )

      const role = data.email === 'joao@palpiteiro.test' ? 'organizador' : 'membro'

      await GroupMember.updateOrCreate(
        { groupId: group.id, userId: user.id },
        { groupId: group.id, userId: user.id, role }
      )
    }
  }
}
