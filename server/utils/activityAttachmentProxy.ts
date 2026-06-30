import type { H3Event } from 'h3'

function parseOrigin(base: string): string | null {
  try {
    return new URL(base).origin
  }
  catch {
    return null
  }
}

function allowedOrigins(config: ReturnType<typeof useRuntimeConfig>): string[] {
  const list = [
    config.public.baseUrl,
    config.public.baseDataUrl,
    config.public.baseIIIFUrl,
  ]
    .map(parseOrigin)
    .filter((o): o is string => Boolean(o))
  return [...new Set(list)]
}

function toAbsoluteUrl(raw: string, config: ReturnType<typeof useRuntimeConfig>): string {
  const t = raw.trim()
  if (!t)
    return ''
  if (/^https?:\/\//i.test(t))
    return t
  const base = String(config.public.baseUrl).replace(/\/$/, '')
  if (t.startsWith('/'))
    return `${base}${t}`
  return `${base}/${t}`
}

export function isActivityAttachmentFetchAllowed(
  absoluteUrl: string,
  config: ReturnType<typeof useRuntimeConfig>,
): boolean {
  let u: URL
  try {
    u = new URL(absoluteUrl)
  }
  catch {
    return false
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:')
    return false
  return allowedOrigins(config).includes(u.origin)
}

export function resolveActivityAttachmentAbsoluteUrl(
  raw: string,
  config: ReturnType<typeof useRuntimeConfig>,
): string {
  return toAbsoluteUrl(raw, config)
}

export async function proxyActivityAttachmentPdf(
  event: H3Event,
  rawSrc: string,
): Promise<Buffer> {
  const config = useRuntimeConfig()
  const absolute = resolveActivityAttachmentAbsoluteUrl(rawSrc, config)
  if (!absolute)
    throw createError({ statusCode: 400, statusMessage: 'Invalid src' })
  if (!isActivityAttachmentFetchAllowed(absolute, config)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'PDF source origin not allowed',
    })
  }

  const forwardCookie = getHeader(event, 'cookie')
  const upstreamHeaders = new Headers({
    Accept: 'application/pdf, application/octet-stream;q=0.9, */*;q=0.1',
  })
  if (forwardCookie)
    upstreamHeaders.set('Cookie', forwardCookie)

  let res: Response
  try {
    res = await fetch(absolute, { redirect: 'follow', headers: upstreamHeaders })
  }
  catch (e) {
    console.error('[activity-attachment-file] upstream fetch error', e)
    throw createError({
      statusCode: 502,
      statusMessage: 'Upstream fetch failed',
    })
  }

  if (!res.ok) {
    throw createError({
      statusCode: res.status === 404 ? 404 : 502,
      statusMessage: `Upstream ${res.status}`,
    })
  }

  const ct = res.headers.get('content-type') || ''
  if (ct && !ct.includes('pdf') && !ct.includes('octet-stream')) {
    console.warn('[activity-attachment-file] unexpected content-type', ct)
  }

  /** Nitro serializza `ArrayBuffer` come JSON (`{}`, ~2 byte): usare sempre `Buffer`. */
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 5) {
    const preview = buf.toString('utf8').slice(0, 200)
    console.error('[activity-attachment-file] upstream body too small', {
      absolute,
      length: buf.length,
      preview,
    })
    throw createError({
      statusCode: 502,
      statusMessage: 'Upstream returned empty or invalid PDF',
    })
  }
  const magic = buf.toString('latin1', 0, 4)
  if (magic !== '%PDF') {
    const preview = buf.toString('utf8', 0, 400)
    console.error('[activity-attachment-file] upstream is not a PDF', {
      absolute,
      magic,
      preview,
    })
    throw createError({
      statusCode: 502,
      statusMessage: 'Upstream response is not a PDF',
    })
  }

  const outType = ct.startsWith('application/') ? ct.split(';')[0].trim() : 'application/pdf'
  setHeader(event, 'Content-Type', outType)
  setHeader(event, 'Cache-Control', 'private, max-age=120')
  return buf
}
