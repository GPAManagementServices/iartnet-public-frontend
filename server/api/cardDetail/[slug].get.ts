import type { CardDetail } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const { locale } = getQuery(event)

  try {
    const cardDetail = await apiData<CardDetail>(`/card_data/?card_id=${slug}&locale=${locale}`)
    // console.log('**cardDetail', (cardDetail.record_json))
    return cardDetail
  }
  catch (error) {
    console.error('[cardDetailRead] Unexpected error:', { slug, error })
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the cardDetail. Please try again later',
    })
  }
})
