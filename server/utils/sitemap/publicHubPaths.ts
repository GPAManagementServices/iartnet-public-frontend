import type { SitemapEntry } from './types'
import { pathsToSitemapEntries } from './buildUrls'

/**
 * Hub e homepage pubbliche EN (senza prefisso /it/).
 * Non duplicate in cms.xml, che espone solo detail e pagine CMS statiche.
 */
export const PUBLIC_HUB_PATHS = [
  '/',
  '/about',
  '/people',
  '/projects',
  '/activities',
  '/institutions',
  '/press',
] as const

export function fetchPublicHubSitemapEntries(): SitemapEntry[] {
  return pathsToSitemapEntries([...PUBLIC_HUB_PATHS])
}
