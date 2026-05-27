import { cn } from '~/lib/match'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'dangerSoft' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:scale-[0.98] disabled:bg-stone-300 disabled:shadow-none',
  secondary:
    'border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 active:scale-[0.98] disabled:opacity-50',
  ghost: 'text-stone-600 hover:bg-stone-100 active:scale-[0.98]',
  success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] disabled:bg-stone-300 disabled:shadow-none',
  dangerSoft:
    'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 active:scale-[0.98] disabled:opacity-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm font-medium',
  lg: 'h-12 px-5 text-base font-semibold',
}

export function buttonClassName(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  fullWidth?: boolean,
  className?: string
) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-xl transition',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className
  )
}
