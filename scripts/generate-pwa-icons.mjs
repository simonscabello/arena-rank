import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const faviconSource = join(publicDir, 'favicon-source.png')
const maskableSource = join(publicDir, 'icon-maskable-source.png')
const logoSymbolRaw = join(publicDir, 'logo-symbol-raw.png')
const logoSymbol = join(publicDir, 'logo-symbol.png')

async function removeDarkBackground(input, output) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    if (r < 40 && g < 40 && b < 40) {
      data[i + 3] = 0
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(output)
}

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
]

for (const { name, size } of sizes) {
  await sharp(faviconSource).resize(size, size).png().toFile(join(publicDir, name))
}

await sharp(maskableSource).resize(512, 512).png().toFile(join(publicDir, 'icon-maskable-512.png'))
await removeDarkBackground(logoSymbolRaw, logoSymbol)

console.log('PWA icons generated in public/')
