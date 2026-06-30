import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

const TRAILING_SLASH = /\/$/

export interface UseOsdCardSeoOptions {
  /** Fallback per il titolo documento quando `title` è vuoto. */
  slug: MaybeRefOrGetter<string>
  /** Titolo scheda; se vuoto si usa `slug`. */
  title?: MaybeRefOrGetter<string | undefined>
  /** Segmenti meta description: trim, vuoti omessi, join con ` - `. */
  descriptionParts?: MaybeRefOrGetter<readonly string[] | undefined>
  /** URL immagine IIIF finale HTTPS (solo se validato da pickOsdRepresentativeImageUrl). */
  imageUrl?: MaybeRefOrGetter<string | undefined>
  /** stable_id per JSON-LD identifier; default: slug. */
  stableId?: MaybeRefOrGetter<string | undefined>
}

function compactJsonLd<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as T
}

/**
 * Imposta title / description / Open Graph per le schede OSD (card detail).
 */
export function useOsdCardSeo(options: UseOsdCardSeoOptions) {
  const route = useRoute()
  const site = useSiteConfig()

  const resolvedSlug = computed(() => String(toValue(options.slug) ?? '').trim())

  const resolvedTitle = computed(() => {
    const title = String(toValue(options.title) ?? '').trim()
    return title || resolvedSlug.value
  })

  const resolvedDescription = computed(() => {
    const parts = toValue(options.descriptionParts) ?? []
    return parts
      .map(s => String(s).trim())
      .filter(Boolean)
      .join(' - ')
  })

  const resolvedImageUrl = computed(() => {
    const url = String(toValue(options.imageUrl) ?? '').trim()
    return url || undefined
  })

  const resolvedStableId = computed(() => {
    const id = String(toValue(options.stableId) ?? '').trim()
    return id || resolvedSlug.value
  })

  const canonicalUrl = computed(() => {
    const base = String(site.url ?? '').trim().replace(TRAILING_SLASH, '')
    if (!base)
      return undefined
    try {
      return new URL(route.path, `${base}/`).href
    }
    catch {
      return undefined
    }
  })

  useSeoMeta(() => {
    const meta: {
      title: string
      description?: string
      ogTitle: string
      ogDescription?: string
      ogImage?: string
      twitterImage?: string
      twitterCard?: 'summary_large_image'
    } = {
      title: resolvedTitle.value,
      ogTitle: resolvedTitle.value,
    }
    const description = resolvedDescription.value
    if (description) {
      meta.description = description
      meta.ogDescription = description
    }
    const image = resolvedImageUrl.value
    if (image) {
      meta.ogImage = image
      meta.twitterImage = image
      meta.twitterCard = 'summary_large_image'
    }
    return meta
  })

  const jsonLd = computed(() => {
    const canonical = canonicalUrl.value
    if (!canonical)
      return null

    return compactJsonLd({
      '@context': 'https://schema.org',
      '@type': 'VisualArtwork',
      '@id': `${canonical}#digital-object`,
      'name': resolvedTitle.value,
      'description': resolvedDescription.value || undefined,
      'identifier': resolvedStableId.value,
      'url': canonical,
      'image': resolvedImageUrl.value,
      'isAccessibleForFree': true,
    })
  })

  useHead(() => {
    const data = jsonLd.value
    if (!data)
      return {}

    return {
      script: [
        {
          key: 'digital-object-schema',
          type: 'application/ld+json',
          innerHTML: JSON.stringify(data),
        },
      ],
    }
  })
}
