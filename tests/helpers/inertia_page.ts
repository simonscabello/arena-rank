import { decode } from 'html-entities'

export function inertiaPropsFromHtml<T = Record<string, unknown>>(html: string) {
  const matched = html.match(/data-page="([^"]*)"/)
  if (!matched) {
    throw new Error('Inertia data-page not found in response')
  }

  return JSON.parse(decode(matched[1])).props as T
}
