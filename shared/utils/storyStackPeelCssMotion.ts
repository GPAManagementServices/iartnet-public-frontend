import {
  getStackLayerHoldScrollPx,
  getStackLayerPeelScrollPx,
  getStackTotalScrollPx,
  readFullscreenDwellVhFromCss,
} from '#shared/utils/storyPanelScroll'

export interface StackPeelCssMotionState {
  totalScrollPx: number
  holdPx: number
  peelPx: number
  layerYPercent: number[]
  layerOpacity: number[]
}

const pinStartScrollYByStack = new WeakMap<HTMLElement, number>()

export function readStackCssPinScrollProgress(
  stackEl: HTMLElement,
  totalScrollPx: number,
): number {
  if (totalScrollPx <= 0)
    return 1

  const top = stackEl.getBoundingClientRect().top
  if (top > 0) {
    pinStartScrollYByStack.delete(stackEl)
    return 0
  }

  let pinStart = pinStartScrollYByStack.get(stackEl)
  if (pinStart === undefined) {
    pinStart = top >= 0 ? window.scrollY : window.scrollY + top
    pinStartScrollYByStack.set(stackEl, pinStart)
  }

  return Math.max(0, Math.min(1, (window.scrollY - pinStart) / totalScrollPx))
}

export function clearStackCssPinScrollProgress(stackEl: HTMLElement) {
  pinStartScrollYByStack.delete(stackEl)
}

/**
 * Layer yPercent / opacity for CSS stack peel (≈ GSAP yPercent -100 per layer).
 */
export function computeStackPeelCssMotionState(
  progress: number,
  layerCount: number,
  viewportHeight: number,
  videoLayerIndices: Set<number> = new Set(),
): StackPeelCssMotionState {
  const dwellVh = readFullscreenDwellVhFromCss()
  const holdPx = getStackLayerHoldScrollPx(viewportHeight)
  const peelPx = getStackLayerPeelScrollPx(viewportHeight, dwellVh)
  const totalScrollPx = getStackTotalScrollPx(layerCount, viewportHeight, dwellVh)

  const layerYPercent = new Array(layerCount).fill(0)
  const layerOpacity = new Array(layerCount).fill(1)

  if (layerCount < 2) {
    return { totalScrollPx, holdPx, peelPx, layerYPercent, layerOpacity }
  }

  const peelLayerCount = layerCount - 1
  const segmentFrac = (holdPx + peelPx) / totalScrollPx
  const holdFrac = holdPx / totalScrollPx
  const peelFrac = peelPx / totalScrollPx

  for (let index = 0; index < peelLayerCount; index++) {
    const holdStart = index * segmentFrac
    const peelStart = holdStart + holdFrac
    const peelEnd = peelStart + peelFrac

    let yPercent = 0
    if (progress >= peelEnd)
      yPercent = -100
    else if (progress > peelStart)
      yPercent = -100 * ((progress - peelStart) / peelFrac)

    layerYPercent[index] = yPercent

    if (videoLayerIndices.has(index))
      layerOpacity[index] = Math.max(0, 1 + yPercent / 100)
    else if (yPercent <= -99.5)
      layerOpacity[index] = 0
  }

  return { totalScrollPx, holdPx, peelPx, layerYPercent, layerOpacity }
}
