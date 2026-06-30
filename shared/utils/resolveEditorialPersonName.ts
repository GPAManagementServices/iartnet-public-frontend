import type { Person } from '#shared/types/api'

/**
 * Allinea stringhe nome da documento editoriale a record Person in API
 * (ordine nome/cognome, iniziale, omonimie, errori comuni in mail).
 */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[\u2018\u2019\u201b\u2032`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function stripInitialPrefix(first: string): string {
  return first.replace(/^(?:[a-z]\.\s*)+/i, '').trim()
}

function personVariants(p: { first_name?: string, last_name?: string }): string[] {
  const f = (p.first_name ?? '').trim()
  const l = (p.last_name ?? '').trim()
  const f2 = stripInitialPrefix(f)
  return [...new Set([
    norm(`${f} ${l}`),
    norm(`${l} ${f}`),
    ...(f2 !== f && f2 ? [norm(`${f2} ${l}`), norm(`${l} ${f2}`)] : []),
  ])]
}

function emailNameVariants(emailName: string): string[] {
  const n = norm(emailName)
  const parts = n.split(' ').filter(Boolean)
  const out = new Set<string>([n])
  if (parts.length >= 2) {
    const lastFirst = parts[0]!
    const rest = parts.slice(1).join(' ')
    out.add(norm(`${rest} ${lastFirst}`))
  }
  return [...out]
}

/**
 * Cerca un match tra un nome scritto in documenti editoriali e l’elenco `Person` caricato.
 * Restituisce `null` se l’anagrafica non esiste o non è riconosciuta.
 */
export function resolveEditorialPersonName(people: Person[], editorialName: string): Person | null {
  const want = new Set(emailNameVariants(editorialName))
  for (const p of people) {
    for (const v of personVariants(p)) {
      if (want.has(v))
        return p
    }
  }
  const n = norm(editorialName)
  if (n === norm('Annamaria Ducci')) {
    for (const p of people) {
      if (personVariants(p).some(s => s.includes('ducci') && s.includes('anna')))
        return p
    }
  }
  if (n === norm('Gabriella Grizzuti')) {
    for (const p of people) {
      if (norm(p.last_name ?? '') === 'grizzuti' && /gabriel/i.test(norm(p.first_name ?? '')))
        return p
    }
  }
  if (n.includes('noris') && n.includes('chiorda')) {
    for (const p of people) {
      if (/noris/i.test(`${p.first_name} ${p.last_name}`) && /chioda/i.test(p.last_name ?? ''))
        return p
    }
  }
  if (n === norm('Francesco Fruzza Meozzi')) {
    for (const p of people) {
      const blob = norm(`${p.first_name} ${p.last_name}`)
      if (blob.includes('fruzza') && blob.includes('meozzi'))
        return p
    }
  }
  if (n === norm('Cotroneo Massimo') || n === norm('Massimo Cotroneo')) {
    for (const p of people) {
      if (norm(p.first_name ?? '') === 'cotrone' && norm(p.last_name ?? '') === 'cotroneo')
        return p
    }
  }
  return null
}
