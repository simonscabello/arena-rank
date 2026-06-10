import { Form } from '@adonisjs/inertia/react'
import { router } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'
import Avatar from '~/components/Avatar'
import Card from '~/components/Card'
import Input from '~/components/Input'
import Select from '~/components/Select'
import type { Option, ProfileData } from '~/components/profile/types'
import { buttonClassName } from '~/lib/button_styles'
import { cn } from '~/lib/match'

const MAX_FUN_LABEL_LENGTH = 60

type Props = {
  profile: ProfileData
  statusSuggestions: string[]
  options: {
    dominantHands: Option[]
    courtSides: Option[]
    skillLevels: Option[]
  }
}

export default function ProfilePlaySection({ profile, statusSuggestions, options }: Props) {
  const [nickname, setNickname] = useState(profile.nickname ?? '')
  const [funLabel, setFunLabel] = useState(profile.funLabel ?? '')
  const [dominantHand, setDominantHand] = useState(profile.dominantHand ?? '')
  const [courtSide, setCourtSide] = useState(profile.courtSide ?? '')
  const [skillLevel, setSkillLevel] = useState(profile.skillLevel ?? '')
  const [localAvatar, setLocalAvatar] = useState<{ src: string | null; fromServer: boolean }>({
    src: profile.avatarUrl,
    fromServer: true,
  })
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setNickname(profile.nickname ?? '')
    setFunLabel(profile.funLabel ?? '')
    setDominantHand(profile.dominantHand ?? '')
    setCourtSide(profile.courtSide ?? '')
    setSkillLevel(profile.skillLevel ?? '')
    setLocalAvatar({ src: profile.avatarUrl, fromServer: true })
  }, [
    profile.nickname,
    profile.funLabel,
    profile.dominantHand,
    profile.courtSide,
    profile.skillLevel,
    profile.avatarUrl,
  ])

  useEffect(() => {
    if (localAvatar.fromServer || !localAvatar.src?.startsWith('blob:')) return

    return () => {
      URL.revokeObjectURL(localAvatar.src!)
    }
  }, [localAvatar])

  const displayAvatarSrc = localAvatar.fromServer ? profile.avatarUrl : localAvatar.src
  const hasAvatar = Boolean(displayAvatarSrc)

  function buildProfileFormData(formOptions?: { avatar?: File; removeAvatar?: boolean }) {
    const formData = new FormData()
    formData.set('nickname', nickname)
    formData.set('funLabel', funLabel)
    formData.set('dominantHand', dominantHand)
    formData.set('courtSide', courtSide)
    formData.set('skillLevel', skillLevel)

    if (formOptions?.removeAvatar) {
      formData.set('removeAvatar', '1')
      return formData
    }

    if (formOptions?.avatar) {
      formData.set('avatar', formOptions.avatar)
    }

    return formData
  }

  function submitProfileForm(formOptions?: { avatar?: File; removeAvatar?: boolean }) {
    const formData = buildProfileFormData(formOptions)

    setAvatarUploading(true)

    router.post('/perfil', formData, {
      forceFormData: true,
      preserveScroll: true,
      onFinish: () => {
        setAvatarUploading(false)
        if (avatarInputRef.current) avatarInputRef.current.value = ''
      },
      onError: () => {
        setLocalAvatar({ src: profile.avatarUrl, fromServer: true })
        if (avatarInputRef.current) avatarInputRef.current.value = ''
      },
    })
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!localAvatar.fromServer && localAvatar.src?.startsWith('blob:')) {
      URL.revokeObjectURL(localAvatar.src)
    }

    setLocalAvatar({ src: URL.createObjectURL(file), fromServer: false })
    submitProfileForm({ avatar: file })
  }

  function handleRemoveAvatar() {
    if (!localAvatar.fromServer && localAvatar.src?.startsWith('blob:')) {
      URL.revokeObjectURL(localAvatar.src)
    }

    setLocalAvatar({ src: null, fromServer: false })
    submitProfileForm({ removeAvatar: true })
  }

  function openAvatarPicker() {
    if (avatarUploading) return
    avatarInputRef.current?.click()
  }

  return (
    <Card title="Perfil na Play">
      <Form route="profile.update" encType="multipart/form-data" className="space-y-4">
        {({ errors, processing }) => (
          <>
            <div className="flex flex-col items-center gap-3 border-b border-stone-100 pb-4">
              <Avatar
                initials={profile.initials}
                src={displayAvatarSrc}
                size="2xl"
                frameSrc={profile.avatarFrameSrc}
                photoInset={profile.avatarFrameInset}
              />
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={openAvatarPicker}
                  disabled={avatarUploading || processing}
                  title="JPG, PNG ou WebP — máximo 2 MB"
                  className={buttonClassName('secondary', 'sm')}
                >
                  {avatarUploading
                    ? 'Enviando...'
                    : hasAvatar
                      ? 'Alterar foto'
                      : 'Adicionar foto'}
                </button>
                {hasAvatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={avatarUploading || processing}
                    className="text-xs font-medium text-stone-500 hover:text-red-600 disabled:opacity-50"
                  >
                    Remover foto
                  </button>
                )}
              </div>
              <input
                ref={avatarInputRef}
                id="avatar"
                name="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={avatarUploading || processing}
                className="sr-only"
              />
            </div>

            <Input
              label="Apelido"
              name="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Como te chamam na Play"
              error={errors.nickname}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="funLabel" className="block text-sm font-medium text-stone-700">
                  Status
                </label>
                {funLabel.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFunLabel('')}
                    className="text-xs font-medium text-stone-500 hover:text-brand-600"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <input type="hidden" name="funLabel" value={funLabel} />
              <Input
                id="funLabel"
                value={funLabel}
                onChange={(e) => setFunLabel(e.target.value.slice(0, MAX_FUN_LABEL_LENGTH))}
                placeholder='Ex: "Se entrar o saque já é lucro"'
                error={errors.funLabel}
                maxLength={MAX_FUN_LABEL_LENGTH}
              />
              <p className="text-xs text-stone-500">
                Frase curta sobre como você joga ou encara a Play. {funLabel.length}/
                {MAX_FUN_LABEL_LENGTH} caracteres
              </p>
              <div className="flex flex-wrap gap-2">
                {statusSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setFunLabel(suggestion)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                      funLabel === suggestion
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-brand-300'
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <Select
              label="Mão dominante"
              name="dominantHand"
              value={dominantHand}
              onChange={(e) => setDominantHand(e.target.value)}
              error={errors.dominantHand}
            >
              <option value="">Não informado</option>
              {options.dominantHands.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>

            <Select
              label="Lado preferido na quadra"
              name="courtSide"
              value={courtSide}
              onChange={(e) => setCourtSide(e.target.value)}
              error={errors.courtSide}
            >
              <option value="">Não informado</option>
              {options.courtSides.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>

            <Select
              label="Nível"
              name="skillLevel"
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              error={errors.skillLevel}
            >
              <option value="">Não informado</option>
              {options.skillLevels.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>

            <button
              type="submit"
              disabled={avatarUploading || processing}
              className={buttonClassName('primary', 'lg', true)}
            >
              Salvar perfil
            </button>
          </>
        )}
      </Form>
    </Card>
  )
}
