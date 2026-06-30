import type { Person } from '../types/api'

const LEADING_SLASH_RE = /^\//

type LocalizedLabel = { en?: string | null, it?: string | null } | null | undefined

export function normalizeLabel(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

export function buildRoleAliasSet(values: string[]): Set<string> {
  return new Set(values.map(normalizeLabel).filter(Boolean))
}

export function roleMatches(label: string, accepted: Set<string>, synonyms: Record<string, string[]>): boolean {
  const normalized = normalizeLabel(label)
  if (!normalized)
    return false
  if (accepted.has(normalized))
    return true
  return Object.entries(synonyms).some(([target, aliasList]) => {
    if (!accepted.has(normalizeLabel(target)))
      return false
    return aliasList.map(normalizeLabel).includes(normalized)
  })
}

export function localizedGroupLabel(
  label: string | null | undefined,
  translations: LocalizedLabel,
  locale: string,
): string {
  const byLocale = locale === 'it' ? translations?.it : translations?.en
  const fromLocale = (byLocale ?? '').trim()
  if (fromLocale.length)
    return fromLocale
  const fromBase = (label ?? '').trim()
  if (fromBase.length)
    return fromBase
  const alt = (locale === 'it' ? translations?.en : translations?.it) ?? ''
  return alt.trim()
}

export function sortPeopleByName(list: Person[]): Person[] {
  return [...list].sort((a, b) => {
    const byLast = (a.last_name ?? '').localeCompare(b.last_name ?? '', undefined, { sensitivity: 'base' })
    if (byLast !== 0)
      return byLast
    return (a.first_name ?? '').localeCompare(b.first_name ?? '', undefined, { sensitivity: 'base' })
  })
}

export function personHasBio(person: Person): boolean {
  return Boolean((person.shortbio ?? '').trim())
}

/** URL thumb per `UiAvatar` da `person.media.image` (path API o fallback url). */
export function personAvatarUrl(person: Person): string | undefined {
  const img = person.media?.image
  if (!img)
    return undefined
  const path = img.path?.replace(LEADING_SLASH_RE, '') ?? ''
  if (path)
    return `/api/image/${path}?w=200&h=200&fit=crop`
  return img.url || undefined
}

export function personRoleLabel(person: Person, locale: string): string {
  const tr = person.translations
  const r = tr?.role
  if (r) {
    const s = locale === 'it' ? r.it : r.en
    if (s?.trim())
      return s.trim()
  }
  return (person.role ?? '').trim()
}

export function normalizeYoutubeEmbedUrl(raw: string | null | undefined): string | null {
  const value = (raw ?? '').trim()
  if (!value)
    return null

  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()

    if (host.includes('youtu.be')) {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (host.includes('youtube.com')) {
      if (url.pathname.startsWith('/embed/')) {
        const id = url.pathname.split('/').filter(Boolean)[1]
        return id ? `https://www.youtube.com/embed/${id}` : null
      }

      /** Stream live: https://www.youtube.com/live/VIDEO_ID */
      if (url.pathname.startsWith('/live/')) {
        const id = url.pathname.split('/').filter(Boolean)[1]
        return id ? `https://www.youtube.com/embed/${id}` : null
      }

      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v')
        return id ? `https://www.youtube.com/embed/${id}` : null
      }
    }
  }
  catch {
    return null
  }

  return null
}

/**
 * URL pagina canale / profilo YouTube (non embeddabile come singolo video).
 * Esempi: /@handle, /channel/UC…, /c/…, /user/…
 */
export function normalizeYoutubeChannelPageUrl(raw: string | null | undefined): string | null {
  const value = (raw ?? '').trim()
  if (!value)
    return null

  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    if (!host.includes('youtube.com'))
      return null

    const parts = url.pathname.split('/').filter(Boolean)
    if (!parts.length)
      return null

    if (parts[0].startsWith('@'))
      return `https://www.youtube.com/${parts[0]}`

    if (parts[0] === 'channel' && parts[1])
      return `https://www.youtube.com/channel/${parts[1]}`

    if (parts[0] === 'c' && parts[1])
      return `https://www.youtube.com/c/${parts[1]}`

    if (parts[0] === 'user' && parts[1])
      return `https://www.youtube.com/user/${parts[1]}`
  }
  catch {
    return null
  }

  return null
}
