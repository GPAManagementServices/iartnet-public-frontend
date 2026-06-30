import { api } from '../../utils/apiFetch'
import { fetchSignedMediaBody } from '../../utils/imageProxy'

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  const query = getQuery(event)

  const { body, contentType, cacheControl } = await fetchSignedMediaBody(path, query, api, fetch)
  if (contentType)
    setResponseHeader(event, 'Content-Type', contentType)

  if (cacheControl)
    setResponseHeader(event, 'Cache-Control', cacheControl)

  return body
})
