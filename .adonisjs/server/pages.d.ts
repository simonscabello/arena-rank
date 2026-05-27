import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'groups/index': ExtractProps<(typeof import('../../inertia/pages/groups/index.tsx'))['default']>
    'groups/show': ExtractProps<(typeof import('../../inertia/pages/groups/show.tsx'))['default']>
    'history/show': ExtractProps<(typeof import('../../inertia/pages/history/show.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'matches/create': ExtractProps<(typeof import('../../inertia/pages/matches/create.tsx'))['default']>
    'matches/show': ExtractProps<(typeof import('../../inertia/pages/matches/show.tsx'))['default']>
    'members/show': ExtractProps<(typeof import('../../inertia/pages/members/show.tsx'))['default']>
    'profile/show': ExtractProps<(typeof import('../../inertia/pages/profile/show.tsx'))['default']>
  }
}
