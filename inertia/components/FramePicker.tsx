import { Form } from '@adonisjs/inertia/react'
import Avatar from '~/components/Avatar'
import { buttonClassName } from '~/lib/button_styles'
import { cn } from '~/lib/match'

type Frame = {
  id: number
  name: string
  description: string
  unlockLevel: number
  frameSrc: string | null
  inset: number
  equipped: boolean
}

type Props = {
  frames: Frame[]
  initials: string
  avatarUrl: string | null
}

export default function FramePicker({ frames, initials, avatarUrl }: Props) {
  if (frames.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Jogue partidas e suba de nível para desbloquear molduras de avatar.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {frames.map((frame) => (
        <div
          key={frame.id}
          className={cn(
            'rounded-xl border p-3',
            frame.equipped ? 'border-brand-300 bg-brand-50/40' : 'border-stone-200 bg-white'
          )}
        >
          <div className="mb-3 flex justify-center">
            <Avatar
              initials={initials}
              src={avatarUrl}
              size="lg"
              frameSrc={frame.frameSrc}
              photoInset={frame.inset}
            />
          </div>
          <p className="text-center text-sm font-medium text-stone-800">{frame.name}</p>
          <p className="mt-1 text-center text-xs text-stone-500">Nível {frame.unlockLevel}</p>
          <div className="mt-3">
            {frame.equipped ? (
              <Form route="profile.unequip">
                <input type="hidden" name="avatarFrameId" value={frame.id} />
                <button type="submit" className={buttonClassName('secondary', 'sm', true)}>
                  Desequipar
                </button>
              </Form>
            ) : (
              <Form route="profile.equip">
                <input type="hidden" name="avatarFrameId" value={frame.id} />
                <button type="submit" className={buttonClassName('primary', 'sm', true)}>
                  Equipar
                </button>
              </Form>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
