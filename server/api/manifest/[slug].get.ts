export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  try {
    const manifestDetail = await apiData(`/iiif/manifest/${slug}`)
    return manifestDetail
  }
  catch (error) {
    console.error('[manifestDetailRead] Unexpected error:', { slug, error })
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the manifestDetail. Please try again later',
    })
  }
})
