import BackLink from '~/components/BackLink'
import Avatar from '~/components/Avatar'
import Card from '~/components/Card'
import CopyInviteLink from '~/components/CopyInviteLink'
import PageHeader from '~/components/PageHeader'

type Props = {
  group: { id: number; name: string }
  guest: {
    displayName: string
    initials: string
    inviteUrl: string
  }
}

export default function GuestInviteMember({ group, guest }: Props) {
  return (
    <>
      <PageHeader
        back={<BackLink route="groups.show" routeParams={{ id: group.id }} label={group.name} />}
        title={guest.displayName}
        subtitle={
          <span className="block space-y-1">
            <span className="block text-sm text-amber-700">Convidado · Aguardando cadastro</span>
            <span className="block text-xs text-stone-500">
              Envie o link para a pessoa criar conta. Partidas já registradas entram no histórico com
              XP e ELO retroativos.
            </span>
          </span>
        }
      />

      <div className="mb-6 flex items-start gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <Avatar initials={guest.initials} size="2xl" />
        <div className="min-w-0 flex-1 pt-1 text-sm text-stone-600">
          <p>
            Este jogador ainda não tem conta. Envie o link — ao entrar com Google, as partidas já
            registradas vinculam ao perfil com XP e ELO retroativos.
          </p>
        </div>
      </div>

      <Card title="Link de convite">
        <CopyInviteLink url={guest.inviteUrl} />
      </Card>
    </>
  )
}
