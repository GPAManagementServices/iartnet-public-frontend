import type { TStoriesTypeList } from '#shared/types/api'
import type { IngestionSitemapRecordsResponse, SitemapEntry } from './types'
import { apiData } from '../apiFetch'
import { digitalObjectPath, pathsToSitemapEntries } from './buildUrls'
import { narrativeSitemapPaths } from './narrativeSitemap'

const SITEMAP_RECORDS_PAGE_SIZE = 5000
const SITEMAP_RECORDS_MAX_PAGES = 500

/** Tutti gli oggetti digitali con publish_state = published (ingestion). */
export async function fetchPublishedDigitalObjectEntries(): Promise<SitemapEntry[]> {
  const paths: string[] = []
  let offset = 0
  let page = 0

  for (;;) {
    page += 1
    if (page > SITEMAP_RECORDS_MAX_PAGES) {
      console.warn('[sitemap] ingestion records pagination stopped at max pages', SITEMAP_RECORDS_MAX_PAGES)
      break
    }
    const response = await apiData<IngestionSitemapRecordsResponse>(
      `/sitemap/records?offset=${offset}&limit=${SITEMAP_RECORDS_PAGE_SIZE}`,
    )

    if (!response?.success || !Array.isArray(response.data)) {
      throw new Error('[sitemap] ingestion /sitemap/records returned invalid payload')
    }

    for (const stableId of response.data) {
      const id = String(stableId ?? '').trim()
      if (id)
        paths.push(digitalObjectPath(id))
    }

    if (!response.meta?.has_more)
      break

    const nextOffset = response.meta.next_offset
    if (nextOffset == null || nextOffset <= offset)
      break

    offset = nextOffset
  }

  return pathsToSitemapEntries([...new Set(paths)])
}

/**
 * Narrative ingestion indicizzabili: publish_state = published
 * e slug editoriale definitivo (no UUID tecnici / id provvisori).
 */
export async function fetchPublishedNarrativeEntries(): Promise<SitemapEntry[]> {
  const narration = await apiData<TStoriesTypeList>('/narrationsList?locale=en')

  if (!narration?.success || !Array.isArray(narration.data))
    throw new Error('[sitemap] ingestion /narrationsList returned invalid payload')

  return pathsToSitemapEntries(narrativeSitemapPaths(narration.data))
}
