import type { Ref } from 'vue'
import {
  getStackLayerHoldScrollPx,
  getStackLayerPeelScrollPx,
  getStackTotalScrollPx,
  readFullscreenDwellVhFromCss,
  readFullscreenPeelScrubFromCss,
} from '#shared/utils/storyPanelScroll'
import { nextTick, onUnmounted, watch } from 'vue'

const LAYER_SELECTOR = '.story-fullscreen-stack__layer'
const RETRY_DELAY_MS = 400
const MAX_WAIT_MS = 15000

async function waitForStackLayersReady(
  stack: HTMLElement,
  expectedLayers: number,
): Promise<boolean> {
  const deadline = Date.now() + MAX_WAIT_MS

  function layerIsReady(layer: HTMLElement): boolean {
    const section = layer.querySelector('.story-section')
    if (!(section instanceof HTMLElement))
      return false

    const images = layer.querySelectorAll<HTMLImageElement>('img')
    if (images.length === 0)
      return true

    return [...images].every(img => img.complete)
  }

  while (Date.now() < deadline) {
    const layers = [...stack.querySelectorAll<HTMLElement>(LAYER_SELECTOR)]
    if (layers.length < expectedLayers) {
      await new Promise(resolve => setTimeout(resolve, 50))
      continue
    }

    if (!layers.every(layerIsReady)) {
      await new Promise(resolve => setTimeout(resolve, 50))
      continue
    }

    const pendingImages = [...stack.querySelectorAll<HTMLImageElement>('img')].filter(img => !img.complete)
    await Promise.all([...pendingImages].map((img) => {
      if (img.complete)
        return Promise.resolve()
      return new Promise<void>((resolve) => {
        img.addEventListener('load', () => resolve(), { once: true })
        img.addEventListener('error', () => resolve(), { once: true })
      })
    }))

    return true
  }

  return false
}

export function useStoryFullscreenStackScroll(
  stackRef: Ref<HTMLElement | null>,
  layerCount: Ref<number>,
  pinSpacingAfter: Ref<boolean>,
) {
  let teardown: (() => void) | null = null
  let initGeneration = 0
  let savedScrollProgress: number | null = null

  async function initStackScroll() {
    const generation = ++initGeneration

    const previousProgress = savedScrollProgress
    teardown?.()
    teardown = null

    if (!import.meta.client)
      return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return

    if (window.matchMedia('(max-width: 767px)').matches)
      return

    if (layerCount.value < 1)
      return

    await nextTick()

    if (generation !== initGeneration)
      return

    const stack = stackRef.value
    if (!stack)
      return

    const ready = await waitForStackLayersReady(stack, layerCount.value)
    if (generation !== initGeneration)
      return

    if (!ready) {
      setTimeout(() => {
        if (generation === initGeneration)
          void initStackScroll()
      }, RETRY_DELAY_MS)
      return
    }

    const { default: gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)

    if (generation !== initGeneration)
      return

    const layers = gsap.utils.toArray<HTMLElement>(LAYER_SELECTOR, stack)
    if (layers.length < 1)
      return

    const viewportHeight = window.innerHeight
    const dwellVh = readFullscreenDwellVhFromCss()
    const scrub = readFullscreenPeelScrubFromCss()
    const triggers: InstanceType<typeof ScrollTrigger>[] = []
    const holdPx = getStackLayerHoldScrollPx(viewportHeight)

    if (layers.length === 1) {
      triggers.push(ScrollTrigger.create({
        trigger: stack,
        start: 'top top',
        end: `+=${holdPx}`,
        pin: true,
        pinSpacing: pinSpacingAfter.value,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }))

      const onResize = () => ScrollTrigger.refresh()
      window.addEventListener('resize', onResize)
      ScrollTrigger.refresh()

      teardown = () => {
        window.removeEventListener('resize', onResize)
        triggers.forEach(t => t.kill())
      }
      return
    }

    const peelLayers = layers.slice(0, -1)
    const peelPx = getStackLayerPeelScrollPx(viewportHeight, dwellVh)
    const totalScroll = getStackTotalScrollPx(layers.length, viewportHeight, dwellVh)

    layers.forEach((layer) => {
      gsap.set(layer, { yPercent: 0, y: 0, visibility: 'visible' })
    })

    const timeline = gsap.timeline()
    let timelinePosition = 0

    function syncPeelLayerVisibility() {
      peelLayers.forEach((layer) => {
        const yPercent = Number(gsap.getProperty(layer, 'yPercent') ?? 0)
        gsap.set(layer, { visibility: yPercent <= -99.5 ? 'hidden' : 'visible' })
      })
    }

    peelLayers.forEach((layer) => {
      timelinePosition += holdPx / totalScroll
      timeline.to(layer, {
        yPercent: -100,
        ease: 'none',
        duration: peelPx / totalScroll,
      }, timelinePosition)
      timelinePosition += peelPx / totalScroll
    })

    const trigger = ScrollTrigger.create({
      trigger: stack,
      start: 'top top',
      end: `+=${totalScroll}`,
      pin: true,
      scrub,
      animation: timeline,
      pinSpacing: pinSpacingAfter.value,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate(self) {
        savedScrollProgress = self.progress
        syncPeelLayerVisibility()
      },
    })
    triggers.push(trigger)

    if (previousProgress != null && previousProgress > 0)
      trigger.scroll(trigger.start + (trigger.end - trigger.start) * previousProgress)

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)
    ScrollTrigger.refresh()
    syncPeelLayerVisibility()

    teardown = () => {
      savedScrollProgress = trigger.progress
      window.removeEventListener('resize', onResize)
      triggers.forEach(t => t.kill())
      layers.forEach(layer => gsap.set(layer, { clearProps: 'transform,visibility' }))
    }
  }

  watch(
    [stackRef, layerCount, pinSpacingAfter],
    () => {
      void initStackScroll()
    },
    { flush: 'post' },
  )

  onUnmounted(() => {
    teardown?.()
    teardown = null
    savedScrollProgress = null
  })
}
