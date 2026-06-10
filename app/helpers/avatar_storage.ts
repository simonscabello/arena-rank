import type User from '#models/user'
import app from '@adonisjs/core/services/app'
import { type MultipartFile } from '@adonisjs/bodyparser/types'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const AVATAR_DIR = 'uploads/avatars'
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const
const MAX_AVATAR_BYTES = 2 * 1024 * 1024

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

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

function extensionFromContentType(contentType: string | null) {
  if (!contentType) return 'jpg'

  const normalized = contentType.split(';')[0].trim().toLowerCase()
  return CONTENT_TYPE_TO_EXT[normalized] ?? null
}

export async function saveUserAvatarFromRemoteUrl(user: User, remoteUrl: string) {
  const response = await fetch(remoteUrl)
  if (!response.ok) {
    throw new Error('Não foi possível baixar a foto')
  }

  const contentLength = Number(response.headers.get('content-length') ?? 0)
  if (contentLength > MAX_AVATAR_BYTES) {
    throw new Error('A foto excede o tamanho máximo de 2 MB')
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.byteLength > MAX_AVATAR_BYTES) {
    throw new Error('A foto excede o tamanho máximo de 2 MB')
  }

  const extname = extensionFromContentType(response.headers.get('content-type'))
  if (!extname || !ALLOWED_EXTENSIONS.includes(extname as (typeof ALLOWED_EXTENSIONS)[number])) {
    throw new Error('Formato de imagem não suportado')
  }

  const relativePath = avatarRelativePath(user.id, extname)
  const directory = app.makePath('storage', AVATAR_DIR)
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, avatarFilename(user.id, extname)), buffer)

  if (user.avatarPath && user.avatarPath !== relativePath) {
    await deleteAvatarFile(user.avatarPath)
  }

  user.avatarPath = relativePath
  await user.save()
}

export async function syncGoogleAvatarIfMissing(user: User, remoteUrl: string | null) {
  if (!remoteUrl || user.avatarPath) return

  try {
    await saveUserAvatarFromRemoteUrl(user, remoteUrl)
  } catch {
    return
  }
}
