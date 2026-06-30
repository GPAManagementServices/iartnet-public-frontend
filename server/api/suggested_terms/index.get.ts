import type { SuggestedTermsResult } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  try {
    const q = getQuery(event).q as string
    const search = await apiData<SuggestedTermsResult>(`/search_suggest_terms?q=${q}&Limit=8&LangMode=MIXED`)
    return search
  }
  catch (error) {
    console.error('[Search suggest terms] Unexpected error:', error)
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to search suggest terms. Please try again later',
    })
  }
})
