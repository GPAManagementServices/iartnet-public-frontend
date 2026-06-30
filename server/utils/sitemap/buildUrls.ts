import type { SitemapEntry, SlugTranslations } from './types'

type SlugSource = SlugTranslations & { slug?: string }

/** Path pubblico oggetto digitale (allineato a SearchItem / digital-object/[slug]). */
export function digitalObjectPath(stableId: string): string {
  return `/digital-object/${encodeURIComponent(stableId)}`
}

/**
 * Path pubblico EN (default locale, senza prefisso `/it/`).
 * La sezione IT è nascosta e non va esposta in sitemap.
 * `segment` senza slash iniziale, es. `projects`, `activities`.
 */
export function localizedDetailPaths(segment: string, item: SlugSource): string[] {
  const enSlug = (item.translations?.slug?.en ?? item.slug ?? '').trim()

  if (!enSlug)
    return []

  return [`/${segment}/${encodeURIComponent(enSlug)}`]
}

export function pathsToSitemapEntries(paths: string[]): SitemapEntry[] {
  return paths.map(loc => ({ loc }))
}

export function narrativePath(id: string): string {
  return `/narratives/${encodeURIComponent(id)}`
}
