import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const faviconSvg = join(publicDir, 'favicon.svg')

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

for (const { name, size } of sizes) {
  await sharp(faviconSvg).resize(size, size).png().toFile(join(publicDir, name))
}

const maskableSize = 512
const iconSize = Math.round(maskableSize * 0.6)
const offset = Math.round((maskableSize - iconSize) / 2)

const iconBuffer = await sharp(faviconSvg).resize(iconSize, iconSize).png().toBuffer()

await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: '#0d9488',
  },
})
  .composite([{ input: iconBuffer, left: offset, top: offset }])
  .png()
  .toFile(join(publicDir, 'icon-maskable-512.png'))

console.log('PWA icons generated in public/')
