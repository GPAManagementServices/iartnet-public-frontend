import type { Institution, Person } from '#shared/types/api'
import type { PeoplePagePayload } from '#shared/types/people'
import type { PaginationResult } from '../../utils/apiFetch'
import {
  isGroupedPeoplePayload,
  mergeGeneralCoordinationBlocks,
  normalizeInstitutionsGroupedArray,
  normalizeResearchUnitLeadsArray,
} from '../../utils/normalizePeopleGroupedResponse'
import {
  countHasDetailInPayload,
  countPeopleInPayload,
  tracePeopleRead,
} from '../../utils/peopleTrace'

function institutionFetchFailureReason(reason: unknown): string {
  if (reason === null || reason === undefined)
    return 'unknown'
  if (typeof reason === 'object' && reason !== null) {
    const r = reason as {
      status?: number
      statusCode?: number
      statusMessage?: string
      message?: string
    }
    const status = r.status ?? r.statusCode
    const msg = (r.statusMessage ?? r.message ?? '').trim()
    if (status != null && msg)
      return `${status} ${msg}`
    if (status != null)
      return String(status)
    if (msg)
      return msg
  }
  return String(reason)
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const locale = query.locale
  if (locale !== 'en' && locale !== 'it')
    throw createError({ statusCode: 500, statusMessage: 'Unspecified locale' })

  const category: Record<'en' | 'it', string> = {
    en: 'internal',
    it: 'interne',
  }

  const categorySlug = category[locale as 'en' | 'it']

  const params = new URLSearchParams({
    grouped: '1',
    paginate: 'false',
    locale: locale as string,
    category_slug: categorySlug,
    light: '1',
  })
  if (typeof query.role === 'string' && query.role.trim())
    params.set('role', query.role.trim())

  const upstreamStarted = Date.now()

  try {
    const res = await api<{ data: unknown }>(`/v1/people?${params.toString()}`)
    const body = res.data

    if (body && typeof body === 'object' && !Array.isArray(body) && isGroupedPeoplePayload(body)) {
      const o = body as Record<string, unknown>
      const payload = {
        mode: 'grouped' as const,
        general_coordination: mergeGeneralCoordinationBlocks(o),
        research_unit_leads: normalizeResearchUnitLeadsArray(o.research_unit_leads),
        institutions: normalizeInstitutionsGroupedArray(o.institutions),
      } satisfies PeoplePagePayload

      tracePeopleRead(event, {
        route: '/api/people',
        locale: locale as string,
        categorySlug,
        light: true,
        mode: 'grouped',
        recordCount: countPeopleInPayload(payload),
        hasDetailCount: countHasDetailInPayload(payload),
        payloadBytes: JSON.stringify(payload).length,
        upstreamMs: Date.now() - upstreamStarted,
        upstreamStatus: 200,
      })

      return payload
    }
  }
  catch (err: unknown) {
    const status = typeof err === 'object' && err !== null && 'statusCode' in err
      ? Number((err as { statusCode?: number }).statusCode)
      : typeof err === 'object' && err !== null && 'response' in err
        ? Number((err as { response?: { status?: number } }).response?.status)
        : 0
    if (status === 422) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Invalid query (e.g. role not allowed)',
        data: typeof err === 'object' && err !== null && 'data' in err ? (err as { data: unknown }).data : undefined,
      })
    }
    console.warn('[PeopleRead] grouped=1 failed, falling back to legacy aggregation:', err)
    tracePeopleRead(event, {
      route: '/api/people',
      locale: locale as string,
      categorySlug,
      light: true,
      mode: 'grouped',
      upstreamMs: Date.now() - upstreamStarted,
      upstreamStatus: status || undefined,
      error: 'grouped_failed',
    })
  }

  try {
    const legacyParams = new URLSearchParams({
      all: 'true',
      locale: locale as string,
      category_slug: categorySlug,
      light: '1',
    })
    const people = await api<PaginationResult<Person>>(`/v1/people?${legacyParams.toString()}`)

    const uniqueInstitutionIds = [...new Set(people.data.flatMap(
      ({ institution_roles }) => institution_roles
        .map(({ institution_id }) => institution_id),
    ))]

    const institutionSettled = await Promise.allSettled(
      uniqueInstitutionIds.map(id =>
        api<{ data: Institution }>(`/v1/institutions/${id}`).then(({ data }) => data),
      ),
    )

    const institutions: Institution[] = []
    for (let i = 0; i < uniqueInstitutionIds.length; i++) {
      const institutionId = uniqueInstitutionIds[i]
      const settled = institutionSettled[i]
      if (!settled)
        continue
      if (settled.status === 'fulfilled') {
        institutions.push(settled.value)
      }
      else {
        console.warn(
          '[PeopleRead] Skipping institution (missing or failed CMS fetch):',
          { institutionId, reason: institutionFetchFailureReason(settled.reason) },
        )
      }
    }

    const payload = {
      mode: 'legacy' as const,
      iartnet: people.data.filter(({ role }) => role),
      institutions: institutions.map(institution => ({
        ...institution,
        people: people.data.filter(({ institution_roles }) => institution_roles.some(({ institution_id }) => Number(institution_id) === institution.id)),
      })),
    } satisfies PeoplePagePayload

    tracePeopleRead(event, {
      route: '/api/people',
      locale: locale as string,
      categorySlug,
      light: true,
      mode: 'legacy',
      recordCount: countPeopleInPayload(payload),
      hasDetailCount: countHasDetailInPayload(payload),
      payloadBytes: JSON.stringify(payload).length,
      upstreamMs: Date.now() - upstreamStarted,
      upstreamStatus: 200,
    })

    return payload
  }
  catch (error) {
    tracePeopleRead(event, {
      route: '/api/people',
      locale: locale as string,
      categorySlug,
      light: true,
      mode: 'legacy',
      upstreamMs: Date.now() - upstreamStarted,
      error: 'legacy_failed',
    })
    console.error('[PeopleRead] Unexpected error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'A server error occurred when attempting to read the people. Please try again later',
    })
  }
})
