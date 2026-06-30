import type { Activity, Institution, Person } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const { locale } = getQuery(event)

  try {
    const { data } = await api<{ data: Activity }>(`/v1/activities/by-slug/${slug}?locale=${locale}`)
    const ids = [...new Set(data.people_groups.flatMap(({ people }) => people.map(({ id }) => id)))]
    const settled = await Promise.allSettled(
      ids.map(id => api<{ data: Person }>(`/v1/people/${id}`).then(({ data }) => data)),
    )
    const peopleById = new Map<number, Person>()
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]!
      const r = settled[i]!
      if (r.status === 'fulfilled')
        peopleById.set(id, r.value)
      else
        console.error('[ActivityRead] /v1/people failed', { slug, id, reason: r.reason })
    }

    for (const group of data.people_groups) {
      group.people = group.people.map(person =>
        peopleById.get(person.id) ?? person,
      )
    }

    return {
      ...data,
      institutions: await Promise.all(data.institutions.map(({ id }) => api<{ data: Institution }>(`/v1/institutions/${id}?locale=${locale}`).then(({ data }) => data))),
    }
  }
  catch (error) {
    console.error('[ActivityRead] Unexpected error:', { slug, error })
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the activity. Please try again later',
    })
  }
})
