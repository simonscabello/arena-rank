import { router } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import Button from '~/components/Button'
import Card from '~/components/Card'
import ConfirmDialog from '~/components/ConfirmDialog'

type ManageAction = 'undo' | 'cancel'

type ActionConfig = {
  id: ManageAction
  label: string
  buttonVariant: 'success' | 'dangerSoft'
  confirmTitle: string
  confirmDescription: string
  confirmLabel: string
  confirmVariant: 'success' | 'danger'
  url: string
}

type Props = {
  matchId: number
  status: string
  manageWindowOpen: boolean
  manageWindowExpiresAt: string
  isOrganizerOverride: boolean
}

const actionConfigs: Record<ManageAction, Omit<ActionConfig, 'id' | 'buttonVariant'>> = {
  undo: {
    label: 'Desfazer resultado',
    confirmTitle: 'Desfazer resultado?',
    confirmDescription:
      'XP e ELO serão revertidos e a partida voltará para em andamento.',
    confirmLabel: 'Desfazer resultado',
    confirmVariant: 'success',
    url: '/partidas/:id/desfazer-resultado',
  },
  cancel: {
    label: 'Cancelar partida',
    confirmTitle: 'Cancelar partida?',
    confirmDescription: 'Ela sumirá da Play e não contará no ranking nem no histórico.',
    confirmLabel: 'Cancelar partida',
    confirmVariant: 'danger',
    url: '/partidas/:id/cancelar',
  },
}

function buildWindowedActions(status: string): ActionConfig[] {
  const actions: ActionConfig[] = []

  if (status === 'finalizada') {
    actions.push({ id: 'undo', buttonVariant: 'success', ...actionConfigs.undo })
  }

  if (status === 'em_andamento' || status === 'finalizada') {
    actions.push({ id: 'cancel', buttonVariant: 'dangerSoft', ...actionConfigs.cancel })
  }

  return actions
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function useCountdown(expiresAt: string) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000))
  )

  useEffect(() => {
    function tick() {
      setSecondsLeft(Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000)))
    }

    tick()
    const intervalId = window.setInterval(tick, 1000)
    return () => window.clearInterval(intervalId)
  }, [expiresAt])

  return secondsLeft
}

export default function MatchManageCard({
  matchId,
  status,
  manageWindowOpen,
  manageWindowExpiresAt,
  isOrganizerOverride,
}: Props) {
  const windowedActions = buildWindowedActions(status)
  const [pendingAction, setPendingAction] = useState<ActionConfig | null>(null)
  const secondsLeft = useCountdown(manageWindowExpiresAt)
  const windowOpen = manageWindowOpen && secondsLeft > 0
  const visibleActions = isOrganizerOverride ? windowedActions : windowOpen ? windowedActions : []

  if (visibleActions.length === 0) return null

  function confirmAction() {
    if (!pendingAction) return

    router.post(pendingAction.url.replace(':id', String(matchId)))
    setPendingAction(null)
  }

  return (
    <>
      <Card title="Gerenciar partida" className="mb-0">
        {isOrganizerOverride ? (
          <p className="mb-3 text-xs text-stone-500">
            Como organizador, você pode corrigir esta partida a qualquer momento.
          </p>
        ) : (
          <p className="mb-3 text-xs text-stone-500">
            Após cada mudança de status, você tem 2 minutos para desfazer resultado ou cancelar.
            Depois desse prazo, a partida fica travada.
          </p>
        )}
        <div className="flex flex-col gap-2.5">
          {!isOrganizerOverride && (
            <p className="text-sm text-stone-600">
              Você tem {formatCountdown(secondsLeft)} para alterar. Depois disso, estas ações somem.
            </p>
          )}
          {visibleActions.map((action) => (
            <Button
              key={action.id}
              variant={action.buttonVariant}
              size="md"
              fullWidth
              onClick={() => setPendingAction(action)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </Card>

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction?.confirmTitle ?? ''}
        description={pendingAction?.confirmDescription ?? ''}
        confirmLabel={pendingAction?.confirmLabel ?? ''}
        confirmVariant={pendingAction?.confirmVariant ?? 'success'}
        onConfirm={confirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </>
  )
}
