import { cn } from '~/lib/match'

type Props = {
  className?: string
}

export default function EloRankingHint({ className }: Props) {
  return (
    <p className={cn('text-xs text-stone-500', className)}>
      O ELO é global — vale em todas as Plays. A posição aqui usa o mesmo ELO de cada jogador.
    </p>
  )
}
