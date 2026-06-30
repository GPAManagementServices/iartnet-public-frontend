import { $fetch } from 'ofetch'

const config = useRuntimeConfig()

export const api = $fetch.create({
  baseURL: `${config.public.baseUrl}/api`,
  // headers: {
  //   Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
  // }
})

export const apiData = $fetch.create({
  baseURL: `${config.public.baseDataUrl}/api`,
  /* onRequest({ request, options }) {
    console.log('[apiData request]', { request, method: options.method, query: options.query, body: options.body })
  },
  onResponse({ request, response }) {
    console.log('[apiData response]', { request, status: response.status })
  },
  onResponseError({ request, response }) {
    console.error('[apiData error]', { request, status: response?.status, body: response?._data })
  }, */
  // headers: {
  //   Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
  // }
})

export interface PaginationResult<T> {
  data: T[]
  links: {
    first: string
    last: string
    prev: string | null // TODO
    next: string | null // TODO
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    links: Array<{
      url: string | null
      label: string
      page: number | null
      active: boolean
    }> // TODO
    path: string
    per_page: number
    to: number
    total: number
  }
}
