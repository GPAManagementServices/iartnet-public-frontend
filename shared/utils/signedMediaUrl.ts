import type { SignedMediaFm, SignedMediaFit, SignedMediaQuery, SignedMediaSignResponse, SignedMediaUrlInput } from '#shared/types/signedMedia'
import { SIGNED_MEDIA_FIT, SIGNED_MEDIA_FM } from '#shared/types/signedMedia'

const DIM_MIN = 10
const DIM_MAX = 2500

/** TTL cache in-memory della risposta `{ url }` (dedup e meno pressione sul rate limit). */
const DEFAULT_TTL_MS = 45_000

export type SignedMediaFetch = (
  url: string,
  opts?: { query: Record<string, string> },
) => Promise<SignedMediaSignResponse>

interface CachedEntry {
  url: string
  until: number
}

const resolved = new Map<string, CachedEntry>()
const inflight = new Map<string, Promise<string>>()

function clampDimension(n: number): number {
  return Math.max(DIM_MIN, Math.min(DIM_MAX, Math.round(n)))
}

export function normalizeSignedMediaQuery(input: SignedMediaUrlInput): SignedMediaQuery | null {
  const path = (input.path ?? '').trim()
  if (!path)
    return null

  const q: SignedMediaQuery = { path }

  if (input.w != null && Number.isFinite(Number(input.w)))
    q.w = String(clampDimension(Number(input.w)))

  if (input.h != null && Number.isFinite(Number(input.h)))
    q.h = String(clampDimension(Number(input.h)))

  if (input.fit != null && (SIGNED_MEDIA_FIT as readonly string[]).includes(input.fit))
    q.fit = input.fit as SignedMediaFit

  if (input.fm != null && (SIGNED_MEDIA_FM as readonly string[]).includes(input.fm))
    q.fm = input.fm as SignedMediaFm

  return q
}

export function signedMediaCacheKey(query: SignedMediaQuery): string {
  return Object.keys(query)
    .sort()
    .map(k => `${k}=${query[k as keyof SignedMediaQuery]}`)
    .join('&')
}

function getStatus(err: unknown): number | undefined {
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>
    const c = o.statusCode ?? o.status ?? (o.response as Record<string, unknown> | undefined)?.status
    if (typeof c === 'number')
      return c
    if (typeof c === 'string')
      return Number.parseInt(c, 10)
  }
  return undefined
}

async function fetchSignWithRetry(fetch: SignedMediaFetch, query: SignedMediaQuery): Promise<string> {
  const maxAttempts = 4
  let delayMs = 400

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { url } = await fetch('/api/media/sign', { query })
      return url
    }
    catch (err) {
      const status = getStatus(err)
      if (status === 429 && attempt < maxAttempts - 1) {
        await new Promise(r => setTimeout(r, delayMs))
        delayMs = Math.min(delayMs * 2, 5000)
        continue
      }
      throw err
    }
  }
  throw new Error('media/sign retry exhausted')
}

/**
 * Risolve `path` + parametri in un URL assoluto firmato.
 * Memoizzazione + dedup richieste identiche (Map + TTL breve).
 */
export async function fetchSignedMediaUrl(
  fetch: SignedMediaFetch,
  input: SignedMediaUrlInput,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<string> {
  const query = normalizeSignedMediaQuery(input)
  if (!query)
    throw new Error('signed media: missing path')

  const key = signedMediaCacheKey(query)
  const now = Date.now()
  const hit = resolved.get(key)
  if (hit && hit.until > now)
    return hit.url

  let p = inflight.get(key)
  if (!p) {
    p = fetchSignWithRetry(fetch, query)
      .then((url) => {
        resolved.set(key, { url, until: Date.now() + ttlMs })
        return url
      })
      .finally(() => {
        inflight.delete(key)
      })
    inflight.set(key, p)
  }

  return p
}

export function invalidateSignedMediaCache(input: SignedMediaUrlInput): void {
  const query = normalizeSignedMediaQuery(input)
  if (!query)
    return
  resolved.delete(signedMediaCacheKey(query))
}
