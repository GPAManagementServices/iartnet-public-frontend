import { defineEventHandler } from 'h3'


import { fetchCmsSitemapEntries } from '../../utils/sitemap/fetchCmsUrls'
import { isSitemapEnabled } from '../../utils/sitemap/isEnabled'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  if (!isSitemapEnabled(config))
    return []

  try {
    return await fetchCmsSitemapEntries()
  }
  catch (error) {
    console.warn('[sitemap/cms]', error)
    return []
  }
})
