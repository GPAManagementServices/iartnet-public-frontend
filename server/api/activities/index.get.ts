import type { Activity } from '#shared/types/api'

const PAGE_QUERY_RE = /^\d+$/

export default defineEventHandler(async (event) => {
  const { locale, page } = getQuery(event)

  try {
    const pageSuffix = typeof page === 'string' && PAGE_QUERY_RE.test(page) ? `&page=${page}` : ''
    const activities = await api<PaginationResult<Activity>>(`/v1/activities?locale=${locale}&status=published&all=true${pageSuffix}`)
    return activities
  }
  catch (error) {
    console.error('[ActivitiesRead] Unexpected error:', error)
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the activities. Please try again later',
    })
  }
})
