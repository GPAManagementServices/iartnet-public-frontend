import type { Ref } from 'vue'
import {
  buildScrollRevealTimeline,
  getScrollRevealTotalScrollPx,
  readScrollRevealActiveIndex,
  type ScrollRevealMediaTransition,
} from '#shared/utils/storyScrollReveal'
import { requestStoryScrollLayoutRefresh } from '#shared/utils/storyPanelScroll'
import { nextTick, onUnmounted, ref, watch } from 'vue'

async function waitForSectionImages(section: HTMLElement): Promise<void> {
  const images = [...section.querySelectorAll<HTMLImageElement>('img')]
  if (!images.length)
    return

  await Promise.all(images.map((img) => {
    if (img.complete)
      return Promise.resolve()
    return new Promise<void>((resolve) => {
      img.addEventListener('load', () => resolve(), { once: true })
      img.addEventListener('error', () => resolve(), { once: true })
    })
  }))
}

export function useStoryScrollRevealScroll(
  enabled: Ref<boolean>,
  sectionRef: Ref<HTMLElement | null>,
  layoutRef: Ref<HTMLElement | null>,
  stepCount: Ref<number>,
  options: { mediaTransition?: ScrollRevealMediaTransition } = {},
) {
  const activeIndex = ref(0)
  let teardown: (() => void) | null = null
  let initGeneration = 0

  async function initScrollReveal() {
    const generation = ++initGeneration

    teardown?.()
    teardown = null
    activeIndex.value = 0

    if (!import.meta.client || !enabled.value)
      return

    await nextTick()

    if (generation !== initGeneration)
      return

    const section = sectionRef.value
    const layout = layoutRef.value
    const count = stepCount.value

    if (!section || !layout || count < 2)
      return

    const viewport = section.querySelector<HTMLElement>('.story-scroll-reveal__text-viewport')
    const streamEl = section.querySelector<HTMLElement>('.story-scroll-reveal__text-stream')
    if (!viewport || !streamEl)
      return

    const paragraphEls = [...section.querySelectorAll<HTMLElement>('.story-scroll-reveal__step-text')]
    const mediaEls = [...section.querySelectorAll<HTMLElement>('.story-scroll-reveal__media-layer')]

    if (paragraphEls.length === 0 && mediaEls.length < count)
      return

    await waitForSectionImages(section)

    if (generation !== initGeneration)
      return

    const { default: gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)

    if (generation !== initGeneration)
      return

    const { timeline, boundaryProgress } = buildScrollRevealTimeline(
      gsap,
      streamEl,
      paragraphEls,
      mediaEls,
      viewport,
      { mediaTransition: options.mediaTransition },
    )
    const totalScrollPx = getScrollRevealTotalScrollPx(
      streamEl.offsetHeight,
      viewport.clientHeight,
    )
    const triggers: InstanceType<typeof ScrollTrigger>[] = []

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${totalScrollPx}`,
      pin: layout,
      scrub: true,
      animation: timeline,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate(self) {
        activeIndex.value = readScrollRevealActiveIndex(self.progress, boundaryProgress)
      },
    })
    triggers.push(trigger)

    activeIndex.value = readScrollRevealActiveIndex(trigger.progress, boundaryProgress)

    const onResize = () => {
      void initScrollReveal()
    }
    window.addEventListener('resize', onResize)
    ScrollTrigger.refresh()
    requestStoryScrollLayoutRefresh()

    teardown = () => {
      window.removeEventListener('resize', onResize)
      triggers.forEach(t => t.kill(true))
      timeline.kill()
      gsap.set(streamEl, { clearProps: 'transform' })
      gsap.set(mediaEls, { clearProps: 'opacity,visibility,transform,y,yPercent,zIndex' })
    }
  }

  watch(
    [enabled, sectionRef, layoutRef, stepCount],
    () => {
      void initScrollReveal()
    },
    { flush: 'post' },
  )

  onUnmounted(() => {
    teardown?.()
    teardown = null
  })

  return { activeIndex }
}
