import type { Institution, Person } from './api'

/** Istituzione con persone nel payload grouped=1 (ordine deterministico lato API). */
export type InstitutionGroupedWithPeople = Institution & {
  people: Person[]
  slug_en?: string
  slug_it?: string
  display_sort_key?: string
}

/** Risposta GET /v1/people?grouped=1 (data object). */
export interface PeopleGroupedData {
  general_coordination: Person[]
  research_unit_leads: Person[]
  institutions: InstitutionGroupedWithPeople[]
}

/** Payload normalizzato esposto da /api/people al client Nuxt. */
export type PeoplePagePayload =
  | {
      mode: 'grouped'
      general_coordination: Person[]
      research_unit_leads: Person[]
      institutions: InstitutionGroupedWithPeople[]
    }
  | {
      mode: 'legacy'
      iartnet: Person[]
      institutions: Array<Institution & { people: Person[] }>
    }
