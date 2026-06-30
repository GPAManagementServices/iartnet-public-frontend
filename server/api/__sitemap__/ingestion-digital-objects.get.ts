import { defineEventHandler } from 'h3'


import { fetchPublishedDigitalObjectEntries } from '../../utils/sitemap/fetchIngestionUrls'
import { isSitemapEnabled } from '../../utils/sitemap/isEnabled'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  if (!isSitemapEnabled(config))
    return []

  try {
    return await fetchPublishedDigitalObjectEntries()
  }
  catch (error) {
    console.warn('[sitemap/ingestion-digital-objects]', error)
    return []
  }
})
