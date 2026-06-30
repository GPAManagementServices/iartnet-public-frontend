/** Voce sitemap compatibile con @nuxtjs/sitemap (campo `loc` = path o URL assoluta). */
export interface SitemapEntry {
  loc: string
  lastmod?: string
}

export interface IngestionSitemapRecordsResponse {
  success: boolean
  data: string[]
  meta: {
    offset: number
    limit: number
    total: number
    count: number
    has_more: boolean
    next_offset: number | null
  }
}

export interface SlugTranslations {
  slug?: { en?: string, it?: string }
}
