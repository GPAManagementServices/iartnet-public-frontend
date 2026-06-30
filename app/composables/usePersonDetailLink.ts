import type { Person } from '#shared/types/api'
import type { RouteLocationRaw } from 'vue-router'
import { getPersonDetailRoute, personHasDetailPage } from '#shared/utils/personDetailPage'

export function usePersonDetailLink() {
  const localePath = useLocalePath()

  function detailRoute(person: Person): RouteLocationRaw | null {
    return getPersonDetailRoute(person)
  }

  function detailPath(person: Person): string | null {
    const route = detailRoute(person)
    return route ? localePath(route) : null
  }

  return {
    personHasDetailPage,
    detailRoute,
    detailPath,
  }
}
