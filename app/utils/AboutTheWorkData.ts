import { GetDataUtils } from './GetDataUtils'

export interface OA_AboutTheWorkDataTarget {
  about: string
}

export class OA_AboutTheWorkData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: OA_AboutTheWorkDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      const principale = GetDataUtils.getAbout(record, GetDataUtils.FIELD_ABOUT_MAIN)
      
      target.about = principale || ""
    }
  }
}

export interface S_AboutTheWorkDataTarget {
  about: string
}

export class S_AboutTheWorkData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: S_AboutTheWorkDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      const principale = GetDataUtils.getAbout(record, GetDataUtils.FIELD_ABOUT_MAIN)
     
      target.about = principale || ""
    }
  }
}

export interface MIDF_AboutTheWorkDataTarget {
  about: string
}

export class MIDF_AboutTheWorkData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: MIDF_AboutTheWorkDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      const principale = GetDataUtils.getAbout(record, GetDataUtils.FIELD_ABOUT_MAIN)
     
      target.about = principale || ""
    }
  }
}

export interface MINV_AboutTheWorkDataTarget {
  about: string
}

export class MINV_AboutTheWorkData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: MIDF_AboutTheWorkDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      const principale = GetDataUtils.getAbout(record, GetDataUtils.FIELD_ABOUT_MAIN)
     
      target.about = principale || ""
    }
  }
}

export interface SBN_AboutTheWorkDataTarget {
  about: string
}

export class SBN_AboutTheWorkData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: SBN_AboutTheWorkDataTarget) {
    this.populate = (record: Record<string, unknown>) => {

      target.about = "";
      /*
      const abwA = GetDataUtils.getAbout(record, GetDataUtils.FIELD_SBN_ABOUT_A)
      const abwB = GetDataUtils.getAbout(record, GetDataUtils.FIELD_SBN_ABOUT_B)
      const abwC = GetDataUtils.getAbout(record, GetDataUtils.FIELD_SBN_ABOUT_C)

      let abW = abwA + abwB + abwC;

      target.about = abW || GetDataUtils.NO_DATA;
      */
    }
  }
}

export interface F_AboutTheWorkDataTarget {
  about: string
}

export class F_AboutTheWorkData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: F_AboutTheWorkDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      const principale = GetDataUtils.getAbout(record, GetDataUtils.FIELD_ABOUT_MAIN)
     
      target.about = principale || ""
    }
  }
}

export interface JSON_AboutTheWorkDataTarget {
  about: string
}

export class JSON_AboutTheWorkData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: JSON_AboutTheWorkDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      const abw = GetDataUtils.getAbout(record, GetDataUtils.FIELD_JSON_DESCRIPTION)

      target.about = abw || "";
    }
  }
}

export interface INTERVIEW_AboutTheWorkDataTarget {
  about: string
}

export class INTERVIEW_AboutTheWorkData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: INTERVIEW_AboutTheWorkDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.about = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_INTERVIEW_BIO)
    }
  }
}

export interface SALON_AboutTheWorkDataTarget {
  about: string
}

export class SALON_AboutTheWorkData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: SALON_AboutTheWorkDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.about = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SALON_DESCRIZIONE)
    }
  }
}