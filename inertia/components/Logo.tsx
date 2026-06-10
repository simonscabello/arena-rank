import { APP_NAME } from '~/lib/app_name'

type Props = {
  className?: string
}

export default function Logo({ className }: Props) {
  return <img src="/logo-symbol.png" alt={APP_NAME} className={className} />
}
