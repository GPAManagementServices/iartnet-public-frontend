import type { TStoriesTypeData } from '#shared/types/api'

import { narrativePath } from './buildUrls'

const UUID_SLUG_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Slug tecnico UUID (id provvisorio), non slug editoriale definitivo. */
export function isTechnicalNarrativeSlug(slug: string): boolean {
  return UUID_SLUG_RE.test(slug.trim())
}

function isPublishedNarrative(item: TStoriesTypeData): boolean {
  return String(item.publish_state ?? '').toLowerCase() === 'published'
}

/**
 * Slug editoriale da `ext_json.Header.SEO.slug`.
 * Esclude assenti, UUID tecnici e slug identici all'id record.
 */
export function narrativeEditorialSlug(item: TStoriesTypeData): string | null {
  const slug = String(item.ext_json?.Header?.SEO?.slug ?? '').trim()
  if (!slug)
    return null

  const id = String(item.id ?? '').trim()
  if (!id || slug === id || isTechnicalNarrativeSlug(slug))
    return null

  return slug
}

/** Narrative indicizzabile in sitemap: published + slug editoriale definitivo. */
export function isSitemapPublicNarrative(item: TStoriesTypeData): boolean {
  if (!isPublishedNarrative(item))
    return false

  return narrativeEditorialSlug(item) !== null
}

export function narrativeSitemapPaths(items: TStoriesTypeData[]): string[] {
  const paths = items
    .filter(isSitemapPublicNarrative)
    .map((item) => {
      const slug = narrativeEditorialSlug(item)!
      return narrativePath(slug)
    })

  return [...new Set(paths)]
}
