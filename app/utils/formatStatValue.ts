export function formatStatValue(
  value: number,
  locale: string,
  options?: { compact?: boolean },
): string {
  return new Intl.NumberFormat(locale, {
    ...(options?.compact
      ? { notation: 'compact', compactDisplay: 'short' }
      : {}),
  }).format(Math.round(value))
}
