import type { Institution, Person } from '#shared/types/api'
import type { InstitutionGroupedWithPeople } from '#shared/types/people'

function dedupePeopleById(people: Person[]): Person[] {
  const m = new Map<number, Person>()
  for (const p of people) {
    if (p?.id != null)
      m.set(p.id, p)
  }
  return [...m.values()]
}

/**
 * API grouped: ogni voce può essere `Person` o `{ institution, person }`.
 */
export function normalizeResearchUnitLeadsArray(raw: unknown): Person[] {
  if (!Array.isArray(raw))
    return []
  const out: Person[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object')
      continue
    const o = item as Record<string, unknown>
    if ('person' in o && o.person && typeof o.person === 'object' && 'id' in (o.person as object)) {
      out.push(o.person as Person)
      continue
    }
    if ('id' in o)
      out.push(item as Person)
  }
  return dedupePeopleById(out)
}

/**
 * Unisce `general_coordination` e `academic_coordinator` (chiavi distinte in API v1).
 */
export function mergeGeneralCoordinationBlocks(body: Record<string, unknown>): Person[] {
  const a = Array.isArray(body.general_coordination) ? (body.general_coordination as Person[]) : []
  const b = Array.isArray(body.academic_coordinator) ? (body.academic_coordinator as Person[]) : []
  return dedupePeopleById([...a, ...b])
}

/**
 * Istituzione grouped: `{ institution, sections: { role_bucket: Person[] } }` → `{ ...institution, people }`.
 */
function flattenInstitutionEntry(entry: unknown): InstitutionGroupedWithPeople | null {
  if (!entry || typeof entry !== 'object')
    return null
  const o = entry as Record<string, unknown>

  if ('institution' in o && o.institution && typeof o.institution === 'object' && 'sections' in o) {
    const inst = o.institution as Institution & Record<string, unknown>
    const sections = o.sections
    const people: Person[] = []
    if (sections && typeof sections === 'object' && !Array.isArray(sections)) {
      for (const val of Object.values(sections)) {
        if (!Array.isArray(val))
          continue
        for (const p of val) {
          if (p && typeof p === 'object' && 'id' in p)
            people.push(p as Person)
        }
      }
    }
    return { ...(inst as Institution), people: dedupePeopleById(people) } as InstitutionGroupedWithPeople
  }

  if ('people' in o && Array.isArray(o.people) && ('id' in o || (o as { name?: string }).name != null)) {
    const inst = o as InstitutionGroupedWithPeople
    return { ...inst, people: dedupePeopleById(inst.people ?? []) }
  }

  return null
}

export function normalizeInstitutionsGroupedArray(raw: unknown): InstitutionGroupedWithPeople[] {
  if (!Array.isArray(raw))
    return []
  return raw.map(flattenInstitutionEntry).filter((x): x is InstitutionGroupedWithPeople => x != null)
}

export function isGroupedPeoplePayload(o: unknown): o is Record<string, unknown> {
  return Boolean(o && typeof o === 'object' && !Array.isArray(o) && Array.isArray((o as Record<string, unknown>).institutions))
}
