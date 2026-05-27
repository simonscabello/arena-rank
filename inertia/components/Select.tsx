import { cn } from '~/lib/match'

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
}

export default function Select({ label, error, id, className, children, ...props }: Props) {
  const selectId = id || label?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-stone-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
