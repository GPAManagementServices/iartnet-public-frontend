import { existsField, fieldIsArray } from './recordFieldUtils'

interface TipoDomanda{ label: string, value: string }
interface TipoRisposta{ label: string, value: string }

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

function personNameToInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(part => part.length > 0)
  if (parts.length === 0)
    return ''
  if (parts.length === 1)
    return `${parts[0]![0]!.toUpperCase()}.`

  const first = parts[0]![0]!.toUpperCase()
  const last = parts[parts.length - 1]![0]!.toUpperCase()
  return `${first}.${last}.`
}

function interviewFieldSuffixNumber(fieldKey: string, prefix: string): number | null {
  if (!fieldKey.startsWith(prefix))
    return null
  const n = Number.parseInt(fieldKey.slice(prefix.length), 10)
  return Number.isFinite(n) ? n : null
}

function interviewFieldsAreZeroBased(keys: string[], prefix: string): boolean {
  return keys.some((key) => {
    const n = interviewFieldSuffixNumber(key, prefix)
    return n === 0
  })
}

function interviewFieldPairIndex(fieldKey: string, prefix: string, zeroBased: boolean): number {
  const n = interviewFieldSuffixNumber(fieldKey, prefix)
  if (n == null)
    return 0
  if (zeroBased)
    return n >= 0 ? n : 0
  return n >= 1 ? n - 1 : 0
}

function applyInterviewSpeakerTags(
  value: string,
  intervistatore: string,
  intervistato: string,
  useFullNames: boolean,
): string {
  const qSpeaker = useFullNames ? intervistatore : personNameToInitials(intervistatore)
  const aSpeaker = useFullNames ? intervistato : personNameToInitials(intervistato)
  return value.replaceAll('(Q)', qSpeaker).replaceAll('(A)', aSpeaker)
}

export interface INTERVIEW_DomandeRisposteTarget {
  domande: Array<TipoDomanda>
  risposte: Array<TipoRisposta>
}

export class INTERVIEW_DomandeRisposteData {
  populate: (record: Record<string, unknown>) => void

  private readonly identificazioneDomanda = 'domanda_'
  private readonly identificazioneRisposta = 'risposta_'

  constructor(target: INTERVIEW_DomandeRisposteTarget) {
    this.populate = (record: Record<string, unknown>) => {

      target.domande = []
      target.risposte = []      

      if (!existsField(record, 'record_fields'))
        return

      const x = record.record_fields as Record<string, unknown>
      const intervistatore = extractRecordFieldValue(x, 'intervistatore')
      const intervistato = extractRecordFieldValue(x, 'intervistato')
      const domande = Object.keys(x)
        .filter(key => key.startsWith(this.identificazioneDomanda))
      const risposte = Object.keys(x)
        .filter(key => key.startsWith(this.identificazioneRisposta))
      const zeroBasedDomande = interviewFieldsAreZeroBased(domande, this.identificazioneDomanda)
      const zeroBasedRisposte = interviewFieldsAreZeroBased(risposte, this.identificazioneRisposta)
      domande
        .sort((a, b) =>
          interviewFieldPairIndex(a, this.identificazioneDomanda, zeroBasedDomande)
          - interviewFieldPairIndex(b, this.identificazioneDomanda, zeroBasedDomande))
      risposte
        .sort((a, b) =>
          interviewFieldPairIndex(a, this.identificazioneRisposta, zeroBasedRisposte)
          - interviewFieldPairIndex(b, this.identificazioneRisposta, zeroBasedRisposte))
      domande.forEach((domanda, arrayIndex) => {
        const value = applyInterviewSpeakerTags(
          extractRecordFieldValue(x, domanda),
          intervistatore,
          intervistato,
          arrayIndex === 0,
        )
        target.domande.push({ label: domanda, value })
      })
      risposte.forEach((risposta, arrayIndex) => {
        const value = applyInterviewSpeakerTags(
          extractRecordFieldValue(x, risposta),
          intervistatore,
          intervistato,
          arrayIndex === 0,
        )
        target.risposte.push({ label: risposta, value })
      })

    }
  }
}

export interface INTERVIEW_DidascalieTarget {
  didascalie: string[]
}

export class INTERVIEW_DidascalieData {
  populate: (record: Record<string, unknown>) => void

  private readonly identificazioneDidascalia = 'didascalia_'

  constructor(target: INTERVIEW_DidascalieTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.didascalie = INTERVIEW_DidascalieData.extractDidascalie(record)
    }
  }

  static extractDidascalie(record: Record<string, unknown>): string[] {
    if (!existsField(record, 'record_fields'))
      return []

    const x = record.record_fields as Record<string, unknown>
    const prefix = 'didascalia_'
    const keys = Object.keys(x).filter(key => key.startsWith(prefix))
    if (keys.length === 0)
      return []

    let maxIndex = 0
    const byIndex = new Map<number, string>()

    for (const key of keys) {
      const n = Number.parseInt(key.slice(prefix.length), 10)
      if (!Number.isFinite(n) || n < 1)
        continue
      byIndex.set(n, extractRecordFieldValue(x, key).trim())
      maxIndex = Math.max(maxIndex, n)
    }

    const result: string[] = []
    for (let i = 1; i <= maxIndex; i++)
      result.push(byIndex.get(i) ?? '')

    return result
  }
}

export interface InterviewImageMapEntry {
  file: string
  dopo_domanda: number
  indice_immagine: number
}

export interface INTERVIEW_InlineImagePlacement {
  dopoDomanda: number
  indiceImmagine: number
  url: string
  caption: string
}

export interface INTERVIEW_InlineImagesTarget {
  placements: INTERVIEW_InlineImagePlacement[]
}

function unwrapImagesMapPayload(raw: unknown): Record<string, unknown> | null {
  if (raw == null)
    return null

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed.length)
      return null
    try {
      return unwrapImagesMapPayload(JSON.parse(trimmed) as unknown)
    }
    catch {
      return null
    }
  }

  if (Array.isArray(raw)) {
    const first = raw.find(
      (item): item is Record<string, unknown> =>
        item != null && typeof item === 'object',
    )
    if (!first)
      return null
    return unwrapImagesMapPayload(first)
  }

  if (typeof raw !== 'object')
    return null

  const obj = raw as Record<string, unknown>
  if ('value' in obj && obj.value != null && typeof obj.value === 'object')
    return unwrapImagesMapPayload(obj.value)

  return obj
}

export class INTERVIEW_ImagesMapData {
  static parseImagesMap(record: Record<string, unknown>): InterviewImageMapEntry[] {
    if (!existsField(record, 'record_fields'))
      return []

    const fields = record.record_fields as Record<string, unknown>
    if (!existsField(fields, 'images_map'))
      return []

    const payload = unwrapImagesMapPayload(fields.images_map)
    if (!payload)
      return []

    const immagini = payload.immagini
    if (!Array.isArray(immagini))
      return []

    const result: InterviewImageMapEntry[] = []
    for (const item of immagini) {
      if (item === null || typeof item !== 'object')
        continue
      const entry = item as Record<string, unknown>
      const indice = Number(entry.indice_immagine)
      const dopo = Number(entry.dopo_domanda)
      const file = entry.file != null ? String(entry.file) : ''
      if (!Number.isFinite(indice) || !Number.isFinite(dopo) || indice < 1)
        continue
      result.push({ file, dopo_domanda: dopo, indice_immagine: indice })
    }

    return result
  }
}

export class INTERVIEW_InlineImagesData {
  static buildPlacements(
    record: Record<string, unknown>,
    urls: string[],
    didascalie: string[],
  ): INTERVIEW_InlineImagePlacement[] {
    return INTERVIEW_ImagesMapData.parseImagesMap(record)
      .map((entry) => {
        const idx = entry.indice_immagine
        return {
          dopoDomanda: entry.dopo_domanda,
          indiceImmagine: idx,
          url: urls[idx] ?? '',
          caption: didascalie[idx]?.trim() ?? '',
        }
      })
      .filter(p => p.url.length > 0)
      .sort((a, b) => a.dopoDomanda - b.dopoDomanda || a.indiceImmagine - b.indiceImmagine)
  }
}

export interface INTERVIEW_MediaUrlsTarget {
  urls: string[]
}

export class INTERVIEW_MediaUrlsData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: INTERVIEW_MediaUrlsTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.urls = INTERVIEW_MediaUrlsData.extractImageUrls(record)
    }
  }

  //pct:50/   !200,300
  static extractImageUrls(record: Record<string, unknown>): string[] {
    if (!existsField(record, 'media') || !Array.isArray(record.media))
      return []

    return (record.media as Array<{ url?: unknown }>)
      .map((item) => {
        const url = item?.url
        if (typeof url !== 'string')
          return ''
        return url.trim().replaceAll('/max/', '/600,/')
      })
      .filter(url => url.length > 0)
  }
}
