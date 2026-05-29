import { router } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import Button from '~/components/Button'
import Card from '~/components/Card'
import ConfirmDialog from '~/components/ConfirmDialog'

type ManageAction = 'start' | 'reopen' | 'undo' | 'cancel'

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
  betsPossible: boolean
  manageWindowOpen: boolean
  manageWindowExpiresAt: string
}

const actionConfigs: Record<ManageAction, Omit<ActionConfig, 'id' | 'buttonVariant'>> = {
  start: {
    label: 'Iniciar partida (fechar palpites)',
    confirmTitle: 'Fechar palpites?',
    confirmDescription: 'Os palpites serão encerrados e a partida passará para em andamento.',
    confirmLabel: 'Iniciar partida',
    confirmVariant: 'success',
    url: '/partidas/:id/iniciar',
  },
  reopen: {
    label: 'Reabrir palpites',
    confirmTitle: 'Reabrir palpites?',
    confirmDescription: 'A partida voltará ao estado de palpites abertos.',
    confirmLabel: 'Reabrir palpites',
    confirmVariant: 'success',
    url: '/partidas/:id/reabrir-palpites',
  },
  undo: {
    label: 'Desfazer resultado',
    confirmTitle: 'Desfazer resultado?',
    confirmDescription: 'Os pontos serão removidos e a partida voltará para em andamento.',
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

function buildStartAction(status: string, betsPossible: boolean): ActionConfig | null {
  if (status !== 'palpites_abertos' || !betsPossible) return null
  return { id: 'start', buttonVariant: 'success', ...actionConfigs.start }
}

function buildWindowedActions(status: string, betsPossible: boolean): ActionConfig[] {
  const actions: ActionConfig[] = []

  if (status === 'em_andamento' && betsPossible) {
    actions.push({ id: 'reopen', buttonVariant: 'success', ...actionConfigs.reopen })
  }

  if (status === 'finalizada') {
    actions.push({ id: 'undo', buttonVariant: 'success', ...actionConfigs.undo })
  }

  if (status === 'palpites_abertos' || status === 'em_andamento' || status === 'finalizada') {
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
  betsPossible,
  manageWindowOpen,
  manageWindowExpiresAt,
}: Props) {
  const startAction = buildStartAction(status, betsPossible)
  const windowedActions = buildWindowedActions(status, betsPossible)
  const [pendingAction, setPendingAction] = useState<ActionConfig | null>(null)
  const secondsLeft = useCountdown(manageWindowExpiresAt)
  const windowOpen = manageWindowOpen && secondsLeft > 0
  const visibleWindowedActions = windowOpen ? windowedActions : []

  if (!startAction && visibleWindowedActions.length === 0) return null

  function confirmAction() {
    if (!pendingAction) return

    router.post(pendingAction.url.replace(':id', String(matchId)))
    setPendingAction(null)
  }

  return (
    <>
      <Card title="Gerenciar partida" className="mb-0">
        <p className="mb-3 text-xs text-stone-500">
          Após cada mudança de status, você tem 2 minutos para reabrir palpites, desfazer resultado
          ou cancelar. Depois desse prazo, a partida fica travada.
        </p>
        <div className="flex flex-col gap-2.5">
          {startAction && (
            <Button
              variant={startAction.buttonVariant}
              size="md"
              fullWidth
              onClick={() => setPendingAction(startAction)}
            >
              {startAction.label}
            </Button>
          )}
          {visibleWindowedActions.length > 0 && (
            <>
              <p className="text-sm text-stone-600">
                Você tem {formatCountdown(secondsLeft)} para alterar. Depois disso, estas ações somem.
              </p>
              {visibleWindowedActions.map((action) => (
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
            </>
          )}
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
