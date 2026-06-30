import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import test from 'node:test'
import {
  normalizeManifestRow,
  syncHeroCarouselPatchVars,
} from '../app/utils/headerPatchManifest.ts'
import {
  buildPatchListPayloadFromCms,
  fetchHeroCarouselPatchPayload,
} from '../server/utils/homepageHeroCarousel.ts'
import {
  buildHomepageHighlightItemsFromCms,
  fetchHomepageHighlightItems,
} from '../server/utils/homepageHighlights.ts'
import { fetchSignedMediaBody } from '../server/utils/imageProxy.ts'

test('hero adapter maps CMS records to Cables payload', async () => {
  const items = buildPatchListPayloadFromCms({
    data: [
      {
        title: ' Bagatella_2a ',
        slug: ' /digital-object/LO12124798 ',
        digital_object_slug: 'IGNORED',
        media: { path: ' media/959c418f-3ea3-4469-bff1-91f07a29408a.jpg ', url: 'https://cms.example.test/storage/ignored.jpg' },
      },
      {
        title: 'Fallback slug',
        digital_object_slug: 'OA 1',
        media: { url: ' https://cms.example.test/storage/media/fallback.jpg ' },
      },
      {
        title: 'No cover',
        digital_object_slug: 'NO_COVER',
        media: null,
      },
      {
        title: '',
        digital_object_slug: 'NO_TITLE',
        media: { path: 'media/no-title.jpg' },
      },
    ],
  })

  assert.equal(items.length, 3)
  assert.deepEqual(items[0], {
    title: 'Bagatella_2a',
    slug: '/digital-object/LO12124798',
    type: '',
    year: '',
    subject: '',
    location: '',
    cover: '/api/image/media/959c418f-3ea3-4469-bff1-91f07a29408a.jpg',
    coverLocal: '',
  })
  assert.equal(items[1].slug, '/digital-object/OA%201')
  assert.equal(items[1].cover, 'https://cms.example.test/storage/media/fallback.jpg')
  assert.equal(items[2].slug, '/digital-object/NO_COVER')
  assert.equal(items[2].cover, '')
  assert.deepEqual(buildPatchListPayloadFromCms({ data: [] }), [])

  const fetched = await fetchHeroCarouselPatchPayload(async () => ({ data: [{ title: 'A', slug: '/a', media: { path: 'media/a.jpg' } }] }))
  assert.equal(fetched[0]?.cover, '/api/image/media/a.jpg')
})

test('hero adapter preserves 0, 1 and 12 published records without truncation', () => {
  assert.deepEqual(buildPatchListPayloadFromCms({ data: [] }), [])

  const single = buildPatchListPayloadFromCms({
    data: [{ title: 'One', digital_object_slug: 'ONE', media: { path: 'media/one.jpg' } }],
  })
  assert.equal(single.length, 1)

  const twelve = buildPatchListPayloadFromCms({
    data: Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      title: `Hero ${index + 1}`,
      digital_object_slug: `HERO_${index + 1}`,
      media: index === 11 ? null : { path: `media/hero-${index + 1}.jpg` },
    })),
  })

  assert.equal(twelve.length, 12)
  assert.equal(twelve[0]?.slug, '/digital-object/HERO_1')
  assert.equal(twelve[11]?.slug, '/digital-object/HERO_12')
  assert.equal(twelve[11]?.cover, '')
})

test('hero Cables variables receive the full normalized array', () => {
  const rows = buildPatchListPayloadFromCms({
    data: Array.from({ length: 12 }, (_, index) => ({
      title: `Hero ${index + 1}`,
      digital_object_slug: `HERO_${index + 1}`,
      media: { path: `media/hero-${index + 1}.jpg` },
    })),
  })
  const items = rows.map(normalizeManifestRow)
  const vars: Record<string, { value: unknown, setValue: (value: unknown) => void }> = {
    list: { value: null, setValue(value) { this.value = value } },
    slugArray: { value: [], setValue(value) { this.value = value } },
    totalItems: { value: 0, setValue(value) { this.value = value } },
  }

  syncHeroCarouselPatchVars({ getVar: name => vars[name] }, 'http://localhost:3000/api/header-patch/carousel-items', items)

  assert.equal(vars.list.value, 'http://localhost:3000/api/header-patch/carousel-items')
  assert.deepEqual(vars.slugArray.value, rows.map(row => row.slug))
  assert.equal(vars.totalItems.value, 12)
})

test('highlights adapter maps Curator media, IIIF and title variants', async () => {
  const items = buildHomepageHighlightItemsFromCms({
    data: [
      {
        id: 1,
        title: { autore: 'Giuseppe Bossi', titolo: 'La Riconoscenza', sottotitolo: 'Brera' },
        description: 'Curator media item',
        link: '/digital-object/OA_4t030-00055',
        media: { path: 'media/320cb76b-cfa6-467a-851d-41c77e32264a.jpg' },
      },
      {
        id: 2,
        title: { titolo: 'Composizione astratta', sottotitolo1: '1950-1951', sottotitolo2: 'Brera' },
        description: 'IIIF item',
        link: '/digital-object/D_4t060-04786',
        cover_iiif_identifier: '97a0d1cf-f1fd-4f04-b10f-6269041aa23g.tif',
      },
      {
        id: 3,
        title: 'Missing cover',
        link: '/digital-object/MISSING_COVER',
      },
      {
        id: 4,
        title: 'Missing link',
        media: { path: 'media/missing-link.jpg' },
      },
    ],
  }, 'https://iiif.example.test')

  assert.equal(items.length, 3)
  assert.deepEqual(items[0]?.title, { autore: 'Giuseppe Bossi', titolo: 'La Riconoscenza', sottotitolo: 'Brera' })
  assert.equal(items[0]?.coverImage, '/api/image/media/320cb76b-cfa6-467a-851d-41c77e32264a.jpg?w=500&h=500&fit=crop')
  assert.deepEqual(items[1]?.title, { titolo: 'Composizione astratta', sottotitolo1: '1950-1951', sottotitolo2: 'Brera' })
  assert.equal(items[1]?.coverImage, 'https://iiif.example.test/iiif/2/97a0d1cf-f1fd-4f04-b10f-6269041aa23g.tif/square/500,500/0/default.jpg')
  assert.equal(items[1]?.description, 'IIIF item')
  assert.equal(items[2]?.id, '3')
  assert.equal(items[2]?.coverImage, '')
  assert.deepEqual(buildHomepageHighlightItemsFromCms({ data: [] }, 'https://iiif.example.test'), [])
})

test('highlights adapter preserves 0, 1, 2 and 7 total slides without viewport truncation', () => {
  assert.deepEqual(buildHomepageHighlightItemsFromCms({ data: [] }, 'https://iiif.example.test'), [])

  for (const count of [1, 2, 7]) {
    const items = buildHomepageHighlightItemsFromCms({
      data: Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        title: `Highlight ${index + 1}`,
        link: `/digital-object/HIGHLIGHT_${index + 1}`,
        media: index === count - 1 ? null : { path: `media/highlight-${index + 1}.jpg` },
      })),
    }, 'https://iiif.example.test')

    assert.equal(items.length, count)
    assert.equal(items.at(-1)?.link, `/digital-object/HIGHLIGHT_${count}`)
  }
})

test('highlights fetch helper returns CMS data or empty fallback', async () => {
  const ok = await fetchHomepageHighlightItems('en', 'https://iiif.example.test', async () => ({
    data: [{ id: 1, title: 'A', link: '/digital-object/A', media: { path: 'media/a.jpg' } }],
  }))
  assert.equal(ok.length, 1)

  const originalConsoleError = console.error
  console.error = () => {}
  try {
    const failed = await fetchHomepageHighlightItems('en', 'https://iiif.example.test', async () => {
      throw new Error('CMS unavailable')
    })
    assert.deepEqual(failed, [])
  }
  finally {
    console.error = originalConsoleError
  }
})

test('image proxy helper returns image body and headers without redirect payload', async () => {
  const body = Buffer.from('image-bytes')
  const response = await fetchSignedMediaBody(
    'media/cover.jpg',
    { w: 500 },
    async (request, options) => {
      assert.equal(request, '/v1/media/sign')
      assert.deepEqual(options.params, { path: 'media/cover.jpg', w: 500 })
      return { url: 'https://cms.example.test/curator/signed-cover.jpg' }
    },
    async (url) => {
      assert.equal(url, 'https://cms.example.test/curator/signed-cover.jpg')
      return new Response(body, {
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
          'cache-control': 'public, max-age=300',
        },
      })
    },
  )

  assert.equal(Buffer.isBuffer(response.body), true)
  assert.equal(response.body.toString(), 'image-bytes')
  assert.equal(response.contentType, 'image/jpeg')
  assert.equal(response.cacheControl, 'public, max-age=300')
})
