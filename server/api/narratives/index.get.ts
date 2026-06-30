import type { TStoriesTypeData, TStoriesTypeList } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  const { locale } = getQuery(event)

  try {
    /* const q = getQuery(event).q as string */
    const narration = await apiData<TStoriesTypeList>(`/narrationsList?locale=${locale}`)
    // console.log('narration', narration)

    return {
      success: narration.success,
      data: narration.data.filter((narrative: TStoriesTypeData) => !(narrative.publish_state !== 'published')),
    }
  }
  catch (error) {
    console.error('[Narration List] Unexpected error:', error)
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to get narration data. Please try again later',
    })
  }
})
