import type { ResearchCatalogue } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const { locale } = getQuery(event)

  try {
    const researchCatalogue = await api<{ data: ResearchCatalogue }>(`/v1/research-catalogues/by-slug/${slug}?locale=${locale}`)
    return researchCatalogue.data
  }
  catch (error) {
    console.error('[ResearchCatalogueRead] Unexpected error:', { slug, error })
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the research catalogue entry. Please try again later',
    })
  }
})
