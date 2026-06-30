import type { Page } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const { locale } = getQuery(event)

  try {
    const page = await api<{ data: Page }>(`/v1/pages/by-slug/${slug}?locale=${locale}`)
    return page.data
  }
  catch (error) {
    console.error('[PageRead] Unexpected error:', { slug, error })
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the page. Please try again later',
    })
  }
})
