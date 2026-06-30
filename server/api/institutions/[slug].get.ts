import type { Institution } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const { locale } = getQuery(event)

  try {
    const institution = await api<{ data: Institution }>(`/v1/institutions/by-slug/${slug}?locale=${locale}`)
    return institution.data
  }
  catch (error) {
    console.error('[InstitutionRead] Unexpected error:', { slug, error })
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the institution. Please try again later',
    })
  }
})
