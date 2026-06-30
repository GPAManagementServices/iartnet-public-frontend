import { GetDataUtils } from './GetDataUtils'

export interface OA_HeaderDataTarget {
  tipologiaOggetto: string
  soggetto: string
  datazione: string
  istitutoDiConservazione: string
}

export class OA_HeaderData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: OA_HeaderDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.soggetto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_SOGGETTO)
      target.datazione = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_GENERIC_DATAZIONE)
      target.tipologiaOggetto = GetDataUtils.getOggetto(record, GetDataUtils.FIELD_OA_OGGETTO)
      target.istitutoDiConservazione = GetDataUtils.getLuogoConservazione(record, GetDataUtils.FIELD_OA_ISTITUTO_DI_CONSERVAZIONE)
    }
  }
}

export interface S_HeaderDataTarget {
  tipologiaOggetto: string
  soggetto: string
  datazione: string
  istitutoDiConservazione: string
}

export class S_HeaderData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: S_HeaderDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.soggetto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_S_SOGGETTO)
      target.datazione = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_GENERIC_DATAZIONE)
      target.tipologiaOggetto = GetDataUtils.getOggetto(record, GetDataUtils.FIELD_OA_OGGETTO)
      target.istitutoDiConservazione = GetDataUtils.getLuogoConservazione(record, GetDataUtils.FIELD_OA_ISTITUTO_DI_CONSERVAZIONE)
    }
  }
}

export interface MIDF_HeaderDataTarget {
  tipologiaOggetto: string
  soggetto: string
  datazione: string
  istitutoDiConservazione: string
}

export class MIDF_HeaderData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: MIDF_HeaderDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.soggetto = GetDataUtils.getSoggettoMIDF(record, GetDataUtils.FIELD_MIDF_SOGGETTO)
      target.datazione = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_GENERIC_DATAZIONE)
      target.tipologiaOggetto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_MIDF_OGGETTO)
      target.istitutoDiConservazione = GetDataUtils.getLuogoConservazione(record, GetDataUtils.FIELD_OA_ISTITUTO_DI_CONSERVAZIONE)
    }
  }
}

export interface MINV_HeaderDataTarget {
  tipologiaOggetto: string
  soggetto: string
  datazione: string
  istitutoDiConservazione: string
}

export class MINV_HeaderData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: MINV_HeaderDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.soggetto = GetDataUtils.getSoggettoMIDF(record, GetDataUtils.FIELD_MIDF_SOGGETTO)
      target.datazione = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_GENERIC_DATAZIONE)
      target.tipologiaOggetto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_MIDF_OGGETTO)
      target.istitutoDiConservazione = GetDataUtils.getLuogoConservazione(record, GetDataUtils.FIELD_OA_ISTITUTO_DI_CONSERVAZIONE)
    }
  }
}

export interface SBN_HeaderDataTarget {
  altriAutori: string
  soggetto: string
  tipologiaOggetto: string
  istitutoDiConservazione: string
  scaffale: string  
  permalink: string
  inventario: string
}

export class SBN_HeaderData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: SBN_HeaderDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.altriAutori = GetDataUtils.getAutoriSecSBN(record, GetDataUtils.FIELD_SBN_AUTORI_SEC)
      target.soggetto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_SOGGETTO, '')
      target.tipologiaOggetto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_TYPE, '')
      target.istitutoDiConservazione = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_ENTE, '')
      target.scaffale = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_COLLOCAZIONE, '')
      target.permalink = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_PERMALINK, '')
      target.inventario = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_INVENTARIO, '')
    }
  }
}

export interface F_HeaderDataTarget {
  tipologiaOggetto: string
  soggetto: string
  datazione: string
  istitutoDiConservazione: string
}

export class F_HeaderData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: F_HeaderDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.soggetto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_F_SOGGETTO)
      target.datazione = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_GENERIC_DATAZIONE)
      target.tipologiaOggetto = GetDataUtils.getOggetto(record, GetDataUtils.FIELD_OA_OGGETTO)
      target.istitutoDiConservazione = GetDataUtils.getLuogoConservazione(record, GetDataUtils.FIELD_OA_ISTITUTO_DI_CONSERVAZIONE)
    }
  }
}

export interface JSON_HeaderDataTarget {
  type: string
  copyrights: string
}

export class JSON_HeaderData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: JSON_HeaderDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.type = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_TYPE, '')
      // target.datazione = GetDataUtils.getDatazioneJson(record, GetDataUtils.FIELD_JSON_DATAZIONE)
      target.copyrights = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_COPYRIGHTS)
    }
  }
}

export interface INTERVIEW_HeaderDataTarget {
  date: string
  type: string
}

export class INTERVIEW_HeaderData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: INTERVIEW_HeaderDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.date = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_INTERVIEW_HEADER)
      target.type = "Interview"
    }
  }
}


export interface SALON_HeaderDataTarget {
  date: string
  type: string  
  
}

export class SALON_HeaderData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: SALON_HeaderDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.date = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SALON_YEAR)
      target.type = "Salon"
    }
  }
}