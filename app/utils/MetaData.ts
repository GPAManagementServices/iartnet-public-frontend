import { GetDataUtils } from './GetDataUtils'
import type { PaeIncipit } from './PaeIncipit'

export interface OA_MetaDataTarget {
  titolo: string
  autore: string
  soggetto: string
  datazione: string
  iscrizioni: string
  stemmi: string
  tipologiaOggetto: string
  funzionaOriginaria: string
  tecnica_e_supporto: string
  misure: string
  acquisizione: string
  analyticalTechnique: string
  istitutoDiConservazione: string
  inventarioNumero: string
  mostre: string
  bibliografia: string
  bibliografia_AD: string
  statoDiConservazione: string
  restauri: string
  analisiDiagnostiche: string
  bibliografiaRelativaRestauro: string
  corniceBasamentoSupporto: string
  idSigec: string
  card_type: string
  oss_type: string
  crestad: string
}

export class OA_MetaData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: OA_MetaDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.titolo = GetDataUtils.getTitoloGeneric(record, GetDataUtils.FIELD_GEN_TITOLO)
      target.autore = GetDataUtils.getAutore(record, GetDataUtils.FIELD_GENERIC_AUTORE)
      target.soggetto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_SOGGETTO)
      target.datazione = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_GENERIC_DATAZIONE)

      target.iscrizioni = GetDataUtils.getIscrizioni(record, GetDataUtils.FIELD_OA_ISCRIZIONI)
      target.stemmi = GetDataUtils.getStemmi(record, GetDataUtils.FIELD_OA_CREST)
      target.misure = GetDataUtils.getMisure_OA(record, GetDataUtils.FIELD_OA_MISURE)
      target.tipologiaOggetto = GetDataUtils.getOggetto(record, GetDataUtils.FIELD_OA_OGGETTO)
      target.funzionaOriginaria = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_AD_ORIGINAL_FUNCTION)
      target.tecnica_e_supporto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_MATERIA_E_TECNICA)
      target.analyticalTechnique = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_ANALISI_TECNICA)
      target.acquisizione = GetDataUtils.getAcquisizione(record, GetDataUtils.FIELD_OA_ACQUISIZIONE)
      target.istitutoDiConservazione = GetDataUtils.getLuogoConservazione(record, GetDataUtils.FIELD_OA_ISTITUTO_DI_CONSERVAZIONE)
      target.inventarioNumero = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_INVENTORY_NUMBER)
      target.mostre = GetDataUtils.getMostre(record, GetDataUtils.FIELD_OA_MOSTRE)
      target.bibliografia = GetDataUtils.getBibliografia(record, GetDataUtils.FIELD_OA_BIBLIOGRAFIA)
      target.bibliografia_AD = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_BIBLIOGRAPHY_REFERENCE, GetDataUtils.EMPTY_DATA)
      target.statoDiConservazione = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_STATO_DI_CONSERVAZIONE)
      target.restauri = GetDataUtils.getRestauri(record, GetDataUtils.FIELD_OA_RESTAURI)
      target.analisiDiagnostiche = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_AD_DIAGNOSTIC_ANALYSIS)
      target.bibliografiaRelativaRestauro = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_AD_RESTORATION_BIBLIOGRAPHY)
      target.corniceBasamentoSupporto = GetDataUtils.getCorniceBasamentoSupporto(record, GetDataUtils.FIELD_OA_COBASUPP)
      target.idSigec = GetDataUtils.getIdSigec(record, GetDataUtils.FIELD_ID_SIGEC)
      target.card_type = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_CARD_TYPE)
      target.oss_type = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OSS_TYPE)
      target.crestad = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_AD_CREST)
    }
  }
}

export interface S_MetaDataTarget {
  titolo: string
  autore: string
  soggetto: string
  datazione: string
  iscrizioni: string
  stemmi: string
  tipologiaOggetto: string
  funzionaOriginaria: string
  tecnica_e_supporto: string
  misure: string
  acquisizione: string
  analyticalTechnique: string
  editori: string
  tiratura: string
  // da qui
  istitutoDiConservazione: string
  inventarioNumero: string
  mostre: string
  bibliografia: string
  bibliografia_AD: string
  statoDiConservazione: string
  restauri: string
  analisiDiagnostiche: string
  bibliografiaRelativaRestauro: string
  corniceBasamentoSupporto: string
  idSigec: string
}

export class S_MetaData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: S_MetaDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.titolo = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_TITOLO_IT)
      target.autore = GetDataUtils.getAutore(record, GetDataUtils.FIELD_GENERIC_AUTORE)
      target.soggetto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_SOGGETTO)
      target.datazione = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_GENERIC_DATAZIONE)

      target.editori = GetDataUtils.getEditori(record, GetDataUtils.FIELD_S_EDITORI)
      target.tiratura = GetDataUtils.getTiratura(record, GetDataUtils.FIELD_S_TIRATURA)

      target.iscrizioni = GetDataUtils.getIscrizioni(record, GetDataUtils.FIELD_OA_ISCRIZIONI)
      target.stemmi = GetDataUtils.getStemmi(record, GetDataUtils.FIELD_OA_CREST)
      target.misure = GetDataUtils.getMisure_S(record, GetDataUtils.FIELD_S_MISURE)
      target.tipologiaOggetto = GetDataUtils.getOggetto(record, GetDataUtils.FIELD_OA_OGGETTO)
      target.funzionaOriginaria = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_AD_ORIGINAL_FUNCTION)
      target.tecnica_e_supporto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_MATERIA_E_TECNICA)
      target.analyticalTechnique = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_ANALISI_TECNICA)
      target.acquisizione = GetDataUtils.getAcquisizione(record, GetDataUtils.FIELD_OA_ACQUISIZIONE)
      ////////
      target.istitutoDiConservazione = GetDataUtils.getLuogoConservazione(record, GetDataUtils.FIELD_OA_ISTITUTO_DI_CONSERVAZIONE)
      target.inventarioNumero = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_INVENTORY_NUMBER)
      target.mostre = GetDataUtils.getMostre(record, GetDataUtils.FIELD_OA_MOSTRE)
      target.bibliografia = GetDataUtils.getBibliografia(record, GetDataUtils.FIELD_OA_BIBLIOGRAFIA)
      target.bibliografia_AD = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_BIBLIOGRAPHY_REFERENCE, GetDataUtils.EMPTY_DATA)
      target.statoDiConservazione = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_STATO_DI_CONSERVAZIONE)
      target.restauri = GetDataUtils.getRestauri(record, GetDataUtils.FIELD_OA_RESTAURI)
      target.analisiDiagnostiche = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_AD_DIAGNOSTIC_ANALYSIS)
      target.bibliografiaRelativaRestauro = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_AD_RESTORATION_BIBLIOGRAPHY)
      target.corniceBasamentoSupporto = GetDataUtils.getCorniceBasamentoSupporto(record, GetDataUtils.FIELD_OA_COBASUPP)
      target.idSigec = GetDataUtils.getIdSigec(record, GetDataUtils.FIELD_ID_SIGEC)
    }
  }
}

export interface MIDF_MetaDataTarget {
  titolo: string
  titoloProprio: string
  autoreOriginale: string
  soggetto: string
  autore: string
  ambitoCulturale: string
  datazione: string
  luogoRipresa: string
  dataRipresa: string
  indicazionidiColore: string
  iscrizioni: string
  tipologiaOggetto: string
  funzionaOriginaria: string
  tecnica_e_supporto: string
  misure: string
  analyticalTechnique: string
  acquisizione: string
  istitutoDiConservazione: string
  mostre: string
  bibliografia: string
  restauri: string
  idSigec: string
}

export class MIDF_MetaData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: MIDF_MetaDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.titolo = GetDataUtils.getTitoloAttribuito(record, GetDataUtils.FIELD_TITOLO_IT) 
      target.titoloProprio = GetDataUtils.getTitoloProprio(record, GetDataUtils.FIELD_TITOLO_IT)
      target.autoreOriginale = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_ORIGINAL_AUTHOR, GetDataUtils.EMPTY_DATA)
      target.soggetto = GetDataUtils.getSoggettoMIDF(record, GetDataUtils.FIELD_MIDF_SOGGETTO)
      target.autore = GetDataUtils.getAutoreMIDF(record, GetDataUtils.FIELD_MIDF_AUTORE)
      target.ambitoCulturale = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_MIDF_AMBITO_CULTURALE)
      target.datazione = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_GENERIC_DATAZIONE)
      target.iscrizioni = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_MIDF_ISCRIZIONI)
      target.misure = GetDataUtils.getMisure_MIDF(record, GetDataUtils.FIELD_MIDF_MISURE)
      target.tipologiaOggetto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_MIDF_OGGETTO)
      target.funzionaOriginaria = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_AD_ORIGINAL_FUNCTION)
      target.tecnica_e_supporto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_MATERIA_E_TECNICA)
      target.analyticalTechnique = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_ANALISI_TECNICA)
      target.luogoRipresa = GetDataUtils.getLuogoRipresa(record, GetDataUtils.FIELD_LUOGO_RIPRESA)
      target.dataRipresa = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_F_DATA_RIPRESA)
      target.indicazionidiColore = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_F_INDICAZIONI_DI_COLORE)
      target.acquisizione = GetDataUtils.getAcquisizione(record, GetDataUtils.FIELD_OA_ACQUISIZIONE)
      target.istitutoDiConservazione = GetDataUtils.getLuogoConservazione(record, GetDataUtils.FIELD_OA_ISTITUTO_DI_CONSERVAZIONE)
      target.mostre = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_MIDF_MOSTRE)
      target.bibliografia = GetDataUtils.getBibliografia(record, GetDataUtils.FIELD_OA_BIBLIOGRAFIA)
      target.restauri = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_MIDF_RESTAURI)
      target.idSigec = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_ID_SIGECMIDF)
    }
  }
}

export interface MINV_MetaDataTarget {
  titolo: string
  titoloProprio: string
  autoreOriginale: string
  soggetto: string
  autore: string
  ambitoCulturale: string
  datazione: string
  indicazionidiColore: string
  iscrizioni: string
  tipologiaOggetto: string
  funzionaOriginaria: string
  tecnica_e_supporto: string
  misure: string
  analyticalTechnique: string
  acquisizione: string
  istitutoDiConservazione: string
  mostre: string
  bibliografia: string
  restauri: string
  idSigec: string
}

export class MINV_MetaData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: MINV_MetaDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.titolo = GetDataUtils.getTitoloAttribuito(record, GetDataUtils.FIELD_TITOLO_IT) 
      target.titoloProprio = GetDataUtils.getTitoloProprio(record, GetDataUtils.FIELD_TITOLO_IT)
      target.autoreOriginale = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_ORIGINAL_AUTHOR, GetDataUtils.EMPTY_DATA)
      target.soggetto = GetDataUtils.getSoggettoMIDF(record, GetDataUtils.FIELD_MIDF_SOGGETTO)
      target.autore = GetDataUtils.getAutoreMIDF(record, GetDataUtils.FIELD_MIDF_AUTORE)
      target.ambitoCulturale = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_MIDF_AMBITO_CULTURALE)
      target.datazione = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_GENERIC_DATAZIONE)
      target.iscrizioni = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_MIDF_ISCRIZIONI)
      target.misure = GetDataUtils.getMisure_MIDF(record, GetDataUtils.FIELD_MIDF_MISURE)
      target.tipologiaOggetto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_MIDF_OGGETTO)
      target.funzionaOriginaria = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_AD_ORIGINAL_FUNCTION)
      target.tecnica_e_supporto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_MATERIA_E_TECNICA)
      target.analyticalTechnique = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_ANALISI_TECNICA)
      target.indicazionidiColore = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_F_INDICAZIONI_DI_COLORE)
      target.acquisizione = GetDataUtils.getAcquisizione(record, GetDataUtils.FIELD_OA_ACQUISIZIONE)
      target.istitutoDiConservazione = GetDataUtils.getLuogoConservazione(record, GetDataUtils.FIELD_OA_ISTITUTO_DI_CONSERVAZIONE)
      target.mostre = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_MIDF_MOSTRE)
      target.bibliografia = GetDataUtils.getBibliografia(record, GetDataUtils.FIELD_OA_BIBLIOGRAFIA)
      target.restauri = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_MIDF_RESTAURI)
      target.idSigec = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_ID_SIGECMIDF)
    }
  }
}

export interface SBN_MetaDataTarget {
  titolo: string
  titoloM: string
  //titoloProprio: string
  autore: string
  altriAutori: string
  datazione: string
  edizione: string
  editore: string
  luogoedizione: string
  paeselingua: string
  descrizione: string
  titoloopera: string
  supporto: string
  relazioni: string
  inventario: string
  legatura: string
  note: string
  statoconservazione: string
  intemNote: string
  permalink: string
  notesBS: string
  strumento: string
  PentIncipit: PaeIncipit
}

export class SBN_MetaData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: SBN_MetaDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.titolo = GetDataUtils.getTitoloSBN(record, GetDataUtils.FIELD_SBN_TITOLO)
      let titM = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_TITOLO_IT)
      if (titM.endsWith('.')) titM = titM.slice(0, -1)
      target.titoloM = titM.trim();  
      target.autore = GetDataUtils.getAutoreSBN(record, GetDataUtils.FIELD_SBN_AUTORE)
      target.altriAutori = GetDataUtils.getAutoriSecSBN(record, GetDataUtils.FIELD_SBN_AUTORI_SEC)
      target.datazione = GetDataUtils.getDatazioneSBN(record, GetDataUtils.FIELD_SBN_DATAZIONE)
      target.edizione = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_EDIZIONE)
      target.editore = GetDataUtils.getSingleFieldTerminated(record, GetDataUtils.FIELD_SBN_EDITORE)
      target.luogoedizione = GetDataUtils.getSingleFieldTerminated(record, GetDataUtils.FIELD_SBN_LUOGOEDIZIONE)
      target.paeselingua = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_PAESELINGUA)
      target.descrizione = GetDataUtils.getDescrizioneSBN(record, GetDataUtils.FIELD_SBN_DESCRIZIONE)
      target.titoloopera = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_TITOLOOPERA)
      target.supporto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_SUPPORTO)
      target.relazioni = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_RELAZIONI)
      target.inventario = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_INVENTARIO)
      target.legatura = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_LEGATURA)
      target.note = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_NOTE)
      target.statoconservazione = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_STATOCONSERVAZIONE)
      target.intemNote = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_ITEMNOTES)
      target.permalink = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_PERMALINK)
      target.PentIncipit = GetDataUtils.getPaeIncipit(record, GetDataUtils.FIELD_SBN_PENT_INCIPIT)
      target.notesBS = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SBN_NOTES_M, '')
      target.strumento = GetDataUtils.getStrumenti(record, GetDataUtils.FIELD_SBN_STRUMENTO)
    }
  }
}

export interface F_MetaDataTarget {
  titolo: string
  autore: string
  soggetto: string
  datazione: string
  funzionaOriginaria: string
  tipologiaOggetto: string
  luogoRipresa: string
  dataRipresa: string
  indicazionidiColore: string
  stemmi: string
  iscrizioni: string
  tecnica_e_supporto: string
  misure: string
  formato: string
  collocazione: string
  bibliografia: string
  bibliografia_AD: string
  idSigec: string
}

export class F_MetaData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: F_MetaDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.titolo = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_TITOLO_IT)
      target.autore = GetDataUtils.getAutore(record, GetDataUtils.FIELD_GENERIC_AUTORE)
      target.soggetto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_F_SOGGETTO)
      target.datazione = GetDataUtils.getDatazione(record, GetDataUtils.FIELD_GENERIC_DATAZIONE)

      target.iscrizioni = GetDataUtils.getIscrizioni(record, GetDataUtils.FIELD_F_ISCRIZIONI)
      target.stemmi = GetDataUtils.getStemmi(record, GetDataUtils.FIELD_F_CREST)
      target.misure = GetDataUtils.getMisure_F(record, GetDataUtils.FIELD_F_MISURE)
      target.tipologiaOggetto = GetDataUtils.getOggetto(record, GetDataUtils.FIELD_OA_OGGETTO)
      target.tecnica_e_supporto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_OA_MATERIA_E_TECNICA)
      target.funzionaOriginaria = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_AD_ORIGINAL_FUNCTION)
      target.luogoRipresa = GetDataUtils.getLuogoRipresa(record, GetDataUtils.FIELD_LUOGO_RIPRESA)
      target.dataRipresa = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_F_DATA_RIPRESA)
      target.indicazionidiColore = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_F_INDICAZIONI_DI_COLORE)
      target.formato = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_F_FORMATO)
      target.collocazione = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_F_COLLOCAZIONE)
      target.bibliografia = GetDataUtils.getBibliografia(record, GetDataUtils.FIELD_OA_BIBLIOGRAFIA)
      target.bibliografia_AD = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_BIBLIOGRAPHY_REFERENCE, GetDataUtils.EMPTY_DATA)
      target.idSigec = GetDataUtils.getIdSigec(record, GetDataUtils.FIELD_ID_SIGEC)
    }
  }
}

export interface JSON_MetaDataTarget {
  titolo: string
  autore: string
  soggetto: string
  datazione: string
  contesto: string
  luogo: string
  opera: string
  compositore: string
  orchestra: string
  directorchestra: string
  regista: string
  dipartimento: string
  dataregistrazione: string
  corso: string
  docente: string
  collezione: string
  accademicyear: string
  copyrights: string
  generalOrganization: string
  researchAndScenario: string
  directorOfPhotography: string
}

export class JSON_MetaData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: JSON_MetaDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.titolo = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_TITOLO_IT)
      target.datazione = GetDataUtils.getDatazioneJson(record, GetDataUtils.FIELD_JSON_DATAZIONE)
      target.contesto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_CONTEXT)
      target.autore = GetDataUtils.getAgents(record, GetDataUtils.FIELD_AGENTS)
      target.soggetto = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_SUBJECT, '')
      target.luogo = GetDataUtils.getDBMetadata(record, GetDataUtils.FIELD_PLACES)
      target.opera = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_OPERA)
      target.compositore = GetDataUtils.getAutoreGeneric(record, GetDataUtils.FIELD_JSON_COMPOSITORE)
      target.orchestra = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_ORCHESTRA)
      target.directorchestra = GetDataUtils.getAutoreGeneric(record, GetDataUtils.FIELD_JSON_DIRECTORCHESTRA)
      target.regista = GetDataUtils.getAutoreGeneric(record, GetDataUtils.FIELD_JSON_REGISTA)
      target.dipartimento = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_DIPARTIMENTO)
      target.dataregistrazione = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_DATAREGISTRAZIONE)
      target.corso = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_CORSO)
      target.docente = GetDataUtils.getAutoreGeneric(record, GetDataUtils.FIELD_JSON_DOCENTE)
      target.collezione = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_COLLEZIONE)
      target.accademicyear = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_ACCADEMIC_YEAR)
      target.copyrights = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_COPYRIGHTS)
      target.generalOrganization = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_GENERAL_ORGANIZATION)
      target.researchAndScenario = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_RESEARCH_AND_SCENARIO)
      target.directorOfPhotography = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_JSON_DIRECTOR_OF_PHOTOGRAPHY)
    }
  }
}

export interface SALON_MetaDataTarget {
  titolo: string
  sedeEspositiva: string
}

export class SALON_MetaData {
  populate: (record: Record<string, unknown>) => void

  constructor(target: SALON_MetaDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.titolo = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SALON_TITOLO)
      target.sedeEspositiva = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_SALON_SEDE_ESPOSITIVA, '')
    }
  }
}
