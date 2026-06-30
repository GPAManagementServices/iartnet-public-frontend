import type { H3Event } from 'h3'
import type { CulturalHeritageItem } from './culturalHeritages'

const TRAILING_SLASH_RE = /\/$/

interface CmsHomepageHighlightsResponse {
  data?: CmsHomepageHighlightItem[]
}

interface CmsHomepageHighlightItem {
  id?: string | number
  title?: CulturalHeritageItem['title']
  description?: string | null
  link?: string | null
  media?: {
    path?: string | null
    url?: string | null
  } | null
  cover_iiif_identifier?: string | null
}

const IIIF_THUMBNAIL_PARAMETERS = 'square/500,500/0/default.jpg'

type CmsFetcher<T> = (request: string, options?: { query?: { locale: 'en' | 'it' } }) => Promise<T>

function coverImage(item: CmsHomepageHighlightItem, baseIIIFUrl: string): string {
  const mediaPath = item.media?.path?.trim()
  if (mediaPath)
    return `/api/image/${mediaPath}?w=500&h=500&fit=crop`

  const identifier = item.cover_iiif_identifier?.trim()
  if (identifier)
    return `${baseIIIFUrl}/iiif/2/${identifier}/${IIIF_THUMBNAIL_PARAMETERS}`

  return item.media?.url?.trim() ?? ''
}

function logHighlightDiagnostics(response: CmsHomepageHighlightsResponse, items: CulturalHeritageItem[], baseIIIFUrl: string): void {
  if (!import.meta.dev)
    return

  console.log('[HomepageHighlights] API count=%d', response.data?.length ?? 0)
  console.log('[HomepageHighlights] normalized count=%d', items.length)
  console.log('[HomepageHighlights] image coverage', (response.data ?? []).map((item, index) => ({
    index,
    id: item.id ?? item.digital_object_slug ?? null,
    status: 'published',
    hasImageUrl: Boolean(coverImage(item, baseIIIFUrl)),
  })))
}

export function buildHomepageHighlightItemsFromCms(
  response: CmsHomepageHighlightsResponse,
  baseIIIFUrl: string,
): CulturalHeritageItem[] {
  const items = (response.data ?? [])
    .map(item => ({
      id: String(item.id ?? ''),
      title: item.title ?? '',
      description: item.description ?? undefined,
      coverImage: coverImage(item, baseIIIFUrl),
      tags: null,
      link: item.link ?? '',
      type: 'featured' as const,
      published: true,
    }))
    .filter(item => item.id !== '' && item.link !== '')

  logHighlightDiagnostics(response, items, baseIIIFUrl)

  return items
}

export async function fetchHomepageHighlightItems(
  locale: 'en' | 'it',
  baseIIIFUrl: string,
  fetcher?: CmsFetcher<CmsHomepageHighlightsResponse>,
): Promise<CulturalHeritageItem[]> {
  const cmsFetch = fetcher ?? (await import('./apiFetch')).api<CmsHomepageHighlightsResponse>

  try {
    const response = await cmsFetch('/v1/homepage/highlights', {
      query: { locale },
    })

    return buildHomepageHighlightItemsFromCms(response, baseIIIFUrl)
  }
  catch (error) {
    console.error('[HomepageHighlightsRead] Unexpected error:', error)
    return []
  }
}

export async function getHomepageHighlightItems(event: H3Event, locale: 'en' | 'it'): Promise<CulturalHeritageItem[]> {
  const config = useRuntimeConfig(event)
  const baseIIIFUrl = String(config.public.baseIIIFUrl || '').replace(TRAILING_SLASH_RE, '')

  return fetchHomepageHighlightItems(locale, baseIIIFUrl)
}
