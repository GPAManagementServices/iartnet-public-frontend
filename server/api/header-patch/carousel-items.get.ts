import { getRequestURL } from 'h3'
import { fetchHeroCarouselPatchPayload } from '../../utils/homepageHeroCarousel'

function toAbsoluteHttpUrl(origin: string, value: string): string {
  const raw = value.trim()

  if (!raw)
    return ''

  try {
    const resolved = new URL(raw, `${origin}/`)

    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:')
      return ''

    return resolved.toString()
  }
  catch {
    return ''
  }
}

export default defineEventHandler(async (event) => {
  const origin = getRequestURL(event).origin

  const payload = (await fetchHeroCarouselPatchPayload())
    .map(item => ({
      ...item,
      cover: toAbsoluteHttpUrl(origin, item.cover),
    }))

  setResponseHeader(event, 'Cache-Control', 'public, max-age=300')
  return payload
})
