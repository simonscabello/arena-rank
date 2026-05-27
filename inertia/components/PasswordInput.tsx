import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '~/lib/match'

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
  error?: string
}

export default function PasswordInput({ label, error, id, className, ...props }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className={cn(
            'h-11 w-full rounded-xl border border-stone-200 bg-white px-3 pr-10 text-stone-900 shadow-sm transition placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-700"
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
