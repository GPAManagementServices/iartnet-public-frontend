import { normalizeYoutubeEmbedUrl } from '#shared/utils/detailPage'
import { existsField, fieldIsArray } from './recordFieldUtils'

/** Chiave `record_fields` usata per URL/ID video (allineato a SearchItem / GetDataUtils). */
export const DIGITAL_RESOURCES_FIELD = 'digital_resources'

/**
 * Primo valore non vuoto di `record_fields.digital_resources` (senza capitalizzazione / join),
 * adatto a URL Vimeo.
 */
export function getFirstDigitalResourceValue(record: Record<string, unknown>): string {
  if (!existsField(record, 'record_fields'))
    return ''
  const rf = record.record_fields as Record<string, unknown>
  if (!existsField(rf, DIGITAL_RESOURCES_FIELD) || !fieldIsArray(rf, DIGITAL_RESOURCES_FIELD))
    return ''
  const arr = rf[DIGITAL_RESOURCES_FIELD] as Array<{ value?: string }>
  for (const item of arr) {
    const v = typeof item?.value === 'string' ? item.value.trim() : ''
    if (v.length > 0)
      return v
  }
  return ''
}

const VIMEO_ID_IN_PLAYER_PATH = /player\.vimeo\.com\/video\/(\d+)/i
const VIMEO_ID_IN_VIMEO_PATH = /vimeo\.com\/(?:channels\/[^/]+\/|groups\/[^/]+\/videos\/|album\/\d+\/video\/|video\/)?(\d+)/i
const DIGITS_ONLY = /^\d+$/
const VIMEO_HOST = /vimeo\.com|player\.vimeo\.com/i

function extractVimeoId(raw: string): string | null {
  const t = raw.trim()
  if (DIGITS_ONLY.test(t))
    return t
  let m = t.match(VIMEO_ID_IN_PLAYER_PATH)
  if (m?.[1])
    return m[1]
  m = t.match(VIMEO_ID_IN_VIMEO_PATH)
  if (m?.[1])
    return m[1]
  return null
}

export type VimeoEmbedSource = { videoId: string } | { videoUrl: string }

/** URL pagina Vimeo da passare all’API oEmbed (`url` query). */
export function vimeoOEmbedRequestUrl(embed: VimeoEmbedSource): string {
  if ('videoId' in embed && embed.videoId.trim())
    return `https://vimeo.com/${embed.videoId.trim()}`
  const raw = ('videoUrl' in embed ? embed.videoUrl : '').trim()
  if (!raw)
    return ''
  if (raw.startsWith('http://') || raw.startsWith('https://'))
    return raw
  return `https://${raw}`
}

/**
 * Interpreta il contenuto di `digital_resources` per `@vimeo/player` / vue-vimeo-player.
 * Preferisce `videoId` se ricavabile; altrimenti `videoUrl` se sembra un link Vimeo.
 */
export function parseVimeoDigitalResource(raw: string): VimeoEmbedSource | null {
  const t = raw.trim()
  if (!t)
    return null
  const id = extractVimeoId(t)
  if (id)
    return { videoId: id }
  if (VIMEO_HOST.test(t))
    return { videoUrl: t }
  return null
}

function recordHasIiifTiles(record: Record<string, unknown>): boolean {
  const media = (record.media as Array<{ iiif_image_api?: string }> | undefined) ?? []
  return media.some(m => Boolean(m.iiif_image_api?.trim?.()))
}

/** True se il record non ha tile IIIF ma ha risorsa digitale interpretabile come Vimeo. */
export function getJsonRecordVimeoSource(record: Record<string, unknown>): VimeoEmbedSource | null {
  if (recordHasIiifTiles(record))
    return null
  const raw = getFirstDigitalResourceValue(record)
  if (!raw)
    return null
  return parseVimeoDigitalResource(raw)
}

/** URL embed YouTube se il record non ha tile IIIF e `digital_resources` è un link YouTube. */
export function getJsonRecordYoutubeEmbedUrl(record: Record<string, unknown>): string | null {
  if (recordHasIiifTiles(record))
    return null
  const raw = getFirstDigitalResourceValue(record)
  if (!raw)
    return null
  return normalizeYoutubeEmbedUrl(raw)
}

/** Thumbnail standard YouTube da URL embed (`…/embed/VIDEO_ID`). */
export function youtubeThumbnailUrlFromEmbedUrl(embedUrl: string | null | undefined): string | null {
  const m = (embedUrl ?? '').match(/youtube\.com\/embed\/([^/?&]+)/i)
  return m?.[1] ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null
}
