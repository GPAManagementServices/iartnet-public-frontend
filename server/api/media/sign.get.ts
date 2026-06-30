export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    return await api<{ url: string }>('/v1/media/sign', { params: query })
  }
  catch (error: unknown) {
    const err = error as { statusCode?: number, status?: number, message?: string, data?: unknown }
    const statusCode = err.statusCode ?? err.status ?? 502
    throw createError({
      statusCode,
      statusMessage: typeof err.message === 'string' ? err.message : 'Media sign failed',
      data: err.data,
    })
  }
})
