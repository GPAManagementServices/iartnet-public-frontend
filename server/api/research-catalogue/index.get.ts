import type { ResearchCatalogue } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  const { locale } = getQuery(event)

  try {
    const researchCatalogue = await api<PaginationResult<ResearchCatalogue>>(`/v1/research-catalogues?locale=${locale}&status=published`)
    return researchCatalogue.data
  }
  catch (error) {
    console.error('[ResearchCatalogueRead] Unexpected error:', error)
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the research catalogue. Please try again later',
    })
  }
})
