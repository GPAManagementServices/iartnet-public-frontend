import type { Ref } from 'vue'
import {
  getFullscreenPinEndExtraPx,
  getNextStorySectionRenderer,
  isNaturalHeightStoryPanel,
  isSplitContentPanel,
  readFullscreenDwellVhFromCss,
  STORY_SCROLL_LAYOUT_REFRESH_EVENT,
} from '#shared/utils/storyPanelScroll'
import { nextTick, onUnmounted, watch } from 'vue'

const PINNED_PANEL_SELECTOR = '.story-section-renderer.panel:not(.story-section-renderer--natural-height):not(.story-section-renderer--in-fullscreen-stack):not(.story-section-renderer--iif-annotations)'

export function useStoryPanelScroll(
  rootRef: Ref<HTMLElement | null>,
  sectionsReady: Ref<unknown[] | null | undefined>,
) {
  let teardown: (() => void) | null = null
  let initGeneration = 0

  async function initPanelScroll() {
    const generation = ++initGeneration

    teardown?.()
    teardown = null

    if (!import.meta.client)
      return

    const sections = sectionsReady.value
    if (!sections?.length || !rootRef.value)
      return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return

    if (window.matchMedia('(max-width: 767px)').matches)
      return

    await nextTick()

    if (generation !== initGeneration)
      return

    const root = rootRef.value
    if (!root)
      return

    const { default: gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)

    if (generation !== initGeneration)
      return

    const pinnedPanels = gsap.utils.toArray<HTMLElement>(PINNED_PANEL_SELECTOR, root)
    const allPanels = gsap.utils.toArray<HTMLElement>('.story-section-renderer.panel', root)
    if (!pinnedPanels.length)
      return

    const viewportHeight = window.innerHeight
    const dwellVh = readFullscreenDwellVhFromCss()
    const triggers: InstanceType<typeof ScrollTrigger>[] = []

    pinnedPanels.forEach((panel) => {
      const panelIndex = allPanels.indexOf(panel)
      const isLastPanel = panelIndex === allPanels.length - 1
      const nextInDom = getNextStorySectionRenderer(panel)
      const nextIsSplitContent = isSplitContentPanel(nextInDom)
      const pinEndExtraPx = getFullscreenPinEndExtraPx(
        panel,
        viewportHeight,
        dwellVh,
      )

      panel.style.zIndex = String(panelIndex + 1)

      triggers.push(ScrollTrigger.create({
        trigger: panel,
        start: 'top top',
        end: pinEndExtraPx != null ? `bottom top+=${pinEndExtraPx}` : 'bottom top',
        pin: true,
        pinSpacing: isLastPanel || nextIsSplitContent || isNaturalHeightStoryPanel(nextInDom),
        anticipatePin: 1,
      }))
    })

    const onResize = () => ScrollTrigger.refresh()
    const onLayoutRefresh = () => ScrollTrigger.refresh()

    window.addEventListener('resize', onResize)
    window.addEventListener(STORY_SCROLL_LAYOUT_REFRESH_EVENT, onLayoutRefresh)

    ScrollTrigger.refresh()

    teardown = () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener(STORY_SCROLL_LAYOUT_REFRESH_EVENT, onLayoutRefresh)
      triggers.forEach(trigger => trigger.kill())
    }
  }

  watch(
    [sectionsReady, rootRef],
    () => {
      void initPanelScroll()
    },
    { flush: 'post' },
  )

  onUnmounted(() => {
    teardown?.()
    teardown = null
  })
}
