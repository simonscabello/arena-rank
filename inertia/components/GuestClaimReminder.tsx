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
      <p className="mb-3 text-sm text-stone-700">
        Envie o link para quem ainda não tem conta. Ao entrar com Google, as partidas viram
        histórico com XP e ELO retroativos.
      </p>
      <ul className="divide-y divide-amber-100">
        {guests.map((guest) => (
          <li
            key={guest.displayName}
            className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-stone-900">{guest.displayName}</p>
              {guest.guestInviteId && (
                <Link
                  route="guest_invites.member"
                  routeParams={{ groupId, inviteId: guest.guestInviteId }}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Ver detalhes
                </Link>
              )}
            </div>
            {guest.guestInviteUrl && (
              <CopyInviteLink url={guest.guestInviteUrl} variant="compact" />
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}
