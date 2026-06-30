import type { Project } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  const { locale } = getQuery(event)

  if (locale !== 'en' && locale !== 'it') {
    throw createError({ status: 500, statusText: 'Unspecified locale' })
  }

  try {
    const projects = await api<PaginationResult<Project>>(
      `/v1/projects/homepage?locale=${locale}`,
    )
    return projects
  }
  catch (error) {
    console.error('[ProjectsHomepageRead] Unexpected error:', error)
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read homepage projects. Please try again later',
    })
  }
})
