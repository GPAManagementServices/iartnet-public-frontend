export interface CmsMediaLike {
  path?: string | null
  url?: string | null
}

const LEADING_SLASHES = /^\/+/
const CMS_MEDIA_PATH_RE = /^media\/[\w.\-/]+$/
const IIIF_INFO_JSON_RE = /\/info\.json(?:\?|$)/i
const IIIF_RENDERED_RE = /\/full\/[^/]+\/0\/default\.(?:jpg|jpeg|png|webp)(?:\?|$)/i
const IIIF_PATH_RE = /\/iiif\//i

function isAbsoluteHttpUrl(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://')
}

function isIiifUrl(value: string): boolean {
  if (IIIF_INFO_JSON_RE.test(value) || IIIF_RENDERED_RE.test(value))
    return true
  return IIIF_PATH_RE.test(value)
}

function pathFromCmsPublicPathname(pathname: string): string | undefined {
  const clean = pathname.trim().replace(LEADING_SLASHES, '')
  let mediaPath: string | undefined

  if (clean.startsWith('storage/media/'))
    mediaPath = clean.slice('storage/'.length)
  else if (clean.startsWith('curator/media/'))
    mediaPath = clean.slice('curator/'.length)

  if (!mediaPath)
    return undefined

  return CMS_MEDIA_PATH_RE.test(mediaPath) ? mediaPath : undefined
}

/**
 * Normalizza stringhe path/url CMS verso il formato Curator `media/...`.
 * Non gestisce IIIF né URL esterni generici.
 */
export function normalizeCmsMediaPath(input?: string | null): string | undefined {
  const raw = (input ?? '').trim()
  if (!raw)
    return undefined

  if (isIiifUrl(raw))
    return undefined

  if (isAbsoluteHttpUrl(raw)) {
    try {
      return pathFromCmsPublicPathname(new URL(raw).pathname)
    }
    catch {
      return undefined
    }
  }

  let clean = raw.replace(LEADING_SLASHES, '')
  if (clean.startsWith('storage/media/'))
    clean = clean.slice('storage/'.length)
  else if (clean.startsWith('curator/media/'))
    clean = clean.slice('curator/'.length)

  if (!CMS_MEDIA_PATH_RE.test(clean))
    return undefined

  return clean
}

/** Preferisce `media.path`; fallback su `media.url` solo se normalizzabile a `media/...`. */
export function getCmsMediaPath(media?: CmsMediaLike | null): string | undefined {
  if (!media)
    return undefined

  const fromPath = normalizeCmsMediaPath(media.path)
  if (fromPath)
    return fromPath

  return normalizeCmsMediaPath(media.url)
}
