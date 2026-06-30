import { GetDataUtils } from './GetDataUtils'

/*schede OA*/
export interface OA_TitleDataTarget {
  autore: string
  titolo: string
  anno: string
}

export class OA_TitleData {
  populate: (record: Record<string, unknown>) => void
  constructor(target: OA_TitleDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.autore = GetDataUtils.getAutore(record, GetDataUtils.FIELD_GENERIC_AUTORE)
      target.titolo = GetDataUtils.getTitoloGeneric(record, GetDataUtils.FIELD_GEN_TITOLO)
      target.anno = GetDataUtils.getAnno(record, GetDataUtils.FIELD_GENERIC_ANNO)
    }
  }
}

/*schede S*/
export interface S_TitleDataTarget {
  autore: string
  titolo: string
  anno: string
}

export class S_TitleData {
  populate: (record: Record<string, unknown>) => void
  constructor(target: S_TitleDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.autore = GetDataUtils.getAutore(record, GetDataUtils.FIELD_GENERIC_AUTORE)
      target.titolo = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_TITOLO_IT)
      target.anno = GetDataUtils.getAnno(record, GetDataUtils.FIELD_GENERIC_ANNO)
      
    }
  }
}

/*schede MIDF*/
export interface MIDF_TitleDataTarget {
  autore: string
  titolo: string
  titoloProprio: string
}

export class MIDF_TitleData {
  populate: (record: Record<string, unknown>) => void
  constructor(target: MIDF_TitleDataTarget) {
    this.populate = (record: Record<string, unknown>) => { 
      target.autore = GetDataUtils.getAutoreMIDF(record, GetDataUtils.FIELD_MIDF_AUTORE)
      target.titolo = GetDataUtils.getTitoloAttribuito(record, GetDataUtils.FIELD_TITOLO_IT) 
      target.titoloProprio = GetDataUtils.getTitoloProprio(record, GetDataUtils.FIELD_TITOLO_IT)
    }
  }
}

/*schede MINV*/
export interface MINV_TitleDataTarget {
  autore: string
  titolo: string
  titoloProprio: string
}

export class MINV_TitleData {
  populate: (record: Record<string, unknown>) => void
  constructor(target: MINV_TitleDataTarget) {
    this.populate = (record: Record<string, unknown>) => { 
      target.autore = GetDataUtils.getAutoreMIDF(record, GetDataUtils.FIELD_MINV_AUTORE)
      target.titolo = GetDataUtils.getTitoloAttribuito(record, GetDataUtils.FIELD_TITOLO_IT) 
      target.titoloProprio = GetDataUtils.getTitoloProprio(record, GetDataUtils.FIELD_TITOLO_IT)
    }
  }
}

/*schede SBN*/
export interface SBN_TitleDataTarget {
  autore: string
  titolo: string
  titoloM: string
}

export class SBN_TitleData {
  populate: (record: Record<string, unknown>) => void
  constructor(target: SBN_TitleDataTarget) {
    this.populate = (record: Record<string, unknown>) => { 
      target.autore = GetDataUtils.getAutoreSBN(record, GetDataUtils.FIELD_SBN_AUTORE)
      target.titolo = GetDataUtils.getTitoloSBN(record, GetDataUtils.FIELD_SBN_TITOLO)
      let titM = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_TITOLO_IT)
      if (titM.endsWith('.')) titM = titM.slice(0, -1)
      target.titoloM = titM.trim();      
    }
  }
}

/*schede F*/
export interface F_TitleDataTarget {
  autore: string
  titolo: string
  anno: string
}

export class F_TitleData {
  populate: (record: Record<string, unknown>) => void
  constructor(target: F_TitleDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.autore = GetDataUtils.getAutore(record, GetDataUtils.FIELD_GENERIC_AUTORE)
      target.titolo = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_TITOLO_IT)
      target.anno = GetDataUtils.getAnno(record, GetDataUtils.FIELD_GENERIC_ANNO)
    }
  }
}

/*schede JSON*/
export interface JSON_TitleDataTarget {
  autore: string
  titolo: string
}

export class JSON_TitleData {
  populate: (record: Record<string, unknown>) => void
  constructor(target: JSON_TitleDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.autore = GetDataUtils.getAgents(record, GetDataUtils.FIELD_AGENTS)
      target.titolo = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_TITOLO_IT)
    }
  }
}

/*schede Interview*/
export interface INTERVIEW_TitleDataTarget {
  titolo: string
  titolo2:string
}

export class INTERVIEW_TitleData {
  populate: (record: Record<string, unknown>) => void
  constructor(target: INTERVIEW_TitleDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.titolo = GetDataUtils.getTitoloIntervista(record, GetDataUtils.FIELD_INTERVIEW_TITOLO)
      target.titolo2 = GetDataUtils.getTitoloIntervista2(record, GetDataUtils.FIELD_INTERVIEW_TITOLO)     
    }
  }
}

/*schede Salon*/
export interface SALON_TitleDataTarget {
  titolo: string
  ente: string
}

export class SALON_TitleData {
  populate: (record: Record<string, unknown>) => void
  constructor(target: SALON_TitleDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      let titolo = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SALON_TITOLO)
      let anno = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SALON_YEAR)
    
      titolo = titolo.trim() + ' ' + anno.trim();

      target.titolo = titolo
      
      target.ente = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SALON_ENTE)
    }
  }
}