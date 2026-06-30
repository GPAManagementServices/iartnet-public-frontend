/**
 * Struttura editoriale (non censita in backend) per la sezione People — Scientific committees.
 * I nomi vengono risolti a `Person` con `resolveEditorialPersonName` se presenti in API.
 */
export interface ScientificCommitteeDef {
  id: 'historical' | 'contemporary' | 'postgraduate'
  titleKey: 'Scientific Committee on Cultural Heritage' | 'Scientific Committee on Contemporary Visual and Performing Arts' | 'Committee on Internationalisation and Artistic Research'
  /** Un solo presidente o più co-presidenti (ordine mostrato in UI). */
  chair: string | readonly string[]
  members: string[]
}

/** Normalizza `chair` stringa o lista per iterazione / resolve API. */
export function committeeChairs(c: ScientificCommitteeDef): readonly string[] {
  return typeof c.chair === 'string' ? [c.chair] : c.chair
}

/** Riga istituzione solo in Scientific Committees (non nei blocchi istituzione). */
export const SCIENTIFIC_COMMITTEE_MEMBER_INSTITUTION_OVERRIDES: Readonly<Record<string, string>> = {
  'Livio Ticli': 'Conservatorio Antonio Scontrino di Trapani',
}

export const PEOPLE_SCIENTIFIC_COMMITTEES: readonly ScientificCommitteeDef[] = [
  {
    id: 'historical',
    titleKey: 'Scientific Committee on Cultural Heritage',
    chair: 'Giovanna Cassese',
    members: [
      'Attilio Cantore',
      'Michela Corsini',
      'Gerardo De Simone',
      'Annamaria Ducci',
      'Nicoletta Leonardi',
      'Anna Mariani',
      'Marcello Mazzetti',
      'Chiara Nenci',
      'Maria Chiara Palandri',
      'Carlo Sassetti',
      'Livio Ticli',
    ],
  },
  {
    id: 'contemporary',
    titleKey: 'Scientific Committee on Contemporary Visual and Performing Arts',
    chair: 'Giovanni Iovane',
    members: [
      'Umberto Bellodi',
      'Fabio Iannotta',
      'Ilaria Mariotti',
      'Marcello Mazzetti',
      'Domenico Quaranta',
      'Rosanna Ruscio',
      'Lorella Scacco',
    ],
  },
  {
    id: 'postgraduate',
    titleKey: 'Committee on Internationalisation and Artistic Research',
    chair: ['Marcello Mazzetti', 'Domenico Quaranta'],
    members: [
      'Laura Barreca',
      'Samuel Bianchini',
      'Giovanna Cassese',
      'Elena Cologni',
      'Johan Andersson Haarberg',
      'Fabio Iannotta',
      'Nicoletta Leonardi',
      'Federica Martini',
      'Linda Messas',
      'Emanuele Quinz',
      'Livio Ticli',
    ],
  },
]
