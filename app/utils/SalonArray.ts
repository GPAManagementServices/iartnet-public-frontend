import { existsField, fieldIsArray } from './recordFieldUtils'

function extractRecordFieldValue(rf: Record<string, unknown>, fieldKey: string): string {
  if (!existsField(rf, fieldKey))
    return ''

  const raw = rf[fieldKey]

  if (fieldIsArray(rf, fieldKey)) {
    return (raw as Array<{ value?: unknown }>)
      .map(item => (item?.value != null ? String(item.value) : ''))
      .filter(v => v.trim().length > 0)
      .join(', ')
  }

  if (raw !== null && typeof raw === 'object' && 'value' in raw) {
    const v = (raw as { value?: unknown }).value
    return v != null ? String(v) : ''
  }

  return raw != null ? String(raw) : ''
}

export interface SALON_Studente {
  nome: string
  cognome: string
  titolo: string
  scuola: string
  data: string
  tecnica: string
  dimensione: string
  professore: string
  scuolaAnno: string
  tipoOggetto: string
  raccomandazione: string
}

export interface SALON_Pagina {
  immagine: string
  studenti: SALON_Studente[]
}

export interface SALON_PagineTarget {
  pagine: SALON_Pagina[]
}

const PG_IMG_KEY_PATTERN = /^Pg_(\d+)_img$/
const STUDENT_FIELD_KEY_PATTERN = /^St[A-Za-z]+_(\d+)_pg_(\d+)$/

function buildStudente(
  rf: Record<string, unknown>,
  studentIndex: number,
  pageIndex: number,
): SALON_Studente {
  const suffix = `${studentIndex}_pg_${pageIndex}`
  return {
    nome: extractRecordFieldValue(rf, `StNome_${suffix}`),
    cognome: extractRecordFieldValue(rf, `StCognome_${suffix}`),
    titolo: extractRecordFieldValue(rf, `StTitolo_${suffix}`),
    scuola: extractRecordFieldValue(rf, `StScuola_${suffix}`),
    data: extractRecordFieldValue(rf, `StData_${suffix}`),
    tecnica: extractRecordFieldValue(rf, `StTecnica_${suffix}`),
    dimensione: extractRecordFieldValue(rf, `StDimensione_${suffix}`),
    professore: extractRecordFieldValue(rf, `StProfessore_${suffix}`),
    scuolaAnno: extractRecordFieldValue(rf, `StScuolaAnno_${suffix}`),
    tipoOggetto: extractRecordFieldValue(rf, `StTipoOggetto_${suffix}`),
    raccomandazione: extractRecordFieldValue(rf, `StRaccomandazione_${suffix}`),
  }
}

function studenteHasData(studente: SALON_Studente): boolean {
  return Object.values(studente).some(value => value.trim().length > 0)
}

export class SALON_PagineData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: SALON_PagineTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.pagine = SALON_PagineData.extractPagine(record)
    }
  }

  static extractPagine(record: Record<string, unknown>): SALON_Pagina[] {
    if (!existsField(record, 'record_fields'))
      return []

    const rf = record.record_fields as Record<string, unknown>
    const pageIndices = new Set<number>()
    const studentIndicesByPage = new Map<number, Set<number>>()

    for (const key of Object.keys(rf)) {
      const pgMatch = key.match(PG_IMG_KEY_PATTERN)
      if (pgMatch?.[1] != null) {
        const pageIndex = Number.parseInt(pgMatch[1], 10)
        if (Number.isFinite(pageIndex))
          pageIndices.add(pageIndex)
        continue
      }

      const studentMatch = key.match(STUDENT_FIELD_KEY_PATTERN)
      if (studentMatch?.[1] == null || studentMatch[2] == null)
        continue

      const studentIndex = Number.parseInt(studentMatch[1], 10)
      const pageIndex = Number.parseInt(studentMatch[2], 10)
      if (!Number.isFinite(studentIndex) || !Number.isFinite(pageIndex) || studentIndex < 1)
        continue

      pageIndices.add(pageIndex)
      if (!studentIndicesByPage.has(pageIndex))
        studentIndicesByPage.set(pageIndex, new Set())
      studentIndicesByPage.get(pageIndex)!.add(studentIndex)
    }

    return [...pageIndices]
      .sort((a, b) => a - b)
      .map((pageIndex) => {
        const studentIndices = [...(studentIndicesByPage.get(pageIndex) ?? [])]
          .sort((a, b) => a - b)

        const studenti = studentIndices
          .map(studentIndex => buildStudente(rf, studentIndex, pageIndex))
          .filter(studenteHasData)

        return {
          immagine: extractRecordFieldValue(rf, `Pg_${pageIndex}_img`),
          studenti,
        }
      })
  }
}
