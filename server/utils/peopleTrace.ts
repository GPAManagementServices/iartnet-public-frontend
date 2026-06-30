import type { H3Event } from 'h3'

export interface PeopleTraceContext {
  route: string
  locale: string
  categorySlug: string
  light: boolean
  mode: 'grouped' | 'legacy'
  recordCount?: number
  hasDetailCount?: number
  payloadBytes?: number
  upstreamMs?: number
  upstreamStatus?: number
  error?: string
}

function isPeopleTraceEnabled(): boolean {
  return process.env.PEOPLE_TRACE_ENABLED === 'true'
}

export function tracePeopleRead(event: H3Event, context: PeopleTraceContext): void {
  if (!isPeopleTraceEnabled())
    return

  const requestId = getRequestHeader(event, 'x-request-id')
    ?? getRequestHeader(event, 'x-correlation-id')
    ?? undefined

  console.info('[PeopleRead:trace]', JSON.stringify({
    request_id: requestId,
    route: context.route,
    locale: context.locale,
    category_slug: context.categorySlug,
    light: context.light,
    mode: context.mode,
    record_count: context.recordCount,
    has_detail_count: context.hasDetailCount,
    payload_bytes: context.payloadBytes,
    upstream_ms: context.upstreamMs,
    upstream_status: context.upstreamStatus,
    error: context.error,
  }))
}

export function countPeopleInPayload(payload: unknown): number {
  if (!payload || typeof payload !== 'object')
    return 0

  const ids = new Set<number>()
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object')
      return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    const o = node as Record<string, unknown>
    if (typeof o.id === 'number' && (typeof o.first_name === 'string' || typeof o.last_name === 'string'))
      ids.add(o.id)
    Object.values(o).forEach(walk)
  }
  walk(payload)

  return ids.size
}

export function countHasDetailInPayload(payload: unknown): number {
  if (!payload || typeof payload !== 'object')
    return 0

  let count = 0
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object')
      return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    const o = node as Record<string, unknown>
    if (o.has_detail_page === true)
      count++
    Object.values(o).forEach(walk)
  }
  walk(payload)

  return count
}
