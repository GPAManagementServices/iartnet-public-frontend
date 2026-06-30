import type { TStoryImageType } from '#shared/types/api'

export function trimStoryBgColor(value: string | null | undefined): string | null {
  if (typeof value !== 'string')
    return null
  const trimmed = value.trim()
  return trimmed || null
}

/** CMS emits `rgb(r,g,b,a)` — normalize to valid CSS `rgba(...)`. */
export function normalizeStoryCssColor(value: string | null | undefined): string | null {
  const trimmed = trimStoryBgColor(value)
  if (!trimmed)
    return null

  const rgbWithAlpha = trimmed.match(
    /^rgb\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i,
  )
  if (rgbWithAlpha)
    return `rgba(${rgbWithAlpha[1]}, ${rgbWithAlpha[2]}, ${rgbWithAlpha[3]}, ${rgbWithAlpha[4]})`

  return trimmed
}

const SECTION_FORE_COLOR_KEYS = [
  'foreColor',
  'ForeColor',
  'FontColor',
  'fontColor',
] as const

export function readStorySectionForeColor(
  section: Record<string, unknown> | null | undefined,
): string | null {
  if (!section)
    return null

  for (const key of SECTION_FORE_COLOR_KEYS) {
    const normalized = normalizeStoryCssColor(section[key] as string | null | undefined)
    if (normalized)
      return normalized
  }

  return null
}

export function storySectionForeColor(
  foreColor: string | null | undefined,
  fontColor?: string | null | undefined,
): string | null {
  return normalizeStoryCssColor(foreColor) ?? normalizeStoryCssColor(fontColor)
}

export function hasStorySectionBgImageSource(
  image: TStoryImageType | null | undefined,
): boolean {
  const url = image?.URL
  return typeof url === 'string' && url.trim().length > 0
}

export function hasStorySectionCustomBackground(
  bgColor: string | null | undefined,
  bgImage: TStoryImageType | null | undefined,
): boolean {
  return !!trimStoryBgColor(bgColor) || hasStorySectionBgImageSource(bgImage)
}

/** Colore di base sotto bgImage (mantiene il pannello opaco durante pin/stack). */
export function sectionBackgroundBaseColor(
  bgColor: string | null | undefined,
  bgImage: TStoryImageType | null | undefined,
  fallback = 'var(--story-color-background)',
): string | undefined {
  const sectionBg = normalizeStoryCssColor(bgColor)
  if (sectionBg)
    return sectionBg

  if (hasStorySectionBgImageSource(bgImage))
    return normalizeStoryCssColor(bgImage?.bgColor) ?? fallback

  return undefined
}
