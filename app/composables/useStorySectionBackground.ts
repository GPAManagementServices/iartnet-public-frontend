import type { TStoryImageType } from '#shared/types/api'
import type { MaybeRefOrGetter } from 'vue'
import {
  hasStorySectionBgImageSource,
  hasStorySectionCustomBackground,
  readStorySectionForeColor,
  sectionBackgroundBaseColor,
  normalizeStoryCssColor,
  trimStoryBgColor,
} from '#shared/utils/storySectionBackground'
import { computed, toValue } from 'vue'
import { useStorySectionImage } from '~/composables/useStorySectionImage'

export function useStorySectionBackground(
  bgColor: MaybeRefOrGetter<string | null | undefined>,
  bgImage: MaybeRefOrGetter<TStoryImageType | null | undefined>,
  cacheKey: MaybeRefOrGetter<string>,
) {
  const trimmedBgColor = computed(() => trimStoryBgColor(toValue(bgColor)))
  const hasBgImageSource = computed(() => hasStorySectionBgImageSource(toValue(bgImage)))

  const { displayUrl: bgImageUrl } = useStorySectionImage(bgImage, cacheKey)

  const hasCustomBackground = computed(() =>
    hasStorySectionCustomBackground(toValue(bgColor), toValue(bgImage)),
  )

  const panelStyle = computed(() => {
    if (!hasCustomBackground.value)
      return undefined

    const baseColor = sectionBackgroundBaseColor(toValue(bgColor), toValue(bgImage))
    if (!baseColor)
      return undefined

    return { backgroundColor: baseColor }
  })

  return {
    trimmedBgColor,
    bgImageUrl,
    hasBgImageSource,
    hasCustomBackground,
    panelStyle,
  }
}

/** Sfondo da `Image.bgColor` solo se la sezione non ha `bgColor`/`bgImage` propri. SplitImage gestisce i due layer separatamente. */
export function useStorySectionLegacyImageBackground(
  sectionBgColor: MaybeRefOrGetter<string | null | undefined>,
  sectionBgImage: MaybeRefOrGetter<TStoryImageType | null | undefined>,
  imageBgColor: MaybeRefOrGetter<string | null | undefined>,
) {
  const style = computed(() => {
    if (hasStorySectionCustomBackground(toValue(sectionBgColor), toValue(sectionBgImage)))
      return undefined

    const bg = normalizeStoryCssColor(toValue(imageBgColor))
    if (!bg)
      return undefined

    return { backgroundColor: bg }
  })

  const color = computed(() => {
    if (hasStorySectionCustomBackground(toValue(sectionBgColor), toValue(sectionBgImage)))
      return null
    return normalizeStoryCssColor(toValue(imageBgColor))
  })

  return { style, color }
}

export function useStorySectionFontColor(
  section: MaybeRefOrGetter<Record<string, unknown> | null | undefined>,
) {
  const trimmedForeColor = computed(() => readStorySectionForeColor(toValue(section)))

  const textStyle = computed(() => {
    if (!trimmedForeColor.value)
      return undefined

    return {
      '--story-section-fore-color': trimmedForeColor.value,
      '--story-color-text': trimmedForeColor.value,
    }
  })

  return {
    trimmedForeColor,
    textStyle,
  }
}
