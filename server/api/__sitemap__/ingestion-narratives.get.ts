import { defineEventHandler } from 'h3'


import { fetchPublishedNarrativeEntries } from '../../utils/sitemap/fetchIngestionUrls'
import { isSitemapEnabled } from '../../utils/sitemap/isEnabled'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  if (!isSitemapEnabled(config))
    return []

  try {
    return await fetchPublishedNarrativeEntries()
  }
  catch (error) {
    console.warn('[sitemap/ingestion-narratives]', error)
    return []
  }
})
