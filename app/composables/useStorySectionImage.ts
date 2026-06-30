import type { TStoryImageType } from '#shared/types/api'
import type { MaybeRefOrGetter } from 'vue'
import { isAbsoluteHttpUrl, isCuratorStoragePathLike, toCuratorImageProxyUrl } from '#shared/utils/narrativeHeroImage'
import { storyHtmlContent, storyPlainText } from '#shared/utils/storyText'
import { toValue } from 'vue'

export function useStorySectionImage(
  image: MaybeRefOrGetter<TStoryImageType | undefined | null>,
  cacheKey: MaybeRefOrGetter<string>,
) {
  const imageUrl = computed(() => {
    const url = toValue(image)?.URL
    if (typeof url !== 'string')
      return null
    const trimmed = url.trim()
    return trimmed || null
  })

  const cardId = computed(() => {
    const url = imageUrl.value
    if (!url || isAbsoluteHttpUrl(url) || isCuratorStoragePathLike(url))
      return null
    return url
  })

  const staticUrl = computed(() => {
    const url = imageUrl.value
    if (!url)
      return null
    if (isAbsoluteHttpUrl(url))
      return url
    if (isCuratorStoragePathLike(url))
      return toCuratorImageProxyUrl(url)
    return null
  })

  const { resolvedImageUrl, pending } = useResolvedNarrativeCardImage(
    cardId,
    cacheKey,
  )

  const displayUrl = computed(() => staticUrl.value ?? resolvedImageUrl.value ?? null)

  const captionHtml = computed(() => storyHtmlContent(toValue(image)?.Caption))

  const captionAlt = computed(() => storyPlainText(toValue(image)?.Caption) ?? '')

  const bgColor = computed(() => {
    const c = toValue(image)?.bgColor
    if (typeof c !== 'string')
      return null
    const trimmed = c.trim()
    return trimmed || null
  })

  return {
    displayUrl,
    pending,
    captionHtml,
    captionAlt,
    bgColor,
    hasSource: computed(() => !!imageUrl.value),
  }
}
