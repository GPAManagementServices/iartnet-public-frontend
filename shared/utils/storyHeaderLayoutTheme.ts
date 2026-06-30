import type { TStoryHeaderLayoutTheme, TStoryHeaderType } from '#shared/types/api'

function readThemeValue(value: unknown): TStoryHeaderLayoutTheme | null | undefined {
  if (value == null)
    return undefined
  const normalized = String(value).trim()
  if (!normalized)
    return null
  const lower = normalized.toLowerCase()
  if (lower === 'dark')
    return 'Dark'
  if (lower === 'light')
    return 'Light'
  return undefined
}

/** Legge `HeaderLayoutTheme` da header (PascalCase o camelCase). */
export function readStoryHeaderLayoutTheme(
  source: Record<string, unknown> | TStoryHeaderType | null | undefined,
): TStoryHeaderLayoutTheme | null | undefined {
  if (!source || typeof source !== 'object')
    return undefined

  const record = source as Record<string, unknown>
  return readThemeValue(record.HeaderLayoutTheme ?? record.headerLayoutTheme)
}

/** `Dark` = hero story scuro → header sito invertito (testo chiaro). */
export function isStoryHeaderLayoutThemeDark(
  source: Record<string, unknown> | TStoryHeaderType | null | undefined,
): boolean {
  return readStoryHeaderLayoutTheme(source) === 'Dark'
}
