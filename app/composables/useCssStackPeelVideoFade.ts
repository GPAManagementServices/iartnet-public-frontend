import type { Ref } from 'vue'
import { STORY_SCROLL_LAYOUT_REFRESH_EVENT } from '#shared/utils/storyPanelScroll'
import { onUnmounted, watch } from 'vue'

const VIDEO_LAYER_SELECTOR = '.story-fullscreen-stack__layer--video:not(:last-child)'
const VIDEO_TARGET_SELECTOR = '.story-split-image__video'

function motionAllowed(): boolean {
  if (!import.meta.client)
    return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return false
  if (window.matchMedia('(max-width: 767px)').matches)
    return false
  return true
}

function clearVideoFadeStyles(stack: HTMLElement) {
  stack.querySelectorAll<HTMLElement>(VIDEO_TARGET_SELECTOR).forEach((el) => {
    el.style.removeProperty('opacity')
    el.style.removeProperty('visibility')
  })
}

/**
 * Scroll-linked video fade for CSS stack peel (≈ GSAP autoAlpha on video layers).
 * Fades video only while the next sticky layer rises into view; no transform on iframe parents.
 */
export function useCssStackPeelVideoFade(
  stackRef: Ref<HTMLElement | null>,
  enabled: Ref<boolean>,
) {
  let rafId = 0
  let listening = false
  let layoutRefreshHandler: (() => void) | null = null

  function updateFade() {
    rafId = 0
    const stack = stackRef.value
    if (!stack || !enabled.value || !motionAllowed())
      return

    const viewportHeight = window.innerHeight
    if (viewportHeight <= 0)
      return

    stack.querySelectorAll<HTMLElement>(VIDEO_LAYER_SELECTOR).forEach((layer) => {
      const nextLayer = layer.nextElementSibling
      if (!(nextLayer instanceof HTMLElement))
        return

      const videoEl = layer.querySelector<HTMLElement>(VIDEO_TARGET_SELECTOR)
      if (!videoEl)
        return

      const layerTop = layer.getBoundingClientRect().top
      const nextTop = nextLayer.getBoundingClientRect().top

      // Stack not pinned yet — leave default visibility (no forced opacity 0).
      if (layerTop > 0) {
        videoEl.style.removeProperty('opacity')
        videoEl.style.removeProperty('visibility')
        return
      }

      // Hold: next layer still below viewport — video fully visible.
      if (nextTop >= viewportHeight) {
        videoEl.style.opacity = '1'
        videoEl.style.visibility = 'visible'
        return
      }

      // Peel: fade as next layer rises (nextTop: vh → 0).
      if (nextTop > 0) {
        const opacity = nextTop / viewportHeight
        videoEl.style.opacity = String(opacity)
        videoEl.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible'
        return
      }

      videoEl.style.opacity = '0'
      videoEl.style.visibility = 'hidden'
    })
  }

  function requestUpdate() {
    if (rafId !== 0)
      return
    rafId = window.requestAnimationFrame(updateFade)
  }

  function onScroll() {
    requestUpdate()
  }

  function attach() {
    if (listening)
      return
    listening = true
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    layoutRefreshHandler = () => requestUpdate()
    window.addEventListener(STORY_SCROLL_LAYOUT_REFRESH_EVENT, layoutRefreshHandler)
    requestUpdate()
  }

  function detach() {
    if (!listening)
      return
    listening = false
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    if (layoutRefreshHandler) {
      window.removeEventListener(STORY_SCROLL_LAYOUT_REFRESH_EVENT, layoutRefreshHandler)
      layoutRefreshHandler = null
    }
    if (rafId !== 0) {
      window.cancelAnimationFrame(rafId)
      rafId = 0
    }
    const stack = stackRef.value
    if (stack)
      clearVideoFadeStyles(stack)
  }

  watch(
    [stackRef, enabled],
    () => {
      detach()
      if (enabled.value && stackRef.value && motionAllowed())
        attach()
    },
    { flush: 'post' },
  )

  onUnmounted(detach)
}
