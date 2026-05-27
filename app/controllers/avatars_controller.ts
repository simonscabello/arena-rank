import { avatarStoragePath, isAllowedAvatarFilename } from '#helpers/avatar_storage'
import type { HttpContext } from '@adonisjs/core/http'
import { existsSync } from 'node:fs'
import path from 'node:path'

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export default class AvatarsController {
  async show({ params, response }: HttpContext) {
    const file = params.file
    if (!isAllowedAvatarFilename(file)) {
      return response.notFound()
    }

    const absolutePath = avatarStoragePath(path.join('uploads/avatars', file))
    if (!existsSync(absolutePath)) {
      return response.notFound()
    }

    const ext = path.extname(file).slice(1).toLowerCase()
    response.header('Content-Type', MIME_TYPES[ext] ?? 'application/octet-stream')
    response.header('Cache-Control', 'public, max-age=86400')
    return response.download(absolutePath)
  }
}
