import User from '#models/user'
import app from '@adonisjs/core/services/app'
import { MultipartFile } from '@adonisjs/bodyparser/types'
import { unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const AVATAR_DIR = 'uploads/avatars'
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const

export function avatarUrl(avatarPath: string | null) {
  if (!avatarPath) return null
  const filename = path.basename(avatarPath)
  return `/uploads/avatars/${filename}`
}

export function avatarStoragePath(avatarPath: string) {
  return app.makePath('storage', avatarPath)
}

export function isAllowedAvatarFilename(filename: string) {
  return /^user-\d+\.(jpg|jpeg|png|webp)$/i.test(filename)
}

function avatarFilename(userId: number, extname: string) {
  const ext = extname.replace(/^\./, '').toLowerCase()
  return `user-${userId}.${ext}`
}

function avatarRelativePath(userId: number, extname: string) {
  return `${AVATAR_DIR}/${avatarFilename(userId, extname)}`
}

export async function deleteAvatarFile(avatarPath: string | null) {
  if (!avatarPath) return

  const absolutePath = avatarStoragePath(avatarPath)
  if (existsSync(absolutePath)) {
    await unlink(absolutePath)
  }
}

export async function saveUserAvatar(user: User, file: MultipartFile) {
  if (!file.isValid) {
    throw new Error(file.errors.map((e) => e.message).join(', ') || 'Arquivo inválido')
  }

  const extname = file.extname?.replace(/^\./, '').toLowerCase()
  if (!extname || !ALLOWED_EXTENSIONS.includes(extname as (typeof ALLOWED_EXTENSIONS)[number])) {
    throw new Error('Formato de imagem não suportado')
  }

  const relativePath = avatarRelativePath(user.id, extname)
  const directory = app.makePath('storage', AVATAR_DIR)

  await file.move(directory, {
    name: avatarFilename(user.id, extname),
    overwrite: true,
  })

  if (file.state !== 'moved') {
    throw new Error('Não foi possível salvar a foto')
  }

  if (user.avatarPath && user.avatarPath !== relativePath) {
    await deleteAvatarFile(user.avatarPath)
  }

  user.avatarPath = relativePath
  await user.save()
}

export async function removeUserAvatar(user: User) {
  await deleteAvatarFile(user.avatarPath)
  user.avatarPath = null
  await user.save()
}
