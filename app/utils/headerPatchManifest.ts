export interface HeaderPatchManifestRow {
  title: string
  slug: string
  type: string
  year: string
  subject: string
  location: string
  cover: string
  coverLocal: string
}

export interface HeroCarouselItem extends HeaderPatchManifestRow {
  href: string
}

export function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

export function buildHref(slug: string): string {
  const trimmed = slug.trim()
  if (!trimmed)
    return ''
  if (trimmed.startsWith('/digital-object/'))
    return trimmed
  return `/digital-object/${encodeURIComponent(trimmed)}`
}

export function isValidManifestRow(row: unknown): row is HeaderPatchManifestRow {
  if (!row || typeof row !== 'object')
    return false
  const r = row as Record<string, unknown>
  if (!hasText(r.title) || !hasText(r.slug))
    return false
  if (!hasText(r.coverLocal) && !hasText(r.cover))
    return false
  return true
}

export function normalizeManifestRow(row: HeaderPatchManifestRow): HeroCarouselItem {
  const slug = row.slug.trim()
  return {
    title: row.title.trim(),
    slug,
    type: (row.type ?? '').trim(),
    year: (row.year ?? '').trim(),
    subject: (row.subject ?? '').trim(),
    location: (row.location ?? '').trim(),
    cover: (row.cover ?? '').trim(),
    coverLocal: (row.coverLocal ?? '').trim(),
    href: buildHref(slug),
  }
}

export function toPatchListPayload(item: HeroCarouselItem): HeaderPatchManifestRow {
  const { title, slug, type, year, subject, location, cover, coverLocal } = item
  return { title, slug, type, year, subject, location, cover, coverLocal }
}

export function buildFilteredItems(raw: unknown): HeroCarouselItem[] {
  if (!Array.isArray(raw)) {
    return []
  }
  return raw
    .filter(isValidManifestRow)
    .map(normalizeManifestRow)
    .filter(item => item.href.startsWith('/digital-object/'))
}

export function buildPatchListPayload(raw: unknown): HeaderPatchManifestRow[] {
  return buildFilteredItems(raw).map(toPatchListPayload)
}

export function slugForComparison(slug: string | undefined): string {
  const trimmed = (slug ?? '').trim()
  return trimmed || '(empty)'
}

export interface CarouselSlugArrayComparison {
  leftLabel: string
  rightLabel: string
  arraysEqual: boolean
  lengthLeft: number
  lengthRight: number
  firstMismatchIndex: number | null
  leftSlugs: string[]
  rightSlugs: string[]
}

/** Confronto sequenza slug (ordine e lunghezza) tra due liste usate al click. */
export function compareCarouselSlugSequences(
  left: string[],
  right: string[],
  leftLabel: string,
  rightLabel: string,
): CarouselSlugArrayComparison {
  const leftSlugs = left.map(slugForComparison)
  const rightSlugs = right.map(slugForComparison)
  const lengthLeft = leftSlugs.length
  const lengthRight = rightSlugs.length
  let firstMismatchIndex: number | null = null

  const maxLen = Math.max(lengthLeft, lengthRight)
  for (let i = 0; i < maxLen; i++) {
    if (leftSlugs[i] !== rightSlugs[i]) {
      firstMismatchIndex = i
      break
    }
  }

  return {
    leftLabel,
    rightLabel,
    arraysEqual: lengthLeft === lengthRight && firstMismatchIndex === null,
    lengthLeft,
    lengthRight,
    firstMismatchIndex,
    leftSlugs,
    rightSlugs,
  }
}

export interface CablesPatchLike {
  getVar: (name: string) => unknown
}

export function readPatchVar(patch: CablesPatchLike, name: string): unknown {
  try {
    const variable = patch.getVar(name)
    if (!variable)
      return undefined
    if (typeof (variable as { getValue?: unknown }).getValue === 'function')
      return (variable as { getValue: () => unknown }).getValue()
    if ('value' in (variable as Record<string, unknown>))
      return (variable as { value: unknown }).value
    return variable
  }
  catch {
    return undefined
  }
}

export function writePatchVar(patch: CablesPatchLike, name: string, value: unknown): boolean {
  try {
    const variable = patch.getVar(name)
    if (!variable)
      return false
    if (typeof (variable as { setValue?: unknown }).setValue === 'function') {
      const writableVariable = variable as { setValue: (nextValue: unknown) => void }
      writableVariable.setValue(value)
      return true
    }
    if ('value' in (variable as Record<string, unknown>)) {
      const writableVariable = variable as { value: unknown }
      writableVariable.value = value
      return true
    }
  }
  catch {
    return false
  }

  return false
}

export function syncHeroCarouselPatchVars(
  patch: CablesPatchLike,
  listUrl: string | null,
  items: HeroCarouselItem[],
): void {
  writePatchVar(patch, 'list', listUrl)
  writePatchVar(patch, 'slugArray', items.map(item => item.slug))
  writePatchVar(patch, 'totalItems', items.length)
}
