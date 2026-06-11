import { Link } from '@adonisjs/inertia/react'
import CopyInviteLink from '~/components/CopyInviteLink'
import Card from '~/components/Card'

type PendingGuest = {
  displayName: string
  guestInviteId: number | null
  guestInviteUrl: string | null
}

type Props = {
  groupId: number
  guests: PendingGuest[]
}

export default function GuestClaimReminder({ groupId, guests }: Props) {
  if (guests.length === 0) return null

  return (
    <Card title="Convidados pendentes" className="mb-6 border-amber-200 bg-amber-50/40">
      <p className="mb-4 text-sm text-stone-700">
        Envie o link para quem ainda não tem conta. Ao entrar com Google, as partidas registradas
        entram no histórico com XP e ELO retroativos.
      </p>
      <ul className="space-y-4">
        {guests.map((guest) => (
          <li key={guest.displayName} className="rounded-xl border border-amber-100 bg-white p-3">
            <p className="mb-2 font-medium text-stone-900">{guest.displayName}</p>
            {guest.guestInviteUrl && <CopyInviteLink url={guest.guestInviteUrl} />}
            {guest.guestInviteId && (
              <Link
                route="guest_invites.member"
                routeParams={{ groupId, inviteId: guest.guestInviteId }}
                className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline"
              >
                Ver detalhes do convite
              </Link>
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}
