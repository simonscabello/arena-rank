import { cn, displayName } from '~/lib/match'
import Avatar from '~/components/Avatar'

export type Member = {
  id: number
  fullName: string | null
  email: string
  initials: string
  avatarUrl?: string | null
}

type Slot = {
  userId: number | null
  side: 1 | 2
  slotIndex: number
}

type Props = {
  members: Member[]
  slots: Slot[]
  onSelect: (slotIndex: number, userId: number) => void
}

function SlotPicker({
  label,
  slotIndex,
  members,
  selectedUserId,
  disabledIds,
  onSelect,
}: {
  label: string
  slotIndex: number
  members: Member[]
  selectedUserId: number | null
  disabledIds: Set<number>
  onSelect: (userId: number) => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-stone-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {members.map((member) => {
          const selected = selectedUserId === member.id
          const disabled = disabledIds.has(member.id) && !selected

          return (
            <button
              key={member.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(member.id)}
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
    </div>
  )
}

export default function PlayerPicker({ members, slots, onSelect }: Props) {
  const selectedIds = new Set(slots.map((s) => s.userId).filter((id): id is number => id !== null))

  const side1Slots = slots.filter((s) => s.side === 1)
  const side2Slots = slots.filter((s) => s.side === 2)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-brand-200 bg-brand-50/30 p-4">
        <h3 className="mb-4 text-sm font-bold text-brand-800">Dupla 1</h3>
        <div className="space-y-4">
          {side1Slots.map((slot, i) => (
            <SlotPicker
              key={slot.slotIndex}
              label={`Jogador ${i + 1}`}
              slotIndex={slot.slotIndex}
              members={members}
              selectedUserId={slot.userId}
              disabledIds={selectedIds}
              onSelect={(userId) => onSelect(slot.slotIndex, userId)}
            />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-4">
        <h3 className="mb-4 text-sm font-bold text-amber-900">Dupla 2</h3>
        <div className="space-y-4">
          {side2Slots.map((slot, i) => (
            <SlotPicker
              key={slot.slotIndex}
              label={`Jogador ${i + 1}`}
              slotIndex={slot.slotIndex}
              members={members}
              selectedUserId={slot.userId}
              disabledIds={selectedIds}
              onSelect={(userId) => onSelect(slot.slotIndex, userId)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
