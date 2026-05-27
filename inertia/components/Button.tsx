import { buttonClassName, type ButtonSize, type ButtonVariant } from '~/lib/button_styles'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={buttonClassName(variant, size, fullWidth, className)}
      {...props}
    >
      {children}
    </button>
  )
}
