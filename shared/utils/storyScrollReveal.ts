const SCROLL_REVEAL_SCROLL_PER_STEP_VH_DEFAULT = 2
const SCROLL_REVEAL_TEXT_START_RATIO_DEFAULT = 1 / 3
const SCROLL_REVEAL_IMAGE_HOLD_RATIO = 0.04
const SCROLL_REVEAL_TEXT_SCROLL_RATIO = 0.65
const SCROLL_REVEAL_TRANSITION_RATIO = 0.25
const SCROLL_REVEAL_SLIDE_TRANSITION_RATIO_DEFAULT = 0.5
const SCROLL_REVEAL_IMAGE_CROSSFADE_EASE = 'power2.inOut'

function readCssNumber(property: string, fallback: number): number {
  if (typeof document === 'undefined')
    return fallback

  const raw = getComputedStyle(document.documentElement).getPropertyValue(property).trim()
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function readScrollRevealTextStartOffsetPx(viewportHeight: number): number {
  const ratio = readCssNumber(
    '--story-scroll-reveal-text-start-ratio',
    SCROLL_REVEAL_TEXT_START_RATIO_DEFAULT,
  )
  return viewportHeight * ratio
}

export function readScrollRevealScrollPerStepPx(viewportHeight: number): number {
  const vh = readCssNumber(
    '--story-scroll-reveal-scroll-per-step-vh',
    SCROLL_REVEAL_SCROLL_PER_STEP_VH_DEFAULT,
  )
  return Math.round(viewportHeight * vh)
}

/** Scroll totale proporzionale all’altezza dello stream (testo continuo). */
export function getScrollRevealTotalScrollPx(
  streamHeight: number,
  viewportHeight: number,
): number {
  const vh = readCssNumber(
    '--story-scroll-reveal-scroll-per-step-vh',
    SCROLL_REVEAL_SCROLL_PER_STEP_VH_DEFAULT,
  )
  const startOffset = readScrollRevealTextStartOffsetPx(viewportHeight)
  const travelRatio = (streamHeight + startOffset) / viewportHeight
  return Math.round(viewportHeight * vh * travelRatio / 2)
}

export const SCROLL_REVEAL_TIMELINE = {
  imageHold: SCROLL_REVEAL_IMAGE_HOLD_RATIO,
  textScroll: SCROLL_REVEAL_TEXT_SCROLL_RATIO,
  transition: SCROLL_REVEAL_TRANSITION_RATIO,
} as const

export type ScrollRevealMediaTransition = 'fade' | 'slide'

export interface ScrollRevealTimelineOptions {
  mediaTransition?: ScrollRevealMediaTransition
}

export interface ScrollRevealTimelineResult {
  timeline: ReturnType<typeof import('gsap').default.timeline>
  boundaryProgress: number[]
}

export function readScrollRevealActiveIndex(
  progress: number,
  boundaryProgress: number[],
): number {
  if (boundaryProgress.length === 0)
    return 0

  let active = 0
  for (const boundary of boundaryProgress) {
    if (progress >= boundary)
      active++
    else
      break
  }

  return Math.min(active, boundaryProgress.length)
}

export function buildScrollRevealTimeline(
  gsap: typeof import('gsap').default,
  streamEl: HTMLElement,
  paragraphEls: HTMLElement[],
  mediaEls: HTMLElement[],
  viewportEl: HTMLElement,
  options: ScrollRevealTimelineOptions = {},
): ScrollRevealTimelineResult {
  const timeline = gsap.timeline({ defaults: { ease: 'none' } })
  const { imageHold, textScroll, transition } = SCROLL_REVEAL_TIMELINE
  const mediaTransition = options.mediaTransition ?? 'fade'
  const mediaTransitionDuration = mediaTransition === 'slide'
    ? readCssNumber(
        '--story-scroll-reveal-slide-transition-ratio',
        SCROLL_REVEAL_SLIDE_TRANSITION_RATIO_DEFAULT,
      )
    : transition
  const stepCount = paragraphEls.length

  const viewportHeight = viewportEl.clientHeight
  const streamHeight = streamEl.offsetHeight
  const startY = readScrollRevealTextStartOffsetPx(viewportHeight)
  const endY = -streamHeight
  const totalTravel = startY - endY
  const mainScrollDuration = textScroll * Math.max(stepCount, 1)
  const totalTimelineDuration = imageHold + mainScrollDuration

  gsap.set(streamEl, { y: startY })

  if (mediaTransition === 'slide') {
    gsap.set(mediaEls, { yPercent: 100, opacity: 1, visibility: 'visible' })
    mediaEls.forEach((el, index) => {
      gsap.set(el, { zIndex: index })
    })
    if (mediaEls[0])
      gsap.set(mediaEls[0], { yPercent: 0 })
  }
  else {
    gsap.set(mediaEls, { opacity: 0, visibility: 'visible' })
    if (mediaEls[0])
      gsap.set(mediaEls[0], { opacity: 1 })
  }

  const transitionMedia = (fromIndex: number, toIndex: number, at: number) => {
    const fromEl = mediaEls[fromIndex]
    const toEl = mediaEls[toIndex]
    if (!fromEl || !toEl)
      return

    if (mediaTransition === 'slide') {
      timeline.set(toEl, { yPercent: 100, opacity: 1 }, at)
      timeline.to(fromEl, {
        yPercent: -100,
        duration: mediaTransitionDuration,
        ease: SCROLL_REVEAL_IMAGE_CROSSFADE_EASE,
      }, at)
      timeline.to(toEl, {
        yPercent: 0,
        duration: mediaTransitionDuration,
        ease: SCROLL_REVEAL_IMAGE_CROSSFADE_EASE,
      }, at)
      return
    }

    timeline.to(fromEl, {
      opacity: 0,
      duration: transition,
      ease: SCROLL_REVEAL_IMAGE_CROSSFADE_EASE,
    }, at)
    timeline.to(toEl, {
      opacity: 1,
      duration: transition,
      ease: SCROLL_REVEAL_IMAGE_CROSSFADE_EASE,
    }, at)
  }

  let position = imageHold

  timeline.fromTo(
    streamEl,
    { y: startY },
    { y: endY, duration: mainScrollDuration },
    position,
  )

  const boundaryProgress: number[] = []

  for (let index = 0; index < stepCount - 1; index++) {
    const boundaryOffset = paragraphEls[index + 1]?.offsetTop ?? 0
    const scrollFraction = totalTravel > 0 ? boundaryOffset / totalTravel : 0
    const crossfadeAt = imageHold + scrollFraction * mainScrollDuration

    transitionMedia(index, index + 1, crossfadeAt)
    boundaryProgress.push(crossfadeAt / totalTimelineDuration)
  }

  return { timeline, boundaryProgress }
}
