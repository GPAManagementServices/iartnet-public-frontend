import type { NarrativeCardMediaItem } from '#shared/utils/narrativeHeroImage'
import type { MaybeRefOrGetter } from 'vue'
import { IiifImageSize } from '#shared/utils/iiif'
import { firstMediaHeroUrl } from '#shared/utils/narrativeHeroImage'
import { toValue } from 'vue'

export function useResolvedNarrativeCardImage(
  cardId: MaybeRefOrGetter<string | null | undefined>,
  key: MaybeRefOrGetter<string>,
  size: MaybeRefOrGetter<IiifImageSize> = IiifImageSize.Max,
) {
  const { locale } = useI18n()

  const normalizedCardId = computed(() => {
    const value = toValue(cardId)
    if (typeof value !== 'string')
      return null

    const trimmed = value.trim()
    return trimmed || null
  })

  const { data: resolvedImageUrl, pending } = useAsyncData(
    () => toValue(key),
    async (): Promise<string | null> => {
      const id = normalizedCardId.value
      if (!id)
        return null

      try {
        const card = await $fetch<{ record_json: string }>(`/api/cardDetail/${encodeURIComponent(id)}`, {
          query: { locale: locale.value },
        })

        try {
          const parsed = JSON.parse(card.record_json) as { media?: NarrativeCardMediaItem[] }
          return firstMediaHeroUrl(parsed.media, toValue(size)) ?? null
        }
        catch {
          return null
        }
      }
      catch {
        return null
      }
    },
    { watch: [normalizedCardId, locale] },
  )

  return {
    resolvedImageUrl,
    pending,
  }
}
