type Props = {
  className?: string
}

export default function Logo({ className }: Props) {
  return <img src="/logo-symbol.png" alt="Palpiteiro" className={className} />
}
