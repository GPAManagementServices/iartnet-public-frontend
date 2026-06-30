/**
 * Smoke test helper paths sitemap (no API).
 * Run: pnpm exec tsx scripts/test-sitemap-buildUrls.mts
 */
import assert from 'node:assert/strict'
import {
  digitalObjectPath,
  localizedDetailPaths,
  narrativePath,
} from '../server/utils/sitemap/buildUrls.ts'

assert.equal(
  digitalObjectPath('OA_4t030-00055'),
  '/digital-object/OA_4t030-00055',
)

assert.deepEqual(
  localizedDetailPaths('projects', {
    slug: 'foo',
    translations: { slug: { en: 'foo-en', it: 'foo-it' } },
  }),
  ['/projects/foo-en'],
)

assert.deepEqual(
  localizedDetailPaths('projects', {
    translations: { slug: { it: 'foo-it' } },
  }),
  [],
)

assert.equal(narrativePath('550e8400-e29b-41d4-a716-446655440000'), '/narratives/550e8400-e29b-41d4-a716-446655440000')

console.log('sitemap buildUrls: ok')
