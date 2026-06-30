import type { Person } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  const { locale, institutionId } = getQuery(event)

  try {
    const people = await api<{ data: Person[] }>(`/v1/people?institution-id=${institutionId}&locale=${locale}`)
    return people.data
  }
  catch (error) {
    console.error('[PersonRead] Unexpected error:', { institutionId, error })
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the person. Please try again later',
    })
  }
})
