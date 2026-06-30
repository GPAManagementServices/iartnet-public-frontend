import { getPublishedRecordMedia } from './recordMedia'

const IIIF_RENDERED_SUFFIX = /\/full\/[^/]+\/0\/default\.(?:jpg|jpeg|png|webp)$/i
const INFO_JSON_SUFFIX = /\/info\.json(?:\?|$)/i

function isAbsoluteHttpsUrl(value: string): boolean {
  return value.trim().startsWith('https://')
}

function isSafeRepresentativeImageUrl(url: string): boolean {
  if (!isAbsoluteHttpsUrl(url))
    return false
  if (INFO_JSON_SUFFIX.test(url))
    return false
  if (!IIIF_RENDERED_SUFFIX.test(url))
    return false
  return true
}

/**
 * Prima immagine rappresentativa SEO: solo `media.url` published, URL IIIF finale HTTPS.
 * Non usa `iiif_image_api`, non rigenera varianti IIIF.
 */
export function pickOsdRepresentativeImageUrl(
  recordJson: Record<string, unknown>,
): string | undefined {
  for (const item of getPublishedRecordMedia(recordJson)) {
    const url = String(item.url ?? '').trim()
    if (url && isSafeRepresentativeImageUrl(url))
      return url
  }
  return undefined
}
