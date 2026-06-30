import type { Project } from '#shared/types/api'

const PAGE_QUERY_RE = /^\d+$/

export default defineEventHandler(async (event) => {
  const { locale, page } = getQuery(event)

  try {
    const pageSuffix = typeof page === 'string' && PAGE_QUERY_RE.test(page) ? `&page=${page}` : ''
    const projects = await api<PaginationResult<Project>>(`/v1/projects/listing?locale=${locale}&status=published&all=true${pageSuffix}`)
    return projects
  }
  catch (error) {
    console.error('[ActivitiesRead] Unexpected error:', error)
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the activities. Please try again later',
    })
  }
})
