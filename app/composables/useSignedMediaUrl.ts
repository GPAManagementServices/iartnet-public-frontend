import type { SignedMediaFm, SignedMediaFit } from '#shared/types/signedMedia'
import type { SignedMediaFetch } from '#shared/utils/signedMediaUrl'
import {
  fetchSignedMediaUrl,
  invalidateSignedMediaCache,
} from '#shared/utils/signedMediaUrl'

/**
 * ## useSignedMediaUrl (Curator / Glide)
 *
 * Leggi sempre `media.*.path` dal JSON API. Il client usa il proxy same-origin
 * `GET /api/media/sign` → backend `GET /api/v1/media/sign`.
 *
 * **Cover / hero (LCP):** preferisci `AppResponsiveImage` con `priority`.
 * Esempio singola larghezza:
 * `useSignedMediaUrl({ path: () => cover?.path, w: 1400, fit: 'max', fm: 'webp' })`
 *
 * **Gallery:**
 * `AppResponsiveImage` con `fit="crop"` o `contain` e `sizes` coerente col layout.
 *
 * **Open Graph (meta):** una sola risoluzione, es. `w: 1200`, `fit: 'max'` (no srcset).
 *
 * **Caching a valle:** per stessa `path` + stessi parametri di trasformazione il backend
 * restituisce URL firmati deterministici fino a scadenza firma; browser/CDN possono cacheare
 * il GET sull’URL assoluto (dipende da header infra). Qui si memoizza solo la risposta JSON
 * `{ url }` in RAM con TTL breve per dedup e meno 429. Non loggare URL firmate in console.
 */
export interface UseSignedMediaUrlOptions {
  path: MaybeRefOrGetter<string | null | undefined>
  w?: MaybeRefOrGetter<number | undefined>
  h?: MaybeRefOrGetter<number | undefined>
  fit?: MaybeRefOrGetter<SignedMediaFit | undefined>
  fm?: MaybeRefOrGetter<SignedMediaFm | undefined>
  /** TTL cache locale (ms), default 45s */
  ttlMs?: number
}

export function useSignedMediaUrl(options: UseSignedMediaUrlOptions) {
  const requestFetch = useRequestFetch() as SignedMediaFetch
  const url = ref<string | null>(null)
  const pending = ref(false)
  const error = ref<Error | null>(null)

  async function load(): Promise<void> {
    const path = toValue(options.path)
    const w = toValue(options.w)
    const h = toValue(options.h)
    const fit = toValue(options.fit)
    const fm = toValue(options.fm)
    const ttlMs = options.ttlMs

    if (!(path ?? '').trim()) {
      url.value = null
      error.value = null
      return
    }

    pending.value = true
    error.value = null
    try {
      url.value = await fetchSignedMediaUrl(requestFetch, { path, w, h, fit, fm }, ttlMs)
    }
    catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
      url.value = null
    }
    finally {
      pending.value = false
    }
  }

  watch(
    () => [
      toValue(options.path),
      toValue(options.w),
      toValue(options.h),
      toValue(options.fit),
      toValue(options.fm),
    ],
    () => {
      void load()
    },
    { immediate: true },
  )

  function refresh(): Promise<void> {
    const path = toValue(options.path)
    const w = toValue(options.w)
    const h = toValue(options.h)
    const fit = toValue(options.fit)
    const fm = toValue(options.fm)
    invalidateSignedMediaCache({ path, w, h, fit, fm })
    return load()
  }

  return { url, pending, error, refresh, load }
}
