import env from '#start/env'

export function appBaseUrl() {
  return env.get('APP_URL').replace(/\/$/, '')
}
