type Props = {
  current: number
  needed: number
  level: number
  xpToNextLevel: number
}

export default function XpBar({ current, needed, level, xpToNextLevel }: Props) {
  const percent = needed > 0 ? Math.min(100, Math.round((current / needed) * 100)) : 100

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-semibold text-stone-800">Nível {level}</span>
        <span className="text-stone-500">
          {xpToNextLevel > 0 ? `${xpToNextLevel} XP para o próximo nível` : 'Nível máximo atingido'}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-stone-500">
        {current}/{needed} XP neste nível
      </p>
    </div>
  )
}
