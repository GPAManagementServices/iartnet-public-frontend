/**
 * Proxy sicuro verso l’oEmbed Vimeo: restituisce thumbnail e titolo per anteprime lista.
 * @see https://developer.vimeo.com/api/oembed/videos
 */
interface VimeoOembedResponse {
  thumbnail_url?: string
  title?: string
}

function isAllowedVimeoHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  return h === 'vimeo.com' || h === 'www.vimeo.com' || h === 'player.vimeo.com'
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const raw = typeof q.url === 'string' ? q.url.trim() : ''
  if (!raw) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing url query parameter',
    })
  }

  let parsed: URL
  try {
    parsed = new URL(raw)
  }
  catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid url',
    })
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid URL protocol',
    })
  }

  if (!isAllowedVimeoHost(parsed.hostname)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL must be a Vimeo link',
    })
  }

  const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(parsed.toString())}`

  try {
    const data = await $fetch<VimeoOembedResponse>(oembedUrl)
    return {
      thumbnail_url: data.thumbnail_url ?? '',
      title: data.title ?? '',
    }
  }
  catch (err) {
    console.warn('[api/vimeo/oembed] Vimeo request failed', { url: parsed.toString(), err })
    throw createError({
      statusCode: 502,
      statusMessage: 'Could not load Vimeo preview',
    })
  }
})
