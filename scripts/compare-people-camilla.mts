/**
 * Confronta i nomi della mail Camilla (People) con GET /v1/people?all=true (locale en).
 * Uso: npx tsx scripts/compare-people-camilla.mts
 * Richiede rete; default URL: https://cms.gpams.it
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const API_BASE = process.env.CMS_API_BASE ?? 'https://cms.gpams.it/api'

const EMAIL_NAMES: string[] = [
  // Intestazione
  'Nicoletta Leonardi',
  'Carlo Sassetti',
  'Alessandro De Filippo',
  'Umberto Bellodi',
  'Marcello Mazzetti',
  'Luca Andrea Ludovico',
  'Giovanna Cassese',
  'Goffredo Haus',
  // Scientific 1
  'Lorella Scacco',
  'Michela Corsini',
  'Gerardo De Simone',
  'Annamaria Ducci',
  'Anna Mariani',
  'Chiara Nenci',
  'Maria Chiara Palandri',
  'Attilio Cantore',
  'Livio Ticli',
  // Scientific 2
  'Giovanni Iovane',
  'Fabio Iannotta',
  'Ilaria Mariotti',
  'Domenico Quaranta',
  'Rosanna Ruscio',
  // Scientific 3
  'Johann Haarberg',
  'Emanuele Quinz',
  'Samuel Bianchini',
  'Elena Cologni',
  'Linda Messas',
  'Federica Martini',
  // Project staff (globale)
  'Beatrice Mezzogori',
  'Elena Lissoni',
  'Beatrice Zanelli',
  'Camilla Zennaro',
  // Brera — Academic team
  'Donatella Bonelli',
  'Manuel Ehrenfeld',
  'Eva Frapiccini',
  'Gabriele Giromella',
  'Gabriella Grizzuti',
  'Cosmo Laera',
  'Alice Laudisa',
  'Fabio Iannotta',
  'Nicoletta Leonardi',
  'Anna Mariani',
  'Ilaria Mariotti',
  'Chiara Nenci',
  'Maria Chiara Palandri',
  'Domenico Quaranta',
  'Rosanna Ruscio',
  'Lorella Scacco',
  'Marco Negroni',
  'Roberto Rosso',
  // Brera — Research staff
  'Elisa Albano',
  'Irene Banfi',
  'Lara Maria Rosa Barbieri',
  'Alessandra Bellani',
  'Gloria Boero',
  'Deborah Caivano',
  'Fabio Campari',
  'Arianna Ciattini',
  'Alice Colombo',
  'Alice Compton',
  'Luca Esposito',
  'Deborah Finocchiaro',
  'Miriam Ferrara',
  'Petra Filagrana',
  'Germana Formenti',
  'Davide Fratoni',
  'Gaia Costanza Grassi',
  'Federica Iannuzzi',
  'Giulia Mazza',
  'Elena Passini',
  'Serafina Pignotti',
  'Marta Rizzato',
  'Edoardo Sala',
  'Leonbattista Scacchetti',
  'Matilde Spimpolo',
  'Alessia Vidale',
  // Brera — project staff
  'Antonia Iurlaro',
  'Bruno Aliprandi',
  'Francesca De Paola',
  // Teatro alla Scala
  'Monica Errico',
  'Michele Erminio Gatto',
  'Andrea Massimo Grassi',
  'Angelica Lorefice',
  'Nadia Nigris',
  'Antonio Cascone',
  'Letizia Cirri',
  'Emanuela Gentile',
  'Maurizio Noris Chiorda',
  'Sandra Erica Maria Lanzi',
  'Mario Raiola',
  // Carrara
  'Anna Maria Ducci',
  'Marco Ciampolini',
  'Gaetano Malandrino',
  'Daniele Sorace',
  'Raffaella Serafini',
  'Arianna Borghetti',
  'Chiara Cucurnia',
  'Francesco Fruzza Meozzi',
  'Pietro Miccoli',
  'Alessandra Palmerini',
  'Silvia Panigata',
  'Ludovico Renzi',
  'Tania Barbieri',
  'Elisa Bassetto',
  // Catania
  'Sabina Albani',
  'Laura Barreca',
  'Alessandro Costanzo',
  'Gianni Latino',
  'Gianpiero Vincenzo',
  'Vittoria Mascellaro',
  'Rachele Romano',
  'Alessandro Blancato',
  'Giuliana Fratantoni',
  'Mara Sileci',
  // Brescia (accademici: nomi su più righe)
  'Alonso de Molina Isaac',
  'Bertoli Stefano',
  'Bragalini Luca',
  'Cantore Attilio',
  'Cavallo Paolo',
  'Cotroneo Massimo',
  'Ghielmi Vittorio',
  'Guarino Corrado',
  'Laitempergher Simonluca',
  'Marchetti Luca',
  'Pelucchi Pierangelo',
  'Priori Massimo',
  'Ricciardi Anne Colette',
  'Ricciardi Emiliano',
  'Rocchetti Gabriele',
  'Ruggeri Marco',
  'Sala Elisa',
  'Sala Mariella',
  'Savoldelli Boris',
  'Taglietti Sara',
  'Ticli Livio',
  'Edda Capelli',
  'Cristina Cembalo',
  'Laura Rinnovati',
  'Filippo Terni',
  'Sara Zubini',
  'Valentina Anzani',
  'Sara Primiterra',
  // Studenti (Cognome Nome in mail) — mappiamo stringa piena, matching gestirà
  'Adinolfi Noemi',
  'Bardi Erica',
  'Bardier Adelina',
  'Barbieri Giovanni',
  'Baronchelli Francesca',
  'Bianchi Matteo',
  'Canobbio Eleonora',
  'Corsaro Daniele',
  'Corti Raffaele',
  "D'Ambrosio Maria Vittoria",
  'De Paola Lorenzo',
  'De Rienzo Matteo Austin',
  'Delizioso Elisa Andrea',
  'Deriu Ivan',
  'Di Luca Rachele Karina',
  'Ding Hairong',
  'Foglietto Giorgio',
  'Fronti Francesca',
  'Giordano Vittoria Camilla',
  'Giusti Mizar',
  'Gobetti Viola',
  'Jonaszko Veronika Anna',
  'Lolli Luisa',
  'Marelli Erika',
  'Mattarozzi Alice',
  'Mondelli Camilla',
  'Nicolò Sofia',
  'Oliboni Mariana Mona',
  'Pallotta Alessandra',
  'Pastori Giosana',
  'Persichetti Ilaria',
  'Salvatore Viso Leonardo',
  'Spinelli Nicole',
  'Tomè Francesco',
  'Trifino Francesca',
  'Turchi Jacopo',
  'Wang Yuzyang',
  'Xu Tengyue',
  'YuSheng Zhan',
]

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[\u2018\u2019\u201b\u2032`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** Rimuove prefissi tipo "M." / "F." dal nome per allineare a elenchi senza iniziale. */
function stripInitialPrefix(first: string): string {
  return first.replace(/^(?:[a-z]\.\s*)+/i, '').trim()
}

type Person = {
  id: number
  first_name: string
  last_name: string
  slug?: string
}

function personVariants(p: Person): string[] {
  const f = (p.first_name ?? '').trim()
  const l = (p.last_name ?? '').trim()
  const f2 = stripInitialPrefix(f)
  const o: string[] = [
    norm(`${f} ${l}`),
    norm(`${l} ${f}`),
    ...(f2 !== f && f2 ? [norm(`${f2} ${l}`), norm(`${l} ${f2}`)] : []),
  ]
  return [...new Set(o)]
}

/**
 * "Adinolfi Noemi" (cognome nome) -> match noemi adinolfi
 */
function emailToVariants(emailName: string): string[] {
  const n = norm(emailName)
  const parts = n.split(' ').filter(Boolean)
  const out = new Set<string>([n])
  if (parts.length >= 2) {
    const lastFirst = parts[0]
    const rest = parts.slice(1).join(' ')
    out.add(norm(`${rest} ${lastFirst}`))
  }
  return [...out]
}

function findMatch(emailName: string, people: Person[]): Person | null {
  const want = new Set(emailToVariants(emailName))
  for (const p of people) {
    for (const v of personVariants(p)) {
      if (want.has(v))
        return p
    }
  }
  // Annamaria Ducci / Anna Maria Ducci
  const n = norm(emailName)
  if (n === norm('Annamaria Ducci')) {
    for (const p of people) {
      if (personVariants(p).some(s => s.includes('ducci') && s.includes('anna')))
        return p
    }
  }
  // Gabriella / Gabriela Grizzuti
  if (n === norm('Gabriella Grizzuti')) {
    for (const p of people) {
      if (norm(p.last_name ?? '') === norm('grizzuti') && /gabriel/i.test(norm(p.first_name ?? '')))
        return p
    }
  }
  // Maurizio Noris Chiorda (mail) ↔ Chioda (CMS)
  if (n.includes('noris') && n.includes('chiorda')) {
    for (const p of people) {
      if (/noris/i.test(`${p.first_name} ${p.last_name}`) && /chioda/i.test(`${p.last_name}`))
        return p
    }
  }
  // Francesco Fruzza Meozzi ↔ "Francesco R. Fruzza" + "Meozzi" in CMS
  if (n === norm('Francesco Fruzza Meozzi')) {
    for (const p of people) {
      const blob = norm(`${p.first_name} ${p.last_name}`)
      if (blob.includes('fruzza') && blob.includes('meozzi'))
        return p
    }
  }
  // Mail "Cotroneo Massimo" (nome invertito) ↔ CMS "Cotrone" / "Cotroneo" (id 262)
  if (n === norm('Cotroneo Massimo') || n === norm('Massimo Cotroneo')) {
    for (const p of people) {
      if (norm(p.first_name) === 'cotrone' && norm(p.last_name) === 'cotroneo')
        return p
    }
  }
  return null
}

async function main() {
  const localPath = fileURLToPath(new URL('./people-all-cache.json', import.meta.url))
  let raw: string
  if (existsSync(localPath)) {
    raw = await readFile(localPath, 'utf8')
  }
  else {
    const u = new URL('v1/people?all=true&locale=en&category_slug=internal', `${API_BASE.replace(/\/$/, '')}/`)
    const r = await fetch(u)
    if (!r.ok) {
      console.error('Fetch failed', r.status, await r.text())
      process.exit(1)
    }
    raw = await r.text()
    await import('node:fs/promises').then(fs => fs.writeFile(localPath, raw, 'utf8')).catch(() => {})
  }
  const body = JSON.parse(raw) as { data: Person[] }
  const people = body.data ?? []

  const emailUnique = [...new Set(EMAIL_NAMES.map(s => s.trim()).filter(Boolean))]
  const missing: { name: string }[] = []
  for (const name of emailUnique) {
    if (!findMatch(name, people))
      missing.push({ name })
  }

  function personMatchesAnyEmail(p: Person): boolean {
    return emailUnique.some(
      (en) => findMatch(en, people)?.id === p.id,
    )
  }

  const notInEmail: Person[] = people.filter(
    p => (p.first_name || p.last_name) && !personMatchesAnyEmail(p),
  )

  console.log('--- Mappa campo ↔ modello (frontend / API) ---\n')
  console.log(
    [
      '| Sezione mail | Fonte in app | Chiave / note |',
      '|---|---|---|',
      '| ACADEMIC COORDINATOR | `people` → AC in `academic_coordinator` o `general_coordination` + `matchesAppRoleTitle(..., "Academic Coordinator")` | `role_key` `academic_coordinator` |',
      '| RESEARCH UNIT LEADS | `research_unit_leads` (+ merge RUL in GC) | `research_unit_lead` |',
      '| GENERAL ADVISORS | `general_coordination` → gruppo `General Advisor` | `general_advisor` |',
      '| Scientific committees | **Non nel payload** `PeopleGroupedData` attuale; va API + sezione UI | (da definire, es. nuovi `role_key` o entità) |',
      '| Project staff (blocco) | Oggi: PM, Digital Curator, Res. Coord. come righe sotto `GLOBAL_ROLES_BRERA` in `globalRoleGroups` | `project_manager`, `digital_collections_curator`, `research_coordinator_and_communication` |',
      '| Blocchi per istituzione | `institutions` → in API nuova forma `{ institution, sections }` (non solo `people[]`) | `academic_team_member`, `research_staff`, `project_staff`, `student_collaborator`, `external_consultant` |',
    ].join('\n'),
  )

  console.log('\n--- Nomi in mail (unici) non trovati in API con matching flessibile ---\n')
  if (missing.length === 0)
    console.log('(nessuno)')
  else
    missing.forEach(m => console.log(`- ${m.name}`))

  console.log(
    '\n--- Persone in CMS (sample: prime 15) assenti da elenco mail (o varianti) ---\n',
  )
  console.log(
    notInEmail
      .sort((a, b) => `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`))
      .map(p => `${p.id}\t${p.first_name} ${p.last_name}`)
      .slice(0, 80)
      .join('\n'),
  )
  if (notInEmail.length > 80)
    console.log(`\n... e altre ${notInEmail.length - 80} (totale in CMS non mappate all\'elenco: ${notInEmail.length})`)

  console.log(`\n--- Riepilogo numerico ---\nemail unici: ${emailUnique.length}\npersone API: ${people.length}\nmail non in API: ${missing.length}\nAPI non in mail (stima): ${notInEmail.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
