import type { Ref } from 'vue'
import {
  clearStackCssPinScrollProgress,
  computeStackPeelCssMotionState,
  readStackCssPinScrollProgress,
} from '#shared/utils/storyStackPeelCssMotion'
import { requestStoryScrollLayoutRefresh, STORY_SCROLL_LAYOUT_REFRESH_EVENT } from '#shared/utils/storyPanelScroll'
import { onUnmounted, ref, watch } from 'vue'

const LAYER_SELECTOR = '.story-fullscreen-stack__layer'
const PIN_HOST_SELECTOR = '.story-stack-pin-host'

function motionAllowed(): boolean {
  if (!import.meta.client)
    return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return false
  if (window.matchMedia('(max-width: 767px)').matches)
    return false
  return true
}

function getScrollHost(stack: HTMLElement): HTMLElement {
  const pinHost = stack.closest(PIN_HOST_SELECTOR)
  return pinHost instanceof HTMLElement ? pinHost : stack
}

function invalidateStackScrollProgress(stack: HTMLElement) {
  clearStackCssPinScrollProgress(getScrollHost(stack))
  clearLayerMotionStyles(stack)
}

function clearLayerMotionStyles(stack: HTMLElement) {
  stack.querySelectorAll<HTMLElement>(LAYER_SELECTOR).forEach((layer) => {
    layer.style.removeProperty('transform')
    layer.style.removeProperty('visibility')
    layer.style.removeProperty('opacity')
    layer.querySelectorAll<HTMLElement>('.story-split-image__video').forEach((el) => {
      el.style.removeProperty('opacity')
      el.style.removeProperty('visibility')
    })
  })
}

function clearStackMotionArtifacts(stack: HTMLElement) {
  clearLayerMotionStyles(stack)

  const scrollHost = getScrollHost(stack)
  scrollHost.style.removeProperty('--story-stack-scroll-px')
  clearStackCssPinScrollProgress(scrollHost)
}

/**
 * CSS scroll motion for fullscreen stack peel (≈ GSAP pin + yPercent peel).
 */
export function useCssStackPeelMotion(
  stackRef: Ref<HTMLElement | null>,
  enabled: Ref<boolean>,
  layerCount: Ref<number>,
  videoLayerIndices: Ref<Set<number>>,
) {
  const pinOffscreen = ref(false)
  let rafId = 0
  let listening = false
  let layoutRefreshHandler: (() => void) | null = null

  function applyMotionState() {
    rafId = 0

    const stack = stackRef.value
    if (!stack || !enabled.value || !motionAllowed())
      return

    const count = layerCount.value
    if (count < 1)
      return

    const layers = [...stack.querySelectorAll<HTMLElement>(LAYER_SELECTOR)]
    if (layers.length < count) {
      clearLayerMotionStyles(stack)
      return
    }

    const viewportHeight = window.innerHeight
    if (viewportHeight <= 0)
      return

    const pinHost = stack.closest(PIN_HOST_SELECTOR)
    const scrollHost = getScrollHost(stack)

    const state = computeStackPeelCssMotionState(
      0,
      count,
      viewportHeight,
      videoLayerIndices.value,
    )

    if (pinHost instanceof HTMLElement)
      pinHost.style.setProperty('--story-stack-scroll-px', `${state.totalScrollPx}px`)
    else
      stack.style.setProperty('--story-stack-scroll-px', `${state.totalScrollPx}px`)

    const progress = readStackCssPinScrollProgress(scrollHost, state.totalScrollPx)
    const motion = computeStackPeelCssMotionState(
      progress,
      count,
      viewportHeight,
      videoLayerIndices.value,
    )

    const hostRect = scrollHost.getBoundingClientRect()
    pinOffscreen.value = hostRect.bottom < 0

    layers.forEach((layer, index) => {
      const yPercent = motion.layerYPercent[index] ?? 0
      const isVideoLayer = videoLayerIndices.value.has(index)

      layer.style.transform = `translate3d(0, ${yPercent}%, 0)`

      if (isVideoLayer) {
        layer.style.removeProperty('visibility')
        const videoEl = layer.querySelector<HTMLElement>('.story-split-image__video')
        if (videoEl) {
          const opacity = motion.layerOpacity[index] ?? 1
          videoEl.style.opacity = String(opacity)
          videoEl.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible'
        }
        if (yPercent <= -99.5)
          layer.style.visibility = 'hidden'
      }
      else {
        layer.style.visibility = yPercent <= -99.5 ? 'hidden' : 'visible'
      }
    })
  }

  function requestUpdate() {
    if (rafId !== 0)
      return
    rafId = window.requestAnimationFrame(applyMotionState)
  }

  function onScroll() {
    requestUpdate()
  }

  function onResize() {
    if (!enabled.value || !stackRef.value)
      return

    if (!motionAllowed()) {
      detach()
      return
    }

    if (!listening) {
      initMotion()
      return
    }

    invalidateStackScrollProgress(stackRef.value)
    pinOffscreen.value = false
    requestStoryScrollLayoutRefresh()
    requestUpdate()
  }

  function attach() {
    if (listening)
      return
    listening = true
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    layoutRefreshHandler = () => requestUpdate()
    window.addEventListener(STORY_SCROLL_LAYOUT_REFRESH_EVENT, layoutRefreshHandler)
    requestUpdate()
  }

  function detach() {
    if (listening) {
      listening = false
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (layoutRefreshHandler) {
        window.removeEventListener(STORY_SCROLL_LAYOUT_REFRESH_EVENT, layoutRefreshHandler)
        layoutRefreshHandler = null
      }
    }

    if (rafId !== 0) {
      window.cancelAnimationFrame(rafId)
      rafId = 0
    }

    const stack = stackRef.value
    if (stack)
      clearStackMotionArtifacts(stack)

    pinOffscreen.value = false
  }

  function initMotion() {
    detach()

    const stack = stackRef.value
    if (!stack || !enabled.value || !motionAllowed())
      return

    invalidateStackScrollProgress(stack)

    attach()
    requestUpdate()
  }

  watch(
    [stackRef, enabled, layerCount, videoLayerIndices],
    () => initMotion(),
    { flush: 'post' },
  )

  onUnmounted(() => {
    detach()
  })

  return { pinOffscreen }
}
