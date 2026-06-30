import { GetDataUtils } from './GetDataUtils'

export interface OA_ManifestDataTarget {
  autore: string
  anno: string
  tecnica: string
  luogo: string
}

export class OA_ManifestData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: OA_ManifestDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.autore = GetDataUtils.getAutore(record, GetDataUtils.FIELD_GENERIC_AUTORE)
      target.anno = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_DATES, GetDataUtils.FIELD_BEGIN, GetDataUtils.FIELD_END)
      target.tecnica = GetDataUtils.getIIFTechnique(record, GetDataUtils.FIELD_MEDIUM)
      target.luogo = GetDataUtils.getDBMetadata(record, GetDataUtils.FIELD_PLACES)
    }
  }
}

export interface S_ManifestDataTarget {
  autore: string
  anno: string
  tecnica: string
  luogo: string
}

export class S_ManifestData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: S_ManifestDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.autore = GetDataUtils.getAutore(record, GetDataUtils.FIELD_GENERIC_AUTORE)
      target.anno = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_DATES, GetDataUtils.FIELD_BEGIN, GetDataUtils.FIELD_END)
      target.tecnica = GetDataUtils.getIIFTechnique(record, GetDataUtils.FIELD_MEDIUM)
      target.luogo = GetDataUtils.getDBMetadata(record, GetDataUtils.FIELD_PLACES)
    }
  }
}

export interface MIDF_ManifestDataTarget {
  autore: string
  anno: string
  tecnica: string
  luogo: string
}

export class MIDF_ManifestData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: MIDF_ManifestDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.autore = GetDataUtils.getAutore(record, GetDataUtils.FIELD_GENERIC_AUTORE)
      target.anno = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_DATES, GetDataUtils.FIELD_BEGIN, GetDataUtils.FIELD_END)
      target.tecnica = GetDataUtils.getIIFTechnique(record, GetDataUtils.FIELD_MEDIUM)
      target.luogo = GetDataUtils.getDBMetadata(record, GetDataUtils.FIELD_PLACES)
    }
  }
}

export interface MINV_ManifestDataTarget {
  autore: string
  anno: string
  tecnica: string
  luogo: string
}

export class MINV_ManifestData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: MINV_ManifestDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.autore = GetDataUtils.getAutore(record, GetDataUtils.FIELD_GENERIC_AUTORE)
      target.anno = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_DATES, GetDataUtils.FIELD_BEGIN, GetDataUtils.FIELD_END)
      target.tecnica = GetDataUtils.getIIFTechnique(record, GetDataUtils.FIELD_MEDIUM)
      target.luogo = GetDataUtils.getDBMetadata(record, GetDataUtils.FIELD_PLACES)
    }
  }
}

export interface SBN_ManifestDataTarget {
  autore: string
  anno: string
  tecnica: string
  luogo: string
}

export class SBN_ManifestData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: SBN_ManifestDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.autore = GetDataUtils.getAutoreSBN(record, GetDataUtils.FIELD_SBN_AUTORE)
      target.anno = GetDataUtils.getDatazioneSBN(record, GetDataUtils.FIELD_SBN_DATAZIONE)
      target.tecnica = GetDataUtils.getIIFTechnique(record, GetDataUtils.FIELD_MEDIUM)
      target.luogo = GetDataUtils.getDBMetadata(record, GetDataUtils.FIELD_PLACES)
    }
  }
}

export interface F_ManifestDataTarget {
  autore: string
  anno: string
  tecnica: string
  luogo: string
}

export class F_ManifestData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: F_ManifestDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.autore = GetDataUtils.getAutore(record, GetDataUtils.FIELD_GENERIC_AUTORE)
      target.anno = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_DATES, GetDataUtils.FIELD_BEGIN, GetDataUtils.FIELD_END)
      target.tecnica = GetDataUtils.getIIFTechnique(record, GetDataUtils.FIELD_MEDIUM)
      target.luogo = GetDataUtils.getDBMetadata(record, GetDataUtils.FIELD_PLACES)
    }
  }
}

export interface JSON_ManifestDataTarget {
  autore: string
  anno: string
  tecnica: string
  luogo: string
}

export class JSON_ManifestData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: JSON_ManifestDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.autore = GetDataUtils.getDBMetadata(record, GetDataUtils.FIELD_AGENTS)
      target.anno = GetDataUtils.getDatazioneJson(record, GetDataUtils.FIELD_JSON_DATAZIONE)
      target.tecnica = GetDataUtils.getIIFTechnique(record, GetDataUtils.FIELD_MEDIUM)
      target.luogo = GetDataUtils.getDBMetadata(record, GetDataUtils.FIELD_PLACES)
    }
  }
}

export interface SALON_ManifestDataTarget {
  titolo: string
}

  export class SALON_ManifestData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: SALON_ManifestDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.titolo = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SALON_TITOLO)
    }
  }
}