import { cn } from '~/lib/match'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export default function Input({ label, error, id, className, ...props }: Props) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-stone-900 shadow-sm transition placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
