import type { Person } from '#shared/types/api'
import type { RouteLocationRaw } from 'vue-router'

const STRIP_HTML_RE = /<[^>]*>/g
const WHITESPACE_RE = /\s+/g

/**
 * Legacy fallback when API predates `has_detail_page`.
 * @deprecated Remove after backend rollout is complete on all environments.
 */
export function legacyPersonHasDetailPage(person: Person): boolean {
  const slug = String(person.slug ?? '').trim()
  if (!slug)
    return false

  const raw = (person.shortbio ?? '')
    .replace(STRIP_HTML_RE, ' ')
    .replace(WHITESPACE_RE, ' ')
    .trim()

  return raw.length > 0
}

export function personHasDetailPage(person: Person): boolean {
  if (typeof person.has_detail_page === 'boolean')
    return person.has_detail_page

  return legacyPersonHasDetailPage(person)
}

export function getPersonDetailRoute(person: Person): RouteLocationRaw | null {
  if (!personHasDetailPage(person))
    return null

  const slug = String(person.slug ?? '').trim()
  if (!slug)
    return null

  return {
    name: 'people-slug',
    params: { slug },
  } as RouteLocationRaw
}
