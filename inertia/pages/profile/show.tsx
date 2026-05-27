import { Form } from '@adonisjs/inertia/react'
import { useEffect, useState } from 'react'
import Avatar from '~/components/Avatar'
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
    initials: string
  }
  funLabelSuggestions: string[]
  options: {
    dominantHands: Option[]
    courtSides: Option[]
    skillLevels: Option[]
  }
}

const MAX_FUN_LABEL_LENGTH = 60

export default function ProfileShow({ account, profile, funLabelSuggestions, options }: Props) {
  const [funLabel, setFunLabel] = useState(profile.funLabel ?? '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl)
  const [removeAvatar, setRemoveAvatar] = useState(false)

  useEffect(() => {
    setAvatarPreview(profile.avatarUrl)
    setRemoveAvatar(false)
  }, [profile.avatarUrl])

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setRemoveAvatar(false)

    if (!file) return

    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview)
    }

    setAvatarPreview(URL.createObjectURL(file))
  }

  function handleRemoveAvatar() {
    setRemoveAvatar(true)
    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview)
    }
    setAvatarPreview(null)
  }

  return (
    <>
      <PageHeader
        back={<BackLink route="home" label="Início" />}
        title="Meu perfil"
        subtitle="Conta e preferências no court"
      />

      <Card title="Dados da conta" className="mb-4">
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

      <Card>
        <Form route="profile.update" encType="multipart/form-data" className="space-y-4">
          {({ errors }) => (
            <>
              <div className="flex items-center gap-4 border-b border-stone-100 pb-4">
                <Avatar initials={profile.initials} src={avatarPreview} size="lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <label htmlFor="avatar" className="block text-sm font-medium text-stone-700">
                    Foto de perfil
                  </label>
                  <input
                    id="avatar"
                    name="avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700"
                  />
                  <p className="text-xs text-stone-500">JPG, PNG ou WebP — máximo 2 MB</p>
                  {(profile.avatarUrl || avatarPreview) && !removeAvatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-xs font-medium text-stone-500 hover:text-red-600"
                    >
                      Remover foto
                    </button>
                  )}
                </div>
              </div>
              {removeAvatar && <input type="hidden" name="removeAvatar" value="1" />}

              <Input
                label="Apelido"
                name="nickname"
                defaultValue={profile.nickname ?? ''}
                placeholder="Como te chamam na Play"
                error={errors.nickname}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="funLabel" className="block text-sm font-medium text-stone-700">
                    Sua label na Play
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
                  placeholder="Ex: Especialista em Saque Torto"
                  error={errors.funLabel}
                  maxLength={MAX_FUN_LABEL_LENGTH}
                />
                <p className="text-xs text-stone-500">
                  {funLabel.length}/{MAX_FUN_LABEL_LENGTH} caracteres
                </p>
                <div className="flex flex-wrap gap-2">
                  {funLabelSuggestions.map((suggestion) => (
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
                defaultValue={profile.dominantHand ?? ''}
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
                defaultValue={profile.courtSide ?? ''}
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
                defaultValue={profile.skillLevel ?? ''}
                error={errors.skillLevel}
              >
                <option value="">Não informado</option>
                {options.skillLevels.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>

              <button type="submit" className={buttonClassName('primary', 'lg', true)}>
                Salvar perfil
              </button>
            </>
          )}
        </Form>
      </Card>
    </>
  )
}
