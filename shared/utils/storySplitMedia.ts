import type { TStorySplitMediaType } from '#shared/types/api'
import { STORY_SPLIT_MEDIA_TYPES } from '#shared/types/api'

const STORY_SPLIT_MEDIA_TYPE_SET = new Set<string>(STORY_SPLIT_MEDIA_TYPES)

function readMediaTypeValue(
  value: unknown,
): TStorySplitMediaType | '' | null | undefined {
  if (value == null)
    return undefined
  const normalized = String(value).trim()
  if (!normalized)
    return null
  if (STORY_SPLIT_MEDIA_TYPE_SET.has(normalized))
    return normalized as TStorySplitMediaType
  return undefined
}

function readImageRecord(
  source: Record<string, unknown>,
): Record<string, unknown> | null {
  const image = source.Image ?? source.image
  if (!image || typeof image !== 'object')
    return null
  return image as Record<string, unknown>
}

/** Legge `MediaType` da sezione o `Image`, accettando PascalCase e camelCase. */
export function readStorySplitMediaType(
  source: Record<string, unknown> | null | undefined,
): TStorySplitMediaType | '' | null | undefined {
  if (!source)
    return undefined

  const fromSection = readMediaTypeValue(source.MediaType ?? source.mediaType)
  if (fromSection)
    return fromSection

  const image = readImageRecord(source)
  if (!image)
    return undefined

  return readMediaTypeValue(image.MediaType ?? image.mediaType)
}

export function isStorySplitVideoMediaType(
  mediaType: TStorySplitMediaType | '' | null | undefined,
): boolean {
  if (mediaType == null)
    return false
  const normalized = String(mediaType).trim().toLowerCase()
  return normalized === 'video'
}
