/**
 * Smoke test hub paths per pages sitemap.
 * Run: pnpm exec tsx scripts/test-sitemap-pages.mts
 */
import assert from 'node:assert/strict'
import {
  PUBLIC_HUB_PATHS,
  fetchPublicHubSitemapEntries,
} from '../server/utils/sitemap/publicHubPaths.ts'

assert.equal(PUBLIC_HUB_PATHS.length, 6)

const entries = fetchPublicHubSitemapEntries()
assert.equal(entries.length, 6)

const locs = entries.map(e => e.loc)
for (const path of PUBLIC_HUB_PATHS)
  assert.ok(locs.includes(path), `missing ${path}`)

assert.ok(locs.every(loc => !loc.includes('/it/')), 'must not contain /it/')
assert.ok(locs.every(loc => !loc.includes('/search')), 'must not contain /search')

console.log('sitemap pages: ok')
