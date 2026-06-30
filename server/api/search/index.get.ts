import type { SearchResult } from '#shared/types/api'

const DEFAULT_LIMIT = 8
const MAX_LIMIT = 8
const DEFAULT_OFFSET = 0
const DEFAULT_COUNT = 5000

function normalizeSearchQuery(raw: unknown): string {
  if (typeof raw === 'string')
    return raw.trim()
  if (Array.isArray(raw) && typeof raw[0] === 'string')
    return raw[0].trim()
  return ''
}

function normalizePositiveInteger(raw: unknown, fallback: number, max?: number): number {
  const value = Number.parseInt(Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? ''), 10)
  if (!Number.isFinite(value) || value < 0)
    return fallback
  if (typeof max === 'number')
    return Math.min(value, max)
  return value
}

const EMPTY_SEARCH_RESULT: SearchResult = {
  q: '',
  mode: 'AND',
  limit: DEFAULT_LIMIT,
  offset: DEFAULT_OFFSET,
  count: 0,
  results: [],
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { locale } = query

  try {
    const q = normalizeSearchQuery(query.q)
    const limit = normalizePositiveInteger(query.limit, DEFAULT_LIMIT, MAX_LIMIT)
    const offset = normalizePositiveInteger(query.offset, DEFAULT_OFFSET)
    if (!q)
      return EMPTY_SEARCH_RESULT

    const search = await apiData<SearchResult>(
      `/search_public?locale=${locale}&limit=${limit}&offset=${offset}&mode=AND&q=${encodeURIComponent(q)}`,
    )

    /*     const search = await apiData<SearchResult>('/search_public', {
      method: 'POST',
      body: {
        locale,
        Limit: limit,
        Offset: offset,
        Mode: 'AND',
        q,
      },
    }) */

    // console.log('q', `/search_public?locale=${locale}&Limit=${limit}&Offset=${offset}&Mode=AND&q=${encodeURIComponent(q)}`)
    // console.log('search', search)
    return { ...search, count: DEFAULT_COUNT }
  }
  catch (error) {
    console.error('[Search] Unexpected error:', error)
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to search. Please try again later',
    })
  }
})
