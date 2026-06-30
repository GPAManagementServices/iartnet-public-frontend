import type { Institution, Person, Project } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const { locale } = getQuery(event)

  try {
    const { data } = await api<{ data: Project }>(`/v1/projects/by-slug/${slug}?locale=${locale}`)

    /** Come Activity: anagrafica completa (shortbio, ecc.) per abilitare pannello bio in UI. */
    if (data.people_groups?.length) {
      const ids = [
        ...new Set(
          data.people_groups.flatMap(({ people }) => people.map(({ id }) => id)),
        ),
      ]
      if (ids.length) {
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
            console.error('[ProjectRead] /v1/people failed', { slug, id, reason: r.reason })
        }
        for (const group of data.people_groups) {
          group.people = group.people.map(
            person => peopleById.get(person.id) ?? person,
          )
        }
      }
    }

    let institutions = data.institutions
    if (institutions?.length) {
      institutions = await Promise.all(
        institutions.map(({ id }) =>
          api<{ data: Institution }>(`/v1/institutions/${id}?locale=${locale}`).then(({ data }) => data),
        ),
      )
    }

    return {
      ...data,
      institutions,
    }
  }
  catch (error) {
    console.error('[ProjectRead] Unexpected error:', { slug, error })
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the project. Please try again later',
    })
  }
})
