import { configApp } from '@adonisjs/eslint-config'

export default configApp(
  {
    ignores: ['database/schema.ts'],
  },
  {
    name: 'Shared constants in frontend',
    files: ['inertia/**/*.{ts,tsx}'],
    rules: {
      '@adonisjs/no-backend-import-in-frontend': [
        'error',
        {
          allowed: ['#constants/share_taglines', '../../app/constants/share_taglines.ts'],
        },
      ],
    },
  }
)
