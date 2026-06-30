import type { Ref } from 'vue'
import {
  clearScrollRevealCssPinScrollProgress,
  computeScrollRevealCssMotionState,
  readScrollRevealCssPinScrollProgress,
} from '#shared/utils/storyScrollRevealCssMotion'
import { STORY_SCROLL_LAYOUT_REFRESH_EVENT } from '#shared/utils/storyPanelScroll'
import { onUnmounted, ref, watch } from 'vue'

const IMAGE_WAIT_MS = 4000

function motionAllowed(): boolean {
  if (!import.meta.client)
    return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return false
  if (window.matchMedia('(max-width: 767px)').matches)
    return false
  return true
}

async function waitForSectionImages(section: HTMLElement): Promise<void> {
  const images = [...section.querySelectorAll<HTMLImageElement>('img')]
  if (!images.length)
    return

  const deadline = Date.now() + IMAGE_WAIT_MS

  await Promise.all(images.map((img) => {
    if (img.complete)
      return Promise.resolve()

    return new Promise<void>((resolve) => {
      const done = () => resolve()
      img.addEventListener('load', done, { once: true })
      img.addEventListener('error', done, { once: true })

      const remaining = deadline - Date.now()
      if (remaining <= 0)
        resolve()
      else
        setTimeout(resolve, remaining)
    })
  }))
}

function clearInlineMotionStyles(section: HTMLElement) {
  const streamEl = section.querySelector<HTMLElement>('.story-scroll-reveal__text-stream')
  if (streamEl)
    streamEl.style.removeProperty('transform')

  section.querySelectorAll<HTMLElement>('.story-scroll-reveal__media-layer').forEach((el) => {
    el.style.removeProperty('opacity')
    el.style.removeProperty('visibility')
    el.style.removeProperty('pointer-events')
  })
}

function clearMotionStyles(section: HTMLElement) {
  const renderer = section.closest('.story-section-renderer')
  const pinHost = renderer?.closest('.story-scroll-reveal-pin-host')
  if (pinHost instanceof HTMLElement)
    pinHost.style.removeProperty('--story-scroll-reveal-travel-px')
  if (renderer instanceof HTMLElement) {
    renderer.classList.remove('story-scroll-reveal-renderer--offscreen')
    if (pinHost instanceof HTMLElement)
      clearScrollRevealCssPinScrollProgress(pinHost)
  }
  clearInlineMotionStyles(section)
}

/**
 * CSS scroll motion for ScrollReveal (≈ GSAP pin + text stream + image crossfade).
 */
export function useCssScrollRevealMotion(
  enabled: Ref<boolean>,
  sectionRef: Ref<HTMLElement | null>,
  layoutRef: Ref<HTMLElement | null>,
  stepCount: Ref<number>,
) {
  const activeIndex = ref(0)
  let rafId = 0
  let listening = false
  let initGeneration = 0
  let layoutRefreshHandler: (() => void) | null = null

  function applyMotionState() {
    rafId = 0

    const section = sectionRef.value
    if (!section || !enabled.value || !motionAllowed())
      return

    const viewport = section.querySelector<HTMLElement>('.story-scroll-reveal__text-viewport')
    const streamEl = section.querySelector<HTMLElement>('.story-scroll-reveal__text-stream')
    if (!viewport || !streamEl)
      return

    const count = stepCount.value
    if (count < 2)
      return

    const paragraphEls = [...section.querySelectorAll<HTMLElement>('.story-scroll-reveal__step-text')]
    if (paragraphEls.length < 2)
      return

    const mediaEls = [...section.querySelectorAll<HTMLElement>('.story-scroll-reveal__media-layer')]

    const viewportHeight = viewport.clientHeight
    const streamHeight = streamEl.offsetHeight
    if (viewportHeight <= 0 || streamHeight <= 0)
      return

    const paragraphOffsets = paragraphEls.slice(1).map(el => el.offsetTop)
    const travelState = computeScrollRevealCssMotionState(
      0,
      viewportHeight,
      streamHeight,
      paragraphOffsets,
      count,
    )

    const renderer = section.closest('.story-section-renderer')
    const pinHost = renderer?.closest('.story-scroll-reveal-pin-host')
    if (pinHost instanceof HTMLElement)
      pinHost.style.setProperty('--story-scroll-reveal-travel-px', `${travelState.travelPx}px`)

    const scrollProgress = pinHost instanceof HTMLElement
      ? readScrollRevealCssPinScrollProgress(pinHost, travelState.travelPx)
      : 0

    if (renderer instanceof HTMLElement) {
      const hostRect = pinHost instanceof HTMLElement
        ? pinHost.getBoundingClientRect()
        : renderer.getBoundingClientRect()
      renderer.classList.toggle(
        'story-scroll-reveal-renderer--offscreen',
        hostRect.bottom < 0,
      )
    }

    const state = computeScrollRevealCssMotionState(
      scrollProgress,
      viewportHeight,
      streamHeight,
      paragraphOffsets,
      count,
    )

    streamEl.style.transform = `translate3d(0, ${state.streamTranslateY}px, 0)`

    mediaEls.forEach((el) => {
      const index = Number.parseInt(el.dataset.paragraphIndex ?? '', 10)
      const opacity = Number.isFinite(index)
        ? state.mediaOpacities[index] ?? 0
        : 0
      el.style.opacity = String(opacity)
      el.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible'
      el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none'
    })

    activeIndex.value = state.activeIndex
  }

  function requestUpdate() {
    if (rafId !== 0)
      return
    rafId = window.requestAnimationFrame(applyMotionState)
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
    const section = sectionRef.value
    if (section)
      clearInlineMotionStyles(section)
    activeIndex.value = 0
  }

  async function initMotion() {
    const generation = ++initGeneration

    detach()

    if (!enabled.value || !motionAllowed())
      return

    const section = sectionRef.value
    if (!section || !layoutRef.value)
      return

    const renderer = section.closest('.story-section-renderer')
    const pinHost = renderer?.closest('.story-scroll-reveal-pin-host')
    if (pinHost instanceof HTMLElement)
      clearScrollRevealCssPinScrollProgress(pinHost)

    attach()
    requestUpdate()

    await waitForSectionImages(section)

    if (generation !== initGeneration)
      return

    requestUpdate()
  }

  watch(
    [enabled, sectionRef, layoutRef, stepCount],
    () => {
      void initMotion()
    },
    { flush: 'post' },
  )

  onUnmounted(() => {
    detach()
    const section = sectionRef.value
    if (section)
      clearMotionStyles(section)
    initGeneration++
  })

  return { activeIndex }
}
