import type { CardsStat, TCardStat } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  try {
    const { data } = await apiData<{ data: TCardStat[] | CardsStat }>(`/cards_stat`)
    return Array.isArray(data) ? { cardsStat: data } : data
  }
  catch (error) {
    console.error('[cards_stat] Unexpected error:', { error })
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the card stats. Please try again later',
    })
  }
})
