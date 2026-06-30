import type { TStoriesTypeData, TStoriesTypeDataResponse, TStoriesTypeList } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const { locale } = getQuery(event)

  const narration = await apiData<TStoriesTypeList>(`/narrationsList?locale=${locale}`)
  let id = narration.data.find((narrative: TStoriesTypeData) => {
    if (narrative.ext_json.Header?.SEO)
      return narrative.ext_json.Header.SEO.slug === slug
    return false
  })?.id

  if (!id)
    id = slug

  try {
    const stories = await apiData<TStoriesTypeDataResponse>(`/narrationData/?id=${id}&locale=${locale}`)
    return stories.data
  }
  catch (error) {
    console.error('[storiesDetail] Unexpected error:', { slug, error })
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the storiesDetail. Please try again later',
    })
  }
})
