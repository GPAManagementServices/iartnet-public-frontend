import type { Ref } from 'vue'
import { STORY_SCROLL_LAYOUT_REFRESH_EVENT } from '#shared/utils/storyPanelScroll'
import { useResizeObserver } from '@vueuse/core'
import { nextTick, onUnmounted, watch } from 'vue'

export const STORY_SPLIT_IMAGE_MEDIA_MAX_HEIGHT_VAR = '--story-split-image-media-max-height'
export const STORY_SPLIT_IMAGE_CAPTION_WIDTH_VAR = '--story-split-image-caption-width'

function clearLayoutVars(
  layer: HTMLElement | null,
  mediaMaxHeightVar: string,
  captionWidthVar: string,
) {
  if (!layer)
    return
  layer.style.removeProperty(mediaMaxHeightVar)
  layer.style.removeProperty(captionWidthVar)
}

function readCaptionReservedHeight(caption: HTMLElement): number {
  const style = getComputedStyle(caption)
  const marginTop = Number.parseFloat(style.marginTop) || 0
  return caption.offsetHeight + marginTop
}

function readLayerContentHeight(layer: HTMLElement): number {
  const style = getComputedStyle(layer)
  const paddingBlock = (Number.parseFloat(style.paddingTop) || 0)
    + (Number.parseFloat(style.paddingBottom) || 0)
  return Math.max(0, layer.clientHeight - paddingBlock)
}

/**
 * Reserve caption space in a media column via measured CSS custom properties.
 * Used by ScrollReveal (sticky layer) and SplitImage (inline caption-below, desktop).
 */
export function useStoryMediaCaptionLayout(options: {
  enabled: Ref<boolean>
  layerEl: Ref<HTMLElement | null>
  captionEl: Ref<HTMLElement | null>
  mediaEl: Ref<HTMLElement | null>
  mediaMaxHeightVar: string
  captionWidthVar: string
  listenLayoutRefresh?: boolean
}) {
  let layoutRefreshHandler: (() => void) | null = null
  const listenLayoutRefresh = options.listenLayoutRefresh ?? true

  function applyImageMaxHeight(layer: HTMLElement, imageMaxHeight: number) {
    layer.style.setProperty(options.mediaMaxHeightVar, `${Math.max(0, imageMaxHeight)}px`)
  }

  function syncCaptionWidth(layer: HTMLElement, media: HTMLElement | null) {
    if (!media) {
      layer.style.removeProperty(options.captionWidthVar)
      return
    }

    const width = Math.round(media.getBoundingClientRect().width)
    if (width > 0)
      layer.style.setProperty(options.captionWidthVar, `${width}px`)
    else
      layer.style.removeProperty(options.captionWidthVar)
  }

  function syncLayout() {
    const layer = options.layerEl.value
    if (!layer || !options.enabled.value) {
      clearLayoutVars(layer, options.mediaMaxHeightVar, options.captionWidthVar)
      return
    }

    const layerHeight = readLayerContentHeight(layer)
    if (layerHeight <= 0)
      return

    const caption = options.captionEl.value
    if (!caption) {
      applyImageMaxHeight(layer, layerHeight)
      layer.style.removeProperty(options.captionWidthVar)
      return
    }

    let captionReserved = readCaptionReservedHeight(caption)
    applyImageMaxHeight(layer, layerHeight - captionReserved)
    syncCaptionWidth(layer, options.mediaEl.value)

    // Second pass: caption may reflow after image width / max-height settle.
    const nextReserved = readCaptionReservedHeight(caption)
    if (nextReserved !== captionReserved) {
      captionReserved = nextReserved
      applyImageMaxHeight(layer, layerHeight - captionReserved)
      syncCaptionWidth(layer, options.mediaEl.value)
    }
  }

  function requestSync() {
    void nextTick(() => {
      syncLayout()
      requestAnimationFrame(syncLayout)
    })
  }

  useResizeObserver(() => options.layerEl.value, requestSync)
  useResizeObserver(() => options.captionEl.value, requestSync)
  useResizeObserver(() => options.mediaEl.value, requestSync)

  watch(
    [options.enabled, options.layerEl, options.captionEl, options.mediaEl],
    requestSync,
    { flush: 'post' },
  )

  watch(
    () => {
      const media = options.mediaEl.value
      if (media instanceof HTMLImageElement)
        return media.currentSrc ?? media.src
      return media
    },
    requestSync,
  )

  if (import.meta.client) {
    layoutRefreshHandler = requestSync
    window.addEventListener('resize', layoutRefreshHandler, { passive: true })
    if (listenLayoutRefresh)
      window.addEventListener(STORY_SCROLL_LAYOUT_REFRESH_EVENT, layoutRefreshHandler)
  }

  onUnmounted(() => {
    if (layoutRefreshHandler) {
      window.removeEventListener('resize', layoutRefreshHandler)
      if (listenLayoutRefresh)
        window.removeEventListener(STORY_SCROLL_LAYOUT_REFRESH_EVENT, layoutRefreshHandler)
    }
    clearLayoutVars(options.layerEl.value, options.mediaMaxHeightVar, options.captionWidthVar)
  })

  return { syncLayout: requestSync }
}
