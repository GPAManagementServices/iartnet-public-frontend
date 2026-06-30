import type { Person } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const { locale } = getQuery(event)

  try {
    const person = await api<{ data: Person }>(`/v1/people/by-slug/${slug}?locale=${locale}`)
    return person.data
  }
  catch (error) {
    console.error('[PersonRead] Unexpected error:', { slug, error })
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the person. Please try again later',
    })
  }
})
