import AvatarFrame from '#models/avatar_frame'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

const FRAMES = [
  {
    slug: 'frame-12',
    name: 'Bronze Iniciante',
    description: 'Moldura de bronze para começar a coleção.',
    unlockLevel: 1,
    payload: { frameSrc: '/shop/frames/12.png', inset: 18 },
    sortOrder: 10,
  },
  {
    slug: 'frame-3',
    name: 'Verde Palpiteiro',
    description: 'Moldura oficial do app.',
    unlockLevel: 3,
    payload: { frameSrc: '/shop/frames/3.png', inset: 18 },
    sortOrder: 20,
  },
  {
    slug: 'frame-6',
    name: 'Pôr do Sol na Areia',
    description: 'Tons quentes de praia e pôr do sol.',
    unlockLevel: 5,
    payload: { frameSrc: '/shop/frames/6.png', inset: 18 },
    sortOrder: 30,
  },
  {
    slug: 'frame-9',
    name: 'Festa da Play',
    description: 'Confete e celebração do grupo.',
    unlockLevel: 8,
    payload: { frameSrc: '/shop/frames/9.png', inset: 18 },
    sortOrder: 40,
  },
  {
    slug: 'frame-4',
    name: 'Neon da Quadra',
    description: 'Brilho neon estilo arcade.',
    unlockLevel: 10,
    payload: { frameSrc: '/shop/frames/4.png', inset: 18 },
    sortOrder: 50,
  },
  {
    slug: 'frame-8',
    name: 'Raio Certeiro',
    description: 'Energia elétrica de vitória dominante.',
    unlockLevel: 12,
    payload: { frameSrc: '/shop/frames/8.png', inset: 18 },
    sortOrder: 60,
  },
  {
    slug: 'frame-11',
    name: 'Onda do Beach',
    description: 'Ondas e espuma do litoral.',
    unlockLevel: 15,
    payload: { frameSrc: '/shop/frames/11.png', inset: 18 },
    sortOrder: 70,
  },
  {
    slug: 'frame-2',
    name: 'Chama da Sequência',
    description: 'Moldura de fogo para quem está em streak.',
    unlockLevel: 18,
    payload: { frameSrc: '/shop/frames/2.png', inset: 18 },
    sortOrder: 80,
  },
  {
    slug: 'frame-5',
    name: 'Pódio de Troféus',
    description: 'Moldura de medalhas e troféus.',
    unlockLevel: 20,
    payload: { frameSrc: '/shop/frames/5.png', inset: 18 },
    sortOrder: 90,
  },
  {
    slug: 'frame-1',
    name: 'Coroa de Ouro',
    description: 'Moldura de campeão com louros e coroa.',
    unlockLevel: 25,
    payload: { frameSrc: '/shop/frames/1.png', inset: 18 },
    sortOrder: 100,
  },
  {
    slug: 'frame-10',
    name: 'Lenda Negra',
    description: 'Moldura sombria de lenda da quadra.',
    unlockLevel: 30,
    payload: { frameSrc: '/shop/frames/10.png', inset: 18 },
    sortOrder: 110,
  },
  {
    slug: 'frame-7',
    name: 'VIP Diamante',
    description: 'Moldura premium cristalina.',
    unlockLevel: 40,
    payload: { frameSrc: '/shop/frames/7.png', inset: 18 },
    sortOrder: 120,
  },
] as const

export default class extends BaseSeeder {
  async run() {
    for (const frame of FRAMES) {
      await AvatarFrame.updateOrCreate({ slug: frame.slug }, frame)
    }
  }
}
