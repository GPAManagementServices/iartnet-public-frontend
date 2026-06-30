import type { SectionKind } from '#shared/types/api'

export const STORY_IMAGE_FULLSCREEN_DWELL_VH_DEFAULT = 0.75

/** Dopo mount async (es. IIIF/OSD): ricalcola pin spacer ScrollTrigger. */
export const STORY_SCROLL_LAYOUT_REFRESH_EVENT = 'iartnet:story-scroll-layout-refresh'

export function requestStoryScrollLayoutRefresh() {
  if (typeof window !== 'undefined')
    window.dispatchEvent(new CustomEvent(STORY_SCROLL_LAYOUT_REFRESH_EVENT))
}

export function getNextStorySectionRenderer(panel: HTMLElement): HTMLElement | null {
  let next = panel.nextElementSibling
  while (next) {
    if (next instanceof HTMLElement) {
      if (next.classList.contains('story-section-renderer'))
        return next
      if (next.classList.contains('story-fullscreen-stack')) {
        const firstRenderer = next.querySelector('.story-section-renderer')
        if (firstRenderer instanceof HTMLElement)
          return firstRenderer
      }
    }
    next = next.nextElementSibling
  }
  return null
}

export function isNaturalHeightStoryPanel(panel: HTMLElement | null): boolean {
  return panel?.classList.contains('story-section-renderer--natural-height') ?? false
}

export function isSplitContentPanel(panel: HTMLElement | null): boolean {
  return panel?.classList.contains('story-section-renderer--split-content') ?? false
}

export function readPanelSectionKind(element: HTMLElement | null | undefined): SectionKind | undefined {
  if (!element)
    return undefined
  const kind = element.dataset.sectionKind
  if (!kind)
    return undefined
  return kind as SectionKind
}

export function isFullscreenFollowedByFullscreen(panel: HTMLElement): boolean {
  const current = readPanelSectionKind(panel)
  const next = readPanelSectionKind(getNextStorySectionRenderer(panel))
  return current === 'ImageFullScreen' && next === 'ImageFullScreen'
}

export function getFullscreenPinEndExtraPx(
  panel: HTMLElement,
  viewportHeight: number,
  dwellVh = STORY_IMAGE_FULLSCREEN_DWELL_VH_DEFAULT,
): number | null {
  if (!isFullscreenFollowedByFullscreen(panel))
    return null
  return Math.round(viewportHeight * dwellVh)
}

/** Scroll distance (px) while one fullscreen layer peels away in a stack. */
export function getFullscreenPeelScrollPx(
  panel: HTMLElement,
  viewportHeight: number,
  dwellVh = STORY_IMAGE_FULLSCREEN_DWELL_VH_DEFAULT,
): number {
  const dwellExtra = getFullscreenPinEndExtraPx(panel, viewportHeight, dwellVh)
  return viewportHeight + (dwellExtra ?? 0)
}

/** Viewport hold (px) on each fullscreen image before the next peel in a stack. */
export function getStackLayerHoldScrollPx(viewportHeight: number): number {
  return viewportHeight
}

/** Scroll distance (px) for one peel transition inside a fullscreen stack. */
export function getStackLayerPeelScrollPx(
  viewportHeight: number,
  dwellVh = STORY_IMAGE_FULLSCREEN_DWELL_VH_DEFAULT,
): number {
  return Math.round(viewportHeight * dwellVh)
}

/** Total pinned scroll (px) for a fullscreen stack of `layerCount` images. */
export function getStackTotalScrollPx(
  layerCount: number,
  viewportHeight: number,
  dwellVh = STORY_IMAGE_FULLSCREEN_DWELL_VH_DEFAULT,
): number {
  if (layerCount < 2)
    return viewportHeight

  const holdPx = getStackLayerHoldScrollPx(viewportHeight)
  const peelPx = getStackLayerPeelScrollPx(viewportHeight, dwellVh)
  const peelCount = layerCount - 1
  return peelCount * (holdPx + peelPx) + holdPx
}

function readCssNumber(property: string, fallback: number): number {
  if (typeof document === 'undefined')
    return fallback

  const raw = getComputedStyle(document.documentElement).getPropertyValue(property).trim()
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function readFullscreenDwellVhFromCss(): number {
  return readCssNumber(
    '--story-image-fullscreen-dwell-vh',
    STORY_IMAGE_FULLSCREEN_DWELL_VH_DEFAULT,
  )
}

export function readFullscreenPeelScrubFromCss(): number | boolean {
  if (typeof document === 'undefined')
    return true

  const raw = getComputedStyle(document.documentElement).getPropertyValue('--story-fullscreen-peel-scrub').trim()
  if (!raw)
    return true

  const parsed = Number.parseFloat(raw)
  if (!Number.isFinite(parsed))
    return true

  return parsed <= 0 ? true : parsed
}
