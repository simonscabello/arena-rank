import AvatarPreviewModal from '~/components/AvatarPreviewModal'

type Props = {
  open: boolean
  name: string
  frameSrc: string
  photoInset: number
  avatarUrl: string | null
  initials: string
  onClose: () => void
}

export default function ShopFramePreviewModal({
  open,
  name,
  frameSrc,
  photoInset,
  avatarUrl,
  initials,
  onClose,
}: Props) {
  return (
    <AvatarPreviewModal
      open={open}
      onClose={onClose}
      initials={initials}
      src={avatarUrl}
      frameSrc={frameSrc}
      photoInset={photoInset}
      title={`Prévia: ${name}`}
      subtitle="Assim aparece no ranking e no seu perfil"
      avatarSize="preview"
    />
  )
}
