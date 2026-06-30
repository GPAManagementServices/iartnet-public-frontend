import type { HeaderPatchManifestRow } from '~/utils/headerPatchManifest'

export interface CmsHeroCarouselResponse {
  data?: CmsHeroCarouselItem[]
}

type CmsFetcher<T> = (request: string) => Promise<T>

interface CmsHeroCarouselItem {
  id?: string | number
  title?: string | null
  slug?: string | null
  digital_object_slug?: string | null
  media?: {
    path?: string | null
    url?: string | null
  } | null
}

function imageUrlFromCmsMedia(media: CmsHeroCarouselItem['media']): string {
  const path = media?.path?.trim()
  if (path)
    return `/api/image/${path}`

  return media?.url?.trim() ?? ''
}

function digitalObjectSlug(item: CmsHeroCarouselItem): string {
  const slug = item.slug?.trim()
  if (slug)
    return slug

  const digitalObjectSlug = item.digital_object_slug?.trim()
  return digitalObjectSlug ? `/digital-object/${encodeURIComponent(digitalObjectSlug)}` : ''
}

function logHeroDiagnostics(response: CmsHeroCarouselResponse, items: HeaderPatchManifestRow[]): void {
  if (!import.meta.dev)
    return

  console.log('[HomepageHero] API count=%d', response.data?.length ?? 0)
  console.log('[HomepageHero] normalized count=%d', items.length)
  console.log('[HomepageHero] image coverage', (response.data ?? []).map((item, index) => ({
    index,
    id: item.id ?? item.digital_object_slug ?? null,
    status: 'published',
    hasImageUrl: Boolean(imageUrlFromCmsMedia(item.media)),
  })))
}

export function buildPatchListPayloadFromCms(response: CmsHeroCarouselResponse): HeaderPatchManifestRow[] {
  const items = (response.data ?? [])
    .map(item => ({
      title: item.title?.trim() ?? '',
      slug: digitalObjectSlug(item),
      type: '',
      year: '',
      subject: '',
      location: '',
      cover: imageUrlFromCmsMedia(item.media),
      coverLocal: '',
    }))
    .filter(item => item.title !== '' && item.slug !== '')

  logHeroDiagnostics(response, items)

  return items
}

export async function fetchHeroCarouselPatchPayload(
  fetcher?: CmsFetcher<CmsHeroCarouselResponse>,
): Promise<HeaderPatchManifestRow[]> {
  const cmsFetch = fetcher ?? (await import('./apiFetch')).api<CmsHeroCarouselResponse>
  const response = await cmsFetch('/v1/homepage/hero-carousel')
  return buildPatchListPayloadFromCms(response)
}
