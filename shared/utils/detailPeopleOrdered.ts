import type { Person } from '../types/api'
import type { PeopleGroupForPartition, PeopleRoleBuckets } from './detailPageRoleBuckets'
import {
  buildRoleAliasSet,
  localizedGroupLabel,
  roleMatches,
  sortPeopleByName,
} from './detailPage'
import { ACTIVITY_PEOPLE_BUCKETS, PROJECT_PEOPLE_BUCKETS } from './detailPageRoleBuckets'

const CANONICAL_APOSTROPHE_RE = /'/g
const CANONICAL_NON_ALNUM_RE = /[^a-z0-9]+/g
const CANONICAL_TRIM_UNDERSCORE_RE = /^_|_$/g

export type DetailPeopleContext = 'activity' | 'project'

export interface OrderedPeopleGroup {
  /** Segment path under `people_role.{context}.{i18nKey}.{one|other}` */
  i18nKey: string
  people: Person[]
}

/** Slug stabile per chiavi i18n da etichetta canonica (inglese) del bucket. */
export function canonicalRoleToI18nSegment(canonical: string): string {
  return canonical
    .trim()
    .toLowerCase()
    .replace(CANONICAL_APOSTROPHE_RE, '')
    .replace(CANONICAL_NON_ALNUM_RE, '_')
    .replace(CANONICAL_TRIM_UNDERSCORE_RE, '')
}

function bucketForContext(ctx: DetailPeopleContext): PeopleRoleBuckets {
  return ctx === 'activity' ? ACTIVITY_PEOPLE_BUCKETS : PROJECT_PEOPLE_BUCKETS
}

/**
 * Ordine editoriale fisso: sequenza in `label2Roles` (label1 vuoto).
 * Merge dei gruppi API che mappano allo stesso ruolo canonico; persone deduplicate per `id`.
 * Gruppi non mappati → unico blocco `unmapped` in coda.
 */
export function buildOrderedPeopleGroups(
  context: DetailPeopleContext,
  groups: PeopleGroupForPartition[] | null | undefined,
  locale: string,
): OrderedPeopleGroup[] {
  const buckets = bucketForContext(context)
  const order = [...buckets.label1Roles, ...buckets.label2Roles]
  const synonyms: Record<string, string[]> = {
    ...buckets.label1Synonyms,
    ...buckets.label2Synonyms,
  }

  const list = groups ?? []
  const byCanonical = new Map<string, Map<number, Person>>()
  const unmappedById = new Map<number, Person>()

  for (const group of list) {
    const label = localizedGroupLabel(group.label, group.label_translations, locale)
    const people = sortPeopleByName(group.people ?? [])
    if (!people.length)
      continue

    let matchedCanonical: string | null = null
    for (const canonical of order) {
      const accepted = buildRoleAliasSet([canonical])
      if (roleMatches(label, accepted, synonyms)) {
        matchedCanonical = canonical
        break
      }
    }

    if (matchedCanonical) {
      const m = byCanonical.get(matchedCanonical) ?? new Map<number, Person>()
      for (const p of people)
        m.set(p.id, p)
      byCanonical.set(matchedCanonical, m)
    }
    else {
      for (const p of people)
        unmappedById.set(p.id, p)
    }
  }

  const out: OrderedPeopleGroup[] = []

  for (const canonical of order) {
    const m = byCanonical.get(canonical)
    if (!m?.size)
      continue
    out.push({
      i18nKey: canonicalRoleToI18nSegment(canonical),
      people: sortPeopleByName([...m.values()]),
    })
  }

  if (unmappedById.size) {
    out.push({
      i18nKey: 'unmapped',
      people: sortPeopleByName([...unmappedById.values()]),
    })
  }

  return out
}
