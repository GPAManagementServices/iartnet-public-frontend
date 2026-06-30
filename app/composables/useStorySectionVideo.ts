import type { TStoryImageType, TStorySplitMediaType } from '#shared/types/api'
import { isStorySplitVideoMediaType } from '#shared/utils/storySplitMedia'
import { isAbsoluteHttpUrl, isCuratorStoragePathLike } from '#shared/utils/narrativeHeroImage'
import { normalizeYoutubeEmbedUrl } from '#shared/utils/detailPage'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { parseVimeoDigitalResource } from '~/utils/vimeoUtils'

const LEADING_SLASHES = /^\/+/

function resolveStoryVideoUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed)
    return ''
  if (isAbsoluteHttpUrl(trimmed))
    return trimmed
  if (isCuratorStoragePathLike(trimmed)) {
    const path = trimmed.replace(LEADING_SLASHES, '')
    return `/api/image/${path}`
  }
  return trimmed
}

export function useStorySectionVideo(
  image: MaybeRefOrGetter<TStoryImageType | undefined | null>,
  mediaType: MaybeRefOrGetter<TStorySplitMediaType | '' | null | undefined>,
) {
  const isVideo = computed(() => isStorySplitVideoMediaType(toValue(mediaType)))

  const sourceUrl = computed(() => {
    if (!isVideo.value)
      return null
    const url = toValue(image)?.URL
    if (typeof url !== 'string')
      return null
    const resolved = resolveStoryVideoUrl(url)
    return resolved || null
  })

  const vimeoEmbed = computed(() => {
    const url = sourceUrl.value
    if (!url)
      return null
    return parseVimeoDigitalResource(url)
  })

  const youtubeEmbedUrl = computed(() => {
    const url = sourceUrl.value
    if (!url)
      return null
    return normalizeYoutubeEmbedUrl(url)
  })

  const isNativeVideo = computed(
    () => isVideo.value && !!sourceUrl.value && !vimeoEmbed.value && !youtubeEmbedUrl.value,
  )

  const hasPlayableVideo = computed(
    () => isVideo.value && !!(vimeoEmbed.value || youtubeEmbedUrl.value || isNativeVideo.value),
  )

  return {
    isVideo,
    sourceUrl,
    vimeoEmbed,
    youtubeEmbedUrl,
    isNativeVideo,
    hasPlayableVideo,
  }
}
