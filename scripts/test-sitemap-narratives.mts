/**
 * Smoke test filtri narrative sitemap (no API).
 * Run: pnpm exec tsx scripts/test-sitemap-narratives.mts
 */
import assert from 'node:assert/strict'
import type { TStoriesTypeData } from '../shared/types/api.ts'
import {
  isSitemapPublicNarrative,
  isTechnicalNarrativeSlug,
  narrativeEditorialSlug,
  narrativeSitemapPaths,
} from '../server/utils/sitemap/narrativeSitemap.ts'

const PROD_UUIDS = [
  '019e8e72-6b64-719c-b6cc-4b998c6c89d9',
  '019e8e72-f97c-73e5-a498-0f3fae97287c',
  '019e8f37-daa6-71a0-9e1b-6bab20d23438',
] as const

function narrativeFixture(overrides: Partial<TStoriesTypeData> & Pick<TStoriesTypeData, 'id'>): TStoriesTypeData {
  return {
    name: 'Test narrative',
    description: '',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    publish_state: 'draft',
    ext_json: { Header: { Layout: 'None' }, sections: [] },
    ...overrides,
  }
}

for (const uuid of PROD_UUIDS) {
  assert.ok(isTechnicalNarrativeSlug(uuid), `prod uuid must be technical: ${uuid}`)
}

assert.equal(isTechnicalNarrativeSlug('mozart-and-the-magic-flute'), false)

const draft = narrativeFixture({ id: PROD_UUIDS[0], publish_state: 'draft' })
assert.equal(isSitemapPublicNarrative(draft), false)

const publishedUuidOnly = narrativeFixture({
  id: PROD_UUIDS[0],
  publish_state: 'published',
})
assert.equal(narrativeEditorialSlug(publishedUuidOnly), null)
assert.equal(isSitemapPublicNarrative(publishedUuidOnly), false)

const publishedUuidSlug = narrativeFixture({
  id: PROD_UUIDS[1],
  publish_state: 'published',
  ext_json: {
    Header: { Layout: 'None', SEO: { slug: PROD_UUIDS[1] } },
    sections: [],
  },
})
assert.equal(narrativeEditorialSlug(publishedUuidSlug), null)
assert.equal(isSitemapPublicNarrative(publishedUuidSlug), false)

const publishedEditorial = narrativeFixture({
  id: PROD_UUIDS[2],
  publish_state: 'published',
  ext_json: {
    Header: { Layout: 'None', SEO: { slug: 'mozart-and-the-magic-flute' } },
    sections: [],
  },
})
assert.equal(narrativeEditorialSlug(publishedEditorial), 'mozart-and-the-magic-flute')
assert.equal(isSitemapPublicNarrative(publishedEditorial), true)

const currentProdLike = PROD_UUIDS.map(id =>
  narrativeFixture({ id, publish_state: 'published' }),
)
assert.deepEqual(narrativeSitemapPaths(currentProdLike), [])

const mixed = [
  ...currentProdLike,
  publishedEditorial,
  draft,
]
assert.deepEqual(
  narrativeSitemapPaths(mixed),
  ['/narratives/mozart-and-the-magic-flute'],
)

console.log('sitemap narratives: ok')
