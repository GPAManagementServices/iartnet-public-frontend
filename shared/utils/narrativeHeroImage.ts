import { IiifImageSize, iiifImageUrl } from './iiif'

const LEADING_SLASHES = /^\/+/

export interface NarrativeCardMediaItem {
  url?: string
  iiif_image_api?: string
}

export function isAbsoluteHttpUrl(s: string): boolean {
  const t = s.trim()
  return t.startsWith('http://') || t.startsWith('https://')
}

/**
 * Path Curator (es. `media/...`, `/storage/...`): va tramite `/api/image/...`.
 * Id card compatto (es. UUID senza slash) è escluso.
 */
export function isCuratorStoragePathLike(raw: string): boolean {
  const t = raw.trim()
  if (!t || isAbsoluteHttpUrl(t))
    return false
  return t.startsWith('/') || t.includes('/')
}

export function toCuratorImageProxyUrl(storagePath: string): string {
  const p = storagePath.trim().replace(LEADING_SLASHES, '')
  return `/api/image/${p}?w=1600&h=840&fit=cover`
}

/** Prima immagine raster da `record_json.media`, altrimenti derivata da IIIF Image API 3.x. */
export function firstMediaHeroUrl(
  media: NarrativeCardMediaItem[] | undefined,
  size: IiifImageSize = IiifImageSize.Max,
): string | null {
  const m = media?.[0]
  if (!m)
    return null
  if (m.url)
    return iiifImageUrl(m.url, size)
  if (m.iiif_image_api) {
    return iiifImageUrl(m.iiif_image_api, size)
  }
  return null
}
