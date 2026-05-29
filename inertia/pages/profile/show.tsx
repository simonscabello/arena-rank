import { Form, Link } from '@adonisjs/inertia/react'
import { router, usePage } from '@inertiajs/react'
import { Data } from '@generated/data'
import { useEffect, useRef, useState } from 'react'
import Avatar from '~/components/Avatar'
import ProfileBadge from '~/components/ProfileBadge'
import BackLink from '~/components/BackLink'
import Card from '~/components/Card'
import Input from '~/components/Input'
import PasswordInput from '~/components/PasswordInput'
import PageHeader from '~/components/PageHeader'
import Select from '~/components/Select'
import { buttonClassName } from '~/lib/button_styles'
import { cn } from '~/lib/match'

type Option = { value: string; label: string }

type Props = {
  account: {
    fullName: string | null
    email: string
  }
  profile: {
    nickname: string | null
    funLabel: string | null
    dominantHand: string | null
    courtSide: string | null
    skillLevel: string | null
    avatarUrl: string | null
    avatarFrameSrc: string | null
    avatarFrameInset: number
    equippedTitles: { icon: string; name: string }[]
    initials: string
  }
  lifetimeBetPoints: number
  ownedItems: { id: number; name: string; itemType: string }[]
  statusSuggestions: string[]
  options: {
    dominantHands: Option[]
    courtSides: Option[]
    skillLevels: Option[]
  }
}

const MAX_FUN_LABEL_LENGTH = 60

type ProfileTab = 'profile' | 'account'

export default function ProfileShow({
  account,
  profile,
  lifetimeBetPoints,
  ownedItems,
  statusSuggestions,
  options,
}: Props) {
  const shopBalance = usePage<Data.SharedProps>().props.shopBalance
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile')
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

  function buildProfileFormData(options?: { avatar?: File; removeAvatar?: boolean }) {
    const formData = new FormData()
    formData.set('nickname', nickname)
    formData.set('funLabel', funLabel)
    formData.set('dominantHand', dominantHand)
    formData.set('courtSide', courtSide)
    formData.set('skillLevel', skillLevel)

    if (options?.removeAvatar) {
      formData.set('removeAvatar', '1')
      return formData
    }

    if (options?.avatar) {
      formData.set('avatar', options.avatar)
    }

    return formData
  }

  function submitProfileForm(options?: { avatar?: File; removeAvatar?: boolean }) {
    const formData = buildProfileFormData(options)

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
    <>
      <PageHeader
        back={<BackLink route="home" label="Início" />}
        title="Meu perfil"
        subtitle="Conta e preferências no court"
      />

      <div className="mb-4 flex rounded-xl border border-stone-200 bg-stone-50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm font-medium transition',
            activeTab === 'profile'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          )}
        >
          Perfil
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm font-medium transition',
            activeTab === 'account'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          )}
        >
          Conta
        </button>
      </div>

      {activeTab === 'profile' && (
        <>
          <Card title="Loja e recompensas" className="mb-4">
            <p className="text-sm text-stone-600">
              <span className="font-semibold text-brand-700">{shopBalance} pts</span> disponíveis ·{' '}
              <span className="font-medium text-stone-800">{lifetimeBetPoints} pts</span> acumulados
              no Palpiteiro
            </p>
            {profile.equippedTitles.length > 0 && (
              <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-stone-700">
                <span className="font-medium text-stone-600">Títulos equipados:</span>
                {profile.equippedTitles.map((title) => (
                  <ProfileBadge key={title.name} icon={title.icon} title={title.name} />
                ))}
              </p>
            )}
            {profile.funLabel && (
              <p className="mt-2 text-sm italic text-brand-700">Status: {profile.funLabel}</p>
            )}
            <p className="mt-2 text-sm text-stone-500">
              {ownedItems.length > 0
                ? `${ownedItems.length} item(ns) adquirido(s)`
                : 'Nenhum item da loja ainda'}
            </p>
            <Link
              route="shop.index"
              className={cn(buttonClassName('primary', 'sm'), 'mt-4 inline-flex')}
            >
              Abrir loja
            </Link>
          </Card>

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
                      <label
                        htmlFor="funLabel"
                        className="block text-sm font-medium text-stone-700"
                      >
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
        </>
      )}

      {activeTab === 'account' && (
        <Card title="Dados da conta">
          <Form route="profile.updateAccount" className="space-y-4">
            {({ errors }) => (
              <>
                <Input
                  label="Nome"
                  type="text"
                  name="fullName"
                  id="accountFullName"
                  defaultValue={account.fullName ?? ''}
                  error={errors.fullName}
                />
                <div className="space-y-1.5">
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    id="accountEmail"
                    autoComplete="email"
                    defaultValue={account.email}
                    error={errors.email}
                  />
                  <p className="text-xs text-stone-500">Usado para fazer login no app</p>
                </div>
                <p className="text-xs text-stone-500">
                  Deixe as senhas em branco se não quiser alterar
                </p>
                <PasswordInput
                  label="Senha atual"
                  name="currentPassword"
                  id="currentPassword"
                  autoComplete="current-password"
                  error={errors.currentPassword}
                />
                <PasswordInput
                  label="Nova senha"
                  name="password"
                  id="newPassword"
                  autoComplete="new-password"
                  error={errors.password}
                />
                <PasswordInput
                  label="Confirmar nova senha"
                  name="passwordConfirmation"
                  id="passwordConfirmation"
                  autoComplete="new-password"
                  error={errors.passwordConfirmation}
                />
                <button type="submit" className={buttonClassName('primary', 'lg', true)}>
                  Salvar conta
                </button>
              </>
            )}
          </Form>
        </Card>
      )}
    </>
  )
}
