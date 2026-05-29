import { cn, displayName, initialsFromName } from '~/lib/match'
import type { PlayerType } from '~/lib/player_type'
import Avatar from '~/components/Avatar'
import Input from '~/components/Input'

export type Member = {
  id: number
  fullName: string | null
  email: string
  initials: string
  avatarUrl?: string | null
}

export type PendingGuestInvite = {
  id: number
  displayName: string
  inviteUrl: string
}

export type Slot = {
  slotIndex: number
  side: 1 | 2
  userId: number | null
  displayName: string | null
  guestInviteId: number | null
  guestInviteUrl: string | null
  playerType: PlayerType
}

type Props = {
  members: Member[]
  pendingGuestInvites: PendingGuestInvite[]
  slots: Slot[]
  onChange: (slotIndex: number, patch: Partial<Slot>) => void
}

function PlayerTypeToggle({
  mode,
  onSelectMember,
  onSelectGuest,
}: {
  mode: 'member' | 'guest'
  onSelectMember: () => void
  onSelectGuest: () => void
}) {
  return (
    <div className="mb-3 flex rounded-lg border border-stone-200 bg-stone-50 p-0.5">
      <button
        type="button"
        onClick={onSelectMember}
        className={cn(
          'flex-1 rounded-md py-1.5 text-xs font-medium transition',
          mode === 'member' ? 'bg-white text-brand-700 shadow-sm' : 'text-stone-600'
        )}
      >
        Membro
      </button>
      <button
        type="button"
        onClick={onSelectGuest}
        className={cn(
          'flex-1 rounded-md py-1.5 text-xs font-medium transition',
          mode === 'guest' ? 'bg-white text-brand-700 shadow-sm' : 'text-stone-600'
        )}
      >
        Convidado
      </button>
    </div>
  )
}

function SlotPicker({
  label,
  slot,
  members,
  pendingGuestInvites,
  selectedUserIds,
  selectedGuestInviteIds,
  usedDisplayNames,
  onChange,
}: {
  label: string
  slot: Slot
  members: Member[]
  pendingGuestInvites: PendingGuestInvite[]
  selectedUserIds: Set<number>
  selectedGuestInviteIds: Set<number>
  usedDisplayNames: Set<string>
  onChange: (patch: Partial<Slot>) => void
}) {
  const isGuestMode = slot.playerType !== 'member'
  const selectedName = slot.displayName?.trim().toLowerCase() ?? ''
  const nameTaken =
    selectedName.length >= 2 &&
    usedDisplayNames.has(selectedName) &&
    !(
      slot.guestInviteId &&
      pendingGuestInvites
        .find((invite) => invite.id === slot.guestInviteId)
        ?.displayName.toLowerCase() === selectedName
    )

  function selectMember(userId: number | null) {
    onChange({
      playerType: 'member',
      userId,
      displayName: null,
      guestInviteId: null,
      guestInviteUrl: null,
    })
  }

  function enableGuestMode() {
    onChange({
      playerType: 'guest_name',
      userId: null,
      displayName: slot.displayName ?? '',
      guestInviteId: null,
      guestInviteUrl: null,
    })
  }

  function selectPendingInvite(invite: PendingGuestInvite) {
    onChange({
      playerType: 'guest_invite',
      userId: null,
      displayName: invite.displayName,
      guestInviteId: invite.id,
      guestInviteUrl: invite.inviteUrl,
    })
  }

  const initials = slot.displayName ? initialsFromName(slot.displayName) : '?'

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-stone-500">{label}</p>

      <PlayerTypeToggle
        mode={isGuestMode ? 'guest' : 'member'}
        onSelectMember={() => selectMember(slot.userId)}
        onSelectGuest={enableGuestMode}
      />

      {!isGuestMode && (
        <div className="flex flex-wrap gap-2">
          {members.map((member) => {
            const selected = slot.userId === member.id
            const disabled = selectedUserIds.has(member.id) && !selected

            return (
              <button
                key={member.id}
                type="button"
                disabled={disabled}
                onClick={() => selectMember(selected ? null : member.id)}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition active:scale-[0.98]',
                  selected
                    ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-brand-300',
                  disabled && 'cursor-not-allowed opacity-40'
                )}
              >
                <Avatar
                  initials={member.initials}
                  src={member.avatarUrl}
                  size="sm"
                  className={selected ? 'bg-brand-700' : ''}
                />
                {displayName(member)}
              </button>
            )
          })}
        </div>
      )}

      {isGuestMode && (
        <>
          <p className="mb-3 text-xs text-stone-500">
            Nome avulso registra sem conta. Convite pendente reutiliza alguém já convidado antes.
          </p>

          {slot.playerType === 'guest_invite' && slot.guestInviteId ? (
            <div className="mb-3 rounded-xl border border-brand-200 bg-brand-50/40 px-3 py-2">
              <p className="text-sm font-medium text-stone-800">{slot.displayName}</p>
              <p className="text-xs text-stone-500">Convite pendente reutilizado</p>
            </div>
          ) : (
            <Input
              label="Nome do convidado"
              value={slot.displayName ?? ''}
              onChange={(event) =>
                onChange({
                  displayName: event.target.value,
                  guestInviteId: null,
                  guestInviteUrl: null,
                  playerType: 'guest_name',
                })
              }
              placeholder="Ex: João convidado"
              error={nameTaken ? 'Nome já usado nesta partida' : undefined}
            />
          )}

          {pendingGuestInvites.length > 0 && !slot.guestInviteId && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-stone-500">Convites pendentes</p>
              <div className="flex flex-wrap gap-2">
                {pendingGuestInvites.map((invite) => {
                  const disabled =
                    selectedGuestInviteIds.has(invite.id) && slot.guestInviteId !== invite.id

                  return (
                    <button
                      key={invite.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectPendingInvite(invite)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                        slot.guestInviteId === invite.id
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-brand-300',
                        disabled && 'cursor-not-allowed opacity-40'
                      )}
                    >
                      {invite.displayName}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {slot.displayName && slot.displayName.trim().length >= 2 && (
            <div className="mt-3 flex items-center gap-2">
              <Avatar initials={initials} size="sm" />
              <span className="text-sm font-medium text-stone-800">{slot.displayName.trim()}</span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                Convidado
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function PlayerPicker({ members, pendingGuestInvites, slots, onChange }: Props) {
  const selectedUserIds = new Set(
    slots.map((slot) => slot.userId).filter((id): id is number => id !== null)
  )
  const selectedGuestInviteIds = new Set(
    slots.map((slot) => slot.guestInviteId).filter((id): id is number => id !== null)
  )
  const usedDisplayNames = new Set(
    slots
      .filter((slot) => slot.playerType !== 'member' && slot.displayName)
      .map((slot) => slot.displayName!.trim().toLowerCase())
  )

  const side1Slots = slots.filter((slot) => slot.side === 1)
  const side2Slots = slots.filter((slot) => slot.side === 2)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-brand-200 bg-brand-50/30 p-4">
        <h3 className="mb-4 text-sm font-bold text-brand-800">Dupla 1</h3>
        <div className="space-y-4">
          {side1Slots.map((slot, index) => (
            <SlotPicker
              key={slot.slotIndex}
              label={`Jogador ${index + 1}`}
              slot={slot}
              members={members}
              pendingGuestInvites={pendingGuestInvites}
              selectedUserIds={selectedUserIds}
              selectedGuestInviteIds={selectedGuestInviteIds}
              usedDisplayNames={usedDisplayNames}
              onChange={(patch) => onChange(slot.slotIndex, patch)}
            />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-4">
        <h3 className="mb-4 text-sm font-bold text-amber-900">Dupla 2</h3>
        <div className="space-y-4">
          {side2Slots.map((slot, index) => (
            <SlotPicker
              key={slot.slotIndex}
              label={`Jogador ${index + 1}`}
              slot={slot}
              members={members}
              pendingGuestInvites={pendingGuestInvites}
              selectedUserIds={selectedUserIds}
              selectedGuestInviteIds={selectedGuestInviteIds}
              usedDisplayNames={usedDisplayNames}
              onChange={(patch) => onChange(slot.slotIndex, patch)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
