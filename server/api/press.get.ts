import type { PressPage } from '#shared/types/api'
import { FetchError } from 'ofetch'

export default defineEventHandler(async (event) => {
  const { locale } = getQuery(event)

  try {
    const response = await api<{ data: PressPage }>(`/v1/press?locale=${locale ?? 'en'}`)

    return response.data
  }
  catch (error) {
    if (error instanceof FetchError && error.statusCode === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
      })
    }

    console.error('[PressRead] Unexpected error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'A server error occurred when attempting to read the press page. Please try again later',
    })
  }
})
