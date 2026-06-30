import { defineEventHandler } from 'h3'

import { fetchPublicHubSitemapEntries } from '../../utils/sitemap/publicHubPaths'
import { isSitemapEnabled } from '../../utils/sitemap/isEnabled'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  if (!isSitemapEnabled(config))
    return []

  return fetchPublicHubSitemapEntries()
})
