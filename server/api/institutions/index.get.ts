import type { Institution } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  const { locale } = getQuery(event)
  if (locale !== 'en' && locale !== 'it')
    throw createError({ status: 500, statusText: 'Unspecified locale' })

  const categories: Record<'en' | 'it', string>[] = [
    { en: 'lead-institution', it: 'istituzione-principale' },
    { en: 'project-partner', it: 'partner-di-progetto' },
    { en: 'associate-member', it: 'membro-associato' },
  ]

  try {
    const [lead, partner, member] = await Promise.all(categories.map(category => api<PaginationResult<Institution>>(`/v1/institutions?locale=${locale}&category_slug=${category[locale]}&all=true`)))

    const associateMembers = [...(member?.data ?? [])].toSorted((a, b) =>
      (a.name ?? '').localeCompare(b.name ?? '', locale, { sensitivity: 'base' }),
    )

    return {
      partner: [
        ...(lead?.data ?? []),
        ...(partner?.data ?? []),
      ],
      member: associateMembers,
    }
  }
  catch (error) {
    console.error('[InstitutionsRead] Unexpected error:', error)
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the institutions. Please try again later',
    })
  }
})
