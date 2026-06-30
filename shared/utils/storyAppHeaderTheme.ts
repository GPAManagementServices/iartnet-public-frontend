import {
  STORY_APP_HEADER_LOGO_INVERT_BY_SLUG,
  STORY_APP_HEADER_LOGO_INVERT_BY_TITLE,
} from '#shared/constants/storyAppHeaderLogoOverrides'
import type { TStoryHeaderType } from '#shared/types/api'
import { isStoryHeaderLayoutThemeDark } from '#shared/utils/storyHeaderLayoutTheme'

/** Strip HTML from CMS `Title` before override lookup. */
export function readStoryHeaderPlainTitle(
  header: Record<string, unknown> | TStoryHeaderType | null | undefined,
): string {
  if (!header || typeof header !== 'object')
    return ''

  const raw = (header as Record<string, unknown>).Title ?? (header as Record<string, unknown>).title
  if (typeof raw !== 'string')
    return ''

  return raw.replace(/<[^>]+>/g, '').trim()
}

function resolveLogoInvertOverride(
  slug: string | undefined,
  plainTitle: string,
): boolean | undefined {
  if (slug) {
    const bySlug = STORY_APP_HEADER_LOGO_INVERT_BY_SLUG[slug.trim().toLowerCase()]
    if (bySlug !== undefined)
      return bySlug
  }

  if (plainTitle) {
    const normalizedTitle = plainTitle.toLowerCase()
    for (const [pattern, invert] of Object.entries(STORY_APP_HEADER_LOGO_INVERT_BY_TITLE)) {
      if (normalizedTitle === pattern.trim().toLowerCase())
        return invert
    }
  }

  return undefined
}

/** Logo: title/slug override, else `HeaderLayoutTheme`. */
export function resolveAppHeaderLogoInverted(
  header: Record<string, unknown> | TStoryHeaderType | null | undefined,
  slug?: string,
): boolean {
  const titleOverride = resolveLogoInvertOverride(slug, readStoryHeaderPlainTitle(header))
  if (titleOverride !== undefined)
    return titleOverride

  return isStoryHeaderLayoutThemeDark(header)
}

/** Nav (Search + menu): always `HeaderLayoutTheme` only. */
export function resolveAppHeaderNavInverted(
  header: Record<string, unknown> | TStoryHeaderType | null | undefined,
): boolean {
  return isStoryHeaderLayoutThemeDark(header)
}
