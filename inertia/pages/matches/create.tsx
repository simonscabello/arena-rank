import { router } from '@inertiajs/react'
import { MapPin } from 'lucide-react'
import { useState } from 'react'
import BackLink from '~/components/BackLink'
import Card from '~/components/Card'
import Input from '~/components/Input'
import PageHeader from '~/components/PageHeader'
import PlayerPicker, {
  type Member,
  type PendingGuestInvite,
  type Slot,
} from '~/components/PlayerPicker'
import Select from '~/components/Select'
import { buttonClassName } from '~/lib/button_styles'

type Arena = {
  id: number
  name: string
}

type Props = {
  group: { id: number; name: string }
  memberCount: number
  members: Member[]
  pendingGuestInvites: PendingGuestInvite[]
  arenas: Arena[]
}

function createInitialSlots(): Slot[] {
  return [
    { slotIndex: 0, side: 1, userId: null, displayName: null, guestInviteId: null, guestInviteUrl: null, isDummy: false },
    { slotIndex: 1, side: 1, userId: null, displayName: null, guestInviteId: null, guestInviteUrl: null, isDummy: false },
    { slotIndex: 2, side: 2, userId: null, displayName: null, guestInviteId: null, guestInviteUrl: null, isDummy: false },
    { slotIndex: 3, side: 2, userId: null, displayName: null, guestInviteId: null, guestInviteUrl: null, isDummy: false },
  ]
}

function isSlotFilled(slot: Slot) {
  if (slot.isDummy) {
    return (slot.displayName?.trim().length ?? 0) >= 2 || slot.guestInviteId !== null
  }

  return slot.userId !== null
}

export default function MatchCreate({
  group,
  memberCount,
  members,
  pendingGuestInvites,
  arenas,
}: Props) {
  const [arenaId, setArenaId] = useState<number | ''>(arenas[0]?.id ?? '')
  const [arenaName, setArenaName] = useState('')
  const [arenaCity, setArenaCity] = useState('')
  const [useNewArena, setUseNewArena] = useState(arenas.length === 0)
  const [skipBets, setSkipBets] = useState(memberCount === 4)
  const [slots, setSlots] = useState<Slot[]>(createInitialSlots)

  function updateSlot(slotIndex: number, patch: Partial<Slot>) {
    setSlots((prev) =>
      prev.map((slot) => (slot.slotIndex === slotIndex ? { ...slot, ...patch } : slot))
    )
  }

  function submit() {
    const players = slots
      .filter(isSlotFilled)
      .map((slot) => ({
        userId: slot.isDummy ? undefined : slot.userId ?? undefined,
        displayName:
          slot.isDummy && !slot.guestInviteId ? slot.displayName?.trim() || undefined : undefined,
        guestInviteId: slot.isDummy && slot.guestInviteId ? slot.guestInviteId : undefined,
        side: slot.side,
      }))

    if (players.length !== 4) return

    router.post(`/grupos/${group.id}/partidas`, {
      arenaId: useNewArena ? undefined : Number(arenaId),
      arenaName: useNewArena ? arenaName : undefined,
      arenaCity: useNewArena && arenaCity.trim() ? arenaCity.trim() : undefined,
      players,
      skipBets,
    })
  }

  const canSubmit =
    slots.every(isSlotFilled) && (!useNewArena || arenaName.trim().length > 0)

  return (
    <>
      <PageHeader
        back={
          <BackLink route="groups.show" routeParams={{ id: group.id }} label={group.name} />
        }
        title="Nova partida"
        subtitle="Monte as duplas e escolha a arena"
      />

      <div className="space-y-6 pb-28">
        <Card title="Arena">
          {arenas.length > 0 && (
            <label className="mb-3 flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={useNewArena}
                onChange={(e) => setUseNewArena(e.target.checked)}
                className="rounded border-stone-300 text-brand-600 focus:ring-brand-500"
              />
              Cadastrar arena nova
            </label>
          )}
          {useNewArena ? (
            <div className="space-y-4">
              <Input
                label="Nome da arena"
                value={arenaName}
                onChange={(e) => setArenaName(e.target.value)}
                placeholder="Ex: Arena Sunset"
              />
              <Input
                label="Cidade (opcional)"
                value={arenaCity}
                onChange={(e) => setArenaCity(e.target.value)}
                placeholder="Ex: São Paulo"
              />
            </div>
          ) : (
            <Select
              label="Selecione a arena"
              value={arenaId}
              onChange={(e) => setArenaId(Number(e.target.value))}
            >
              {arenas.map((arena) => (
                <option key={arena.id} value={arena.id}>
                  {arena.name}
                </option>
              ))}
            </Select>
          )}
        </Card>

        <Card title="Jogadores">
          <p className="mb-4 text-sm text-stone-500">
            Use <span className="font-medium text-stone-700">Convidado</span> para quem não tem
            conta. Envie o link para cadastro — quando criar conta, o histórico será vinculado
            automaticamente.
          </p>
          <PlayerPicker
            members={members}
            pendingGuestInvites={pendingGuestInvites}
            slots={slots}
            onChange={updateSlot}
          />
        </Card>

        <Card title="Palpites">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={skipBets}
              onChange={(e) => setSkipBets(e.target.checked)}
              className="mt-1 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-stone-700">
              <span className="font-medium text-stone-900">Sem palpites (só histórico)</span>
              <span className="mt-1 block text-stone-500">
                Use quando todos da Play estão jogando ou não haverá apostas nesta partida.
                Vitórias e derrotas entram no histórico normalmente.
              </span>
            </span>
          </label>
          {memberCount === 4 && (
            <p className="mt-3 text-xs text-amber-800">
              Play com 4 pessoas: palpites desativados por padrão.
            </p>
          )}
        </Card>
      </div>

      <div className="fixed bottom-16 left-1/2 z-30 w-full max-w-lg -translate-x-1/2 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:bottom-0">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className={buttonClassName('primary', 'lg', true)}
        >
          <MapPin className="h-5 w-5" />
          Criar partida
        </button>
      </div>
    </>
  )
}
