import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const FRAME_SIZE_PX = 512

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const framesDir = join(root, 'public', 'shop', 'frames')

const frameFiles = (await readdir(framesDir)).filter((name) => name.endsWith('.png')).sort()

if (frameFiles.length === 0) {
  console.error('No PNG frames found in public/shop/frames/')
  process.exit(1)
}

let totalBefore = 0
let totalAfter = 0

for (const fileName of frameFiles) {
  const filePath = join(framesDir, fileName)
  const input = sharp(filePath)
  const metadata = await input.metadata()
  const beforeBytes = (await input.clone().toBuffer()).length

  const optimized = await sharp(filePath)
    .resize(FRAME_SIZE_PX, FRAME_SIZE_PX, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png({
      compressionLevel: 9,
      effort: 10,
      palette: false,
    })
    .toBuffer()

  await sharp(optimized).toFile(filePath)

  totalBefore += beforeBytes
  totalAfter += optimized.length

  console.log(
    `${fileName}: ${metadata.width}x${metadata.height} → ${FRAME_SIZE_PX}px max, ${formatKb(beforeBytes)} → ${formatKb(optimized.length)}`
  )
}

console.log(`\nTotal: ${formatKb(totalBefore)} → ${formatKb(totalAfter)} (${frameFiles.length} files)`)

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`
}
