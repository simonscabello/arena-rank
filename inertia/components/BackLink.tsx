import { Link } from '@adonisjs/inertia/react'
import { ChevronLeft } from 'lucide-react'

type RouteName =
  | 'home'
  | 'groups.index'
  | 'groups.show'
  | 'groups.matches.create'
  | 'matches.show'
  | 'profile.show'
  | 'history.show'
  | 'ranking.index'

type Props = {
  label: string
  href?: string
  route?: RouteName
  routeParams?: Record<string, string | number>
}

export default function BackLink({ label, href, route, routeParams }: Props) {
  const className =
    'inline-flex items-center gap-1 text-sm font-medium text-stone-500 transition hover:text-brand-600'

  if (route) {
    return (
      <Link route={route} routeParams={routeParams} className={className}>
        <ChevronLeft className="h-4 w-4" />
        {label}
      </Link>
    )
  }

  return (
    <a href={href} className={className}>
      <ChevronLeft className="h-4 w-4" />
      {label}
    </a>
  )
}
