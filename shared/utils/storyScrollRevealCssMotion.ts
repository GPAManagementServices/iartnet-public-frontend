import {
  getScrollRevealTotalScrollPx,
  readScrollRevealActiveIndex,
  readScrollRevealTextStartOffsetPx,
  SCROLL_REVEAL_TIMELINE,
} from '#shared/utils/storyScrollReveal'

export interface ScrollRevealCssMotionState {
  streamTranslateY: number
  mediaOpacities: number[]
  activeIndex: number
  travelPx: number
  boundaryProgress: number[]
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

/** Pin start scrollY per pin-host (sticky layout keeps top≈0; progress uses scroll delta). */
const pinStartScrollYByHost = new WeakMap<HTMLElement, number>()

/**
 * Scroll progress through a pinned ScrollReveal pin-host (0–1 over `travelPx`).
 */
export function readScrollRevealCssPinScrollProgress(
  pinHostEl: HTMLElement,
  travelPx: number,
): number {
  if (travelPx <= 0)
    return 1

  const top = pinHostEl.getBoundingClientRect().top
  if (top > 0) {
    pinStartScrollYByHost.delete(pinHostEl)
    return 0
  }

  let pinStart = pinStartScrollYByHost.get(pinHostEl)
  if (pinStart === undefined) {
    pinStart = window.scrollY
    pinStartScrollYByHost.set(pinHostEl, pinStart)
  }

  return Math.max(0, Math.min(1, (window.scrollY - pinStart) / travelPx))
}

export function clearScrollRevealCssPinScrollProgress(pinHostEl: HTMLElement) {
  pinStartScrollYByHost.delete(pinHostEl)
}

export function computeScrollRevealCssMotionState(
  scrollProgress: number,
  viewportHeight: number,
  streamHeight: number,
  paragraphOffsets: number[],
  stepCount: number,
): ScrollRevealCssMotionState {
  const { imageHold, textScroll, transition } = SCROLL_REVEAL_TIMELINE
  const mainScrollDuration = textScroll * Math.max(stepCount, 1)
  const totalTimelineDuration = imageHold + mainScrollDuration

  const startY = readScrollRevealTextStartOffsetPx(viewportHeight)
  const endY = -streamHeight
  const totalTravel = startY - endY
  const travelPx = getScrollRevealTotalScrollPx(streamHeight, viewportHeight)

  const timelineT = scrollProgress * totalTimelineDuration

  let streamTranslateY = startY
  if (timelineT > imageHold) {
    const scrollT = Math.min(timelineT - imageHold, mainScrollDuration)
    const scrollFraction = mainScrollDuration > 0 ? scrollT / mainScrollDuration : 1
    streamTranslateY = startY + scrollFraction * (endY - startY)
  }

  const mediaOpacities = new Array(stepCount).fill(0)
  const boundaryProgress: number[] = []

  if (stepCount === 0) {
    return {
      streamTranslateY,
      mediaOpacities,
      activeIndex: 0,
      travelPx,
      boundaryProgress,
    }
  }

  if (stepCount === 1) {
    mediaOpacities[0] = 1
    return {
      streamTranslateY,
      mediaOpacities,
      activeIndex: 0,
      travelPx,
      boundaryProgress,
    }
  }

  let active = 0

  for (let index = 0; index < stepCount - 1; index++) {
    const boundaryOffset = paragraphOffsets[index] ?? 0
    const scrollFraction = totalTravel > 0 ? boundaryOffset / totalTravel : 0
    const crossfadeAt = imageHold + scrollFraction * mainScrollDuration
    boundaryProgress.push(crossfadeAt / totalTimelineDuration)

    if (timelineT < crossfadeAt) {
      mediaOpacities[active] = 1
      break
    }

    if (timelineT < crossfadeAt + transition) {
      const fadeT = (timelineT - crossfadeAt) / transition
      const eased = easeInOut(fadeT)
      mediaOpacities[index] = 1 - eased
      mediaOpacities[index + 1] = eased
      active = eased >= 0.5 ? index + 1 : index
      break
    }

    active = index + 1
  }

  if (mediaOpacities.every(opacity => opacity === 0))
    mediaOpacities[active] = 1

  const activeIndex = readScrollRevealActiveIndex(scrollProgress, boundaryProgress)

  return {
    streamTranslateY,
    mediaOpacities,
    activeIndex,
    travelPx,
    boundaryProgress,
  }
}
