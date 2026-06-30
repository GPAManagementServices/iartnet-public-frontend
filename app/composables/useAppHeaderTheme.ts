import type { TStoryHeaderType } from '#shared/types/api'
import {
  resolveAppHeaderLogoInverted,
  resolveAppHeaderNavInverted,
} from '#shared/utils/storyAppHeaderTheme'

export type AppHeaderTone = 'default' | 'inverted'

export interface AppHeaderTheme {
  logo: AppHeaderTone
  nav: AppHeaderTone
}

const APP_HEADER_THEME_KEY = 'app-header-theme'

const DEFAULT_APP_HEADER_THEME: AppHeaderTheme = {
  logo: 'default',
  nav: 'default',
}

export function useAppHeaderTheme() {
  return useState<AppHeaderTheme>(APP_HEADER_THEME_KEY, () => ({ ...DEFAULT_APP_HEADER_THEME }))
}

export function resetAppHeaderTheme(): void {
  useAppHeaderTheme().value = { ...DEFAULT_APP_HEADER_THEME }
}

export function syncAppHeaderThemeFromStoryHeader(
  header: TStoryHeaderType | Record<string, unknown> | null | undefined,
  options?: { slug?: string },
): void {
  useAppHeaderTheme().value = {
    logo: resolveAppHeaderLogoInverted(header, options?.slug) ? 'inverted' : 'default',
    nav: resolveAppHeaderNavInverted(header) ? 'inverted' : 'default',
  }
}
