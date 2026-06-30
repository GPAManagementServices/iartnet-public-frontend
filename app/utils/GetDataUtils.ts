import type { PaeIncipit } from './PaeIncipit'
import { cleanData, existsField, fieldIsArray } from './recordFieldUtils'

/** Stringa anno: sole cifre (dopo trim), per parsing sicuro in getDatazione. */
const DIGITS_ONLY_YEAR = /^\d+$/

/** Costanti per i tipi di scheda (card_type) usati nei record. */
export enum CardTypes {
  /** Scheda OA (Opera d'arte) */
  OA = 'OA',

  /** Scheda D, S, F */
  D = 'D',
  S = 'S',
  F = 'F',

  /** Scheda MI, MIDF, MINV */
  MI = 'MI',
  MIDF = 'MIDF',
  MINV = 'MINV',

  /** Scheda SBN (Scheda libro) */
  SBN = 'SBN',

  /** Scheda Scala */
  SCALA = 'SCALA',
}

/** Nomi dei campi record ICCD usati dai metodi GetDataUtils (e dai consumer). */
export class GetDataUtils {
  /** Valore usato per indicare "dato non disponibile". */
  static readonly NO_DATA = 'N/A'
  static readonly EMPTY_DATA = ''

  // Tipo di scheda
  static readonly FIELD_CARD_TYPE = 'card_type'
  static readonly FIELD_OSS_TYPE = 'AN/OSS'
  //autore
  static readonly FIELD_ICCD_AUTORE = 'AU/AUT/AUTN'

  // Intestazione
  // static readonly FIELD_TITLE = 'title'
  // static readonly FIELD_TITLE_FALLBACK_ICCD_MIDF = 'OG/OGN'
  // static readonly FIELD_SUBJECT_MAIN = 'subject'
  // static readonly FIELD_SUBJECT_FALLBACK_ICCD_MIDF = 'DA/SGT'
  // static readonly FIELD_SUBJECT_FALLBACK_SBN = 'ad_subject'

  //Titolo IT per tutte le schede elaborato nel Backend
  static readonly FIELD_TITOLO_IT = 'title_it'

  // Misure
  // static readonly FIELD_MT_MIS_MISA = 'MT/MIS/MISA'
  // static readonly FIELD_MT_MIS_MISL = 'MT/MIS/MISL'
  // static readonly FIELD_MT_MIS_MISU = 'MT/MIS/MISU'
  // static readonly FIELD_MT_MIS_MISM = 'MT/MIS/MISM' // fallback per MIDF

  //Metadati
  static readonly FIELD_TITLE = 'title'
  static readonly FIELD_AGENTS = 'agents'
  static readonly FIELD_DESCRIPTION = 'description'
  static readonly FIELD_MEDIUM = ['MT/MTC', 'medium']
  static readonly FIELD_PLACES = 'places'
  
  // Campi aggiuntivi
  static readonly FIELD_ABOUT_MAIN = 'ad_analytical_description'
  static readonly FIELD_ACQUISITION_TYPE = 'acquisition_type'
  static readonly FIELD_AD_DIAGNOSTIC_ANALYSIS = 'ad_diagnostic_analysis'
  static readonly FIELD_AD_FRAME_DESCRIPTION = 'ad_frame_description'
  static readonly FIELD_AD_FRAME_RESTORATION = 'ad_frame_restoration'
  static readonly FIELD_AD_FRAME_TYPE = 'ad_frame_type'
  static readonly FIELD_AD_RESTORATION_DESCRIPTION = 'ad_restoration_description'
  static readonly FIELD_AD_RESTORATION_BIBLIOGRAPHY = 'ad_restoration bibliography'
  static readonly FIELD_ANALYTICAL_TECHNIQUE = 'ad_analytical_technique'  
  static readonly FIELD_BIBLIOGRAPHY_REFERENCE = 'ad_bibliography'
  static readonly FIELD_AD_ORIGINAL_FUNCTION = 'ad_original_function'
  static readonly FIELD_TAGS = 'ad_tags'
  static readonly FIELD_AD_MOTHER_CARD_BID = 'ad_mother_card_bid'
  static readonly FIELD_AD_FORMAT = 'ad_format'
  static readonly FIELD_AD_TYPE = 'ad_type'
  static readonly FIELD_AD_RIGHTS = 'ad_rights'
  static readonly FIELD_AD_RELATION = 'ad_relation'
  static readonly FIELD_AD_RELATION_LINK = 'ad_relation_link'
  static readonly FIELD_AD_CREST = 'ad_crest'
  static readonly FIELD_AD_ALTERNATIVE_TITLE = 'ad_alternative_title'

  // static readonly FIELD_COLLOCAZIONE = 'LC/LDC'
  // static readonly FIELD_CONSERVATION_STATE = 'conservation_state'
  // static readonly FIELD_CREST_DESCRIPTION = 'crest_description'
  // static readonly FIELD_CRONO_MOTIVATION = 'crono_motivation'
  // static readonly FIELD_DA_ISR = 'DA/ISR'

  // Descrizione generica 
  static readonly FIELD_ABOUT_FALLBACK = 'DA/NSC'
  static readonly FIELD_ABOUT_FALLBACK1 = 'DA'
  static readonly FIELD_ABOUT_FALLBACK2 = 'description'

  static readonly FIELD_ABOUT_FALLBACK_S = 'DA/DES/DESS'

  //Desc. SBN
  static readonly FIELD_SBN_ABOUT_A = '260a'
  static readonly FIELD_SBN_ABOUT_B = '260b'
  static readonly FIELD_SBN_ABOUT_C = '260c'

  //Datazione generica
  static readonly FIELD_BEGIN = 'begin'
  static readonly FIELD_DATES = 'dates'
  static readonly FIELD_END = 'end'
  // static readonly FIELD_INVENTORY_NUMBER = 'inventory_number'
  // static readonly FIELD_INVENTORY_NUMBER_FALLBACK_ICCD_MIDF = 'IS/INV/INVN'

  // static readonly FIELD_OG_OGT = 'OG/OGT'
  // static readonly FIELD_PROPRIETA = 'TU/CDG'
  // static readonly FIELD_READING_OPERA = 'ad_analytical_description'
  // static readonly FIELD_RESTORATION_BIBLIOGRAPHY = 'ad_restoration bibliography'
  // static readonly FIELD_RESTORATION_DATE = 'restoration_date'
  // static readonly FIELD_TAGS = 'ad_tags'

  //Identificativo Sigec
  static readonly FIELD_ID_SIGEC = ['CD/NCT/NCTN', 'CD/NCT/NCTR','CD/NCT/NCTS','RV/RVE/RVEL']
  static readonly FIELD_ID_SIGECMIDF = 'CD/CDM'

  /*  -------------------------------- */
  // Zona Titolo
  static readonly FIELD_GENERIC_AUTORE = ['AU/AUT/AUTN', 'AU/AUT/AUTS', 'AU/AUT/AUTR','RO/ROF/ROFA']
  static readonly FIELD_GENERIC_ANNO = 'DT/DTS/DTSF'

  //OA
  static readonly FIELD_OA_TITOLO = 'OG/SGT/SGTT'
  static readonly FIELD_GEN_TITOLO = ['ad_alternative_title','title_it']

  //S
  static readonly FIELD_S_EDITORI = ['AU/EDT/EDTN', 'AU/EDT/EDTR', 'AU/EDT/EDTL']
  static readonly FIELD_S_TITOLO = ['OG/SGT/SGTP', 'OG/SGT/SGTT']
  static readonly FIELD_S_TIRATURA = ['AU/TRT/TRTN','AU/TRT/TRTC']
  static readonly FIELD_F_TITOLO = ['SG/SGT/SGTI','SG/SGT']

  //MIDF
  static readonly FIELD_MIDF_AUTORE = ['AU/AUT/AUTN']
  static readonly FIELD_MIDF_TITOLO = 'OG/OGN'
  
  static readonly FIELD_MINV_AUTORE = ['DT/AUT/AUTN']

  /*schede SBN*/
  static readonly FIELD_SBN_AUTORE = ['100a']
  static readonly FIELD_SBN_TITOLO = ['ad_alternative_title','title_it']

  // Zona Header
  static readonly FIELD_GENERIC_DATAZIONE = ['DT/DTS/DTSF', 'DT/DTS/DTSI', 'DT/DTS/DTSL', 'DT/DTS/DTSV', 'DT/DTZ/DTZG', 'DT/DTZ/DTZS']

  static readonly FIELD_ORIGINAL_AUTHOR = 'RO/ROF'
  static readonly FIELD_OA_SOGGETTO = 'OG/SGT/SGTI'
  static readonly FIELD_S_SOGGETTO = 'OG/SGT/SGTI'
  static readonly FIELD_F_SOGGETTO = 'SG/SGL'
  static readonly FIELD_MIDF_SOGGETTO = ['DA/SGT', 'DA/SGI']
  static readonly FIELD_MIDF_AMBITO_CULTURALE = 'AU/ATB'

  static readonly FIELD_SBN_AUTORI_SEC = ['700a','773a']
  static readonly FIELD_SBN_SOGGETTO = 'ad_subject'
  static readonly FIELD_SBN_TYPE = 'ad_type'
  static readonly FIELD_SBN_ENTE = 'ad_ente'
  static readonly FIELD_SBN_DATAZIONE = ['260c','260g']   
  static readonly FIELD_SBN_COLLOCAZIONE = 'ad_location'
  static readonly FIELD_SBN_EDIZIONE = '250a'
  static readonly FIELD_SBN_EDITORE = '260b'
  static readonly FIELD_SBN_LUOGOEDIZIONE = '260a'
  static readonly FIELD_SBN_PAESELINGUA = '041a'
  static readonly FIELD_SBN_DESCRIZIONE = ['300a','300b','300c','300e']
  static readonly FIELD_SBN_TITOLOOPERA = '240a'
  static readonly FIELD_SBN_SUPPORTO = 'ad_format'
  static readonly FIELD_SBN_RELAZIONI = 'ad_relations'
  static readonly FIELD_SBN_INVENTARIO = 'ad_inventory'
  static readonly FIELD_SBN_LEGATURA = 'ad_legatory'
  static readonly FIELD_SBN_NOTE = 'ad_notes'
  static readonly FIELD_SBN_STATOCONSERVAZIONE = 'ad_conservation_status'
  static readonly FIELD_SBN_ITEMNOTES = 'ad_itemnotes'
  static readonly FIELD_SBN_PERMALINK = 'ad_permalink'
  /** Incipit PAE: note/contesto, chiave, tempo, alterazioni (armatura). */
  static readonly FIELD_SBN_PENT_INCIPIT = ['926c', '926m', '926o', '926n']
  static readonly FIELD_SBN_NOTES_M = '500a'
  static readonly FIELD_SBN_STRUMENTO = '926h'
   
  // Zona Meta

  static readonly FIELD_LUOGO_RIPRESA = ['LR/LRC/LRCS', 'LR/LRC/LRCT','LR/LRC/LRCC','LR/LRC/LRCP']


  static readonly FIELD_OA_ISCRIZIONI = ['DA/ISR/ISRP', 'DA/ISR/ISRS', 'DA/ISR/ISRI']
  static readonly FIELD_OA_CREST = ['DA/STM/STMC', 'DA/STM/STMQ', 'DA/STM/STMI', 'DA/STM/STMP', 'DA/STM/STMD']
  static readonly FIELD_OA_MISURE = ['MT/MIS/MISU', 'MT/MIS/MISA', 'MT/MIS/MISL', 'MT/MIS/MISN', 'MT/MIS/MISD', 'MT/MIS/MISV']
  static readonly FIELD_S_MISURE = ['MT/MIS/MISU', 'MT/MIS/MISA', 'MT/MIS/MISL', 'MT/MIS/MISD']
  static readonly FIELD_OA_OGGETTO = ['OG/OGT/OGTD', 'OGTT']
  static readonly FIELD_OA_MATERIA_E_TECNICA = 'MT/MTC'
  static readonly FIELD_OA_ANALISI_TECNICA = 'ad_analytical_technique'
  static readonly FIELD_OA_ACQUISIZIONE = ['TU/ACQ/ACQN', 'TU/ACQ/ACQT', 'TU/ACQ/ACQL']
  static readonly FIELD_OA_ISTITUTO_DI_CONSERVAZIONE = ['LC/LDC/LDCM', 'ad_institution']
  static readonly FIELD_OA_INVENTORY_NUMBER = 'UB/INV/INVN'
  static readonly FIELD_OA_MOSTRE = ['MSTT', 'MSTL', 'MSTD']

  static readonly FIELD_OA_BIBLIOGRAFIA = 'DO/BIB'

  static readonly FIELD_OA_STATO_DI_CONSERVAZIONE = 'CO/STC/STCC'
  static readonly FIELD_OA_RESTAURI = ['ad_restoration_description','RSN', 'RST']
  static readonly FIELD_OA_COBASUPP =['ad_frame_type','ad_frame_description','ad_frame_restoration']

  //MIDF
  static readonly FIELD_MIDF_MISURE = ['MT/MIS/MISU', 'MT/MIS/MISM', 'MT/MIS/MISZ']
  static readonly FIELD_MIDF_OGGETTO = 'OG/OGD'
  static readonly FIELD_MIDF_ISCRIZIONI = 'DA/ISE'
  static readonly FIELD_MIDF_RESTAURI = 'RS/RST'
  static readonly FIELD_MIDF_MOSTRE = 'DO/MST'
  static readonly FIELD_MIDF_ACQUISIZIONE = ['TU/ACQ/ACQT', 'TU/ACQ/ACQD']

  //F
  static readonly FIELD_F_ISCRIZIONI = ['DA/ISE/ISER', 'DA/ISE/ISEP', 'DA/ISE/ISED']  
  static readonly FIELD_F_DATA_RIPRESA = 'LR/LRD'
  static readonly FIELD_F_INDICAZIONI_DI_COLORE = 'MT/MTX'
  static readonly FIELD_F_FORMATO = 'MT/FRM'
  static readonly FIELD_F_TECNICA_E_SUPPORTO = 'MT/MTC'
  static readonly FIELD_F_COLLOCAZIONE = 'UB/UBF/UBFP'
  static readonly FIELD_F_CREST = ['DA/STM/STMC', 'DA/STM/STMQ', 'DA/STM/STMI', 'DA/STM/STMP', 'DA/STM/STMD']
  static readonly FIELD_F_MISURE = [ 'MT/MIS/MISU','MT/MIS/MISM']

  //Json
  static readonly FIELD_JSON_TITOLO = 'title'
  static readonly FIELD_JSON_TYPE = 'type'
  static readonly FIELD_JSON_SUBJECT = 'subject'
  static readonly FIELD_JSON_DESCRIPTION = 'description'
  static readonly FIELD_JSON_RELATION = 'relation'
  static readonly FIELD_JSON_PUBLISHER = 'publisher'
  static readonly FIELD_JSON_DATAZIONE = ['begin', 'end']
  static readonly FIELD_JSON_COVERAGE = 'coverage'
  static readonly FIELD_JSON_COPYRIGHTS = 'copyrights_management'
  static readonly FIELD_JSON_CONTEXT = 'context'
  static readonly FIELD_JSON_LUOGO = 'place'
  static readonly FIELD_JSON_OPERA = 'opera'
  static readonly FIELD_JSON_COMPOSITORE = 'composer'
  static readonly FIELD_JSON_ORCHESTRA = 'orchestra_group'
  static readonly FIELD_JSON_DIRECTORCHESTRA = 'director_orchestra'
  static readonly FIELD_JSON_REGISTA = 'director'
  static readonly FIELD_JSON_DIPARTIMENTO = 'department'
  static readonly FIELD_JSON_DATAREGISTRAZIONE = 'registration_date'
  static readonly FIELD_JSON_CORSO = 'course'
  static readonly FIELD_JSON_DOCENTE = 'teacher'
  static readonly FIELD_JSON_COLLEZIONE = 'collection'
  static readonly FIELD_JSON_ACCADEMIC_YEAR = 'academic_year'
  static readonly FIELD_JSON_DIGITAL_RESOURCES = 'digital_resources'
  static readonly FIELD_JSON_GENERAL_ORGANIZATION = 'General Organization'
  static readonly FIELD_JSON_RESEARCH_AND_SCENARIO = 'Research and Scenario'
  static readonly FIELD_JSON_DIRECTOR_OF_PHOTOGRAPHY = 'Director of Photography' 

  //INTERVIEW
  static readonly FIELD_INTERVIEW_TITOLO = ['intervistatore', 'intervistato']
  static readonly FIELD_INTERVIEW_TITOLO2 = ['intervistatore', 'intervistato']
  static readonly FIELD_INTERVIEW_HEADER = 'header'
  static readonly FIELD_INTERVIEW_BIO = 'bio'

  //SALON
  static readonly FIELD_SALON_TITOLO = 'Titolo'
  static readonly FIELD_SALON_YEAR = 'Anno'
  static readonly FIELD_SALON_ENTE = 'Ente'
  static readonly FIELD_SALON_SEDE_ESPOSITIVA = 'SedeEspositiva'
  static readonly FIELD_SALON_DESCRIZIONE = 'Descrizione'


  private static getDefaultValue(defaultValue?: string): string {
    return defaultValue !== undefined ? defaultValue! : GetDataUtils.NO_DATA
  }

  static capitalizeFirstLetter(str: string): string {
    if (!str) return str; // gestisce stringhe vuote
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static unCapitalizeFirstLetter(str: string): string {
    if (!str) return str; // gestisce stringhe vuote
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * Estrae il testo da un campo ripetibile in record_fields (array di { value }).
   * Restituisce stringa vuota se il campo manca o non è un array.
   */
  static getAbout(record: Record<string, unknown>, fieldToRead: string): string {
    if (!existsField(record, 'record_fields'))
      return ''
    const rf = record.record_fields as Record<string, unknown>
    if (!existsField(rf, fieldToRead) || !fieldIsArray(rf, fieldToRead))
      return ''
    const title = rf[fieldToRead] as Array<{ value: string }>
    return cleanData(title.map(t => t.value).join(', '))
  }

  static getTitoloGeneric(record: Record<string, unknown>, fieldToRead: string[]): string {
    const ad_alternate_title = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const titolo = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)

    if ( ad_alternate_title ) return ad_alternate_title;
    else return titolo;
  }

  static getTitoloSBN(record: Record<string, unknown>, fieldToRead: string[]): string {
    const ad_alternate_title = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const titolo = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)

    let maxLen = 40;  

    if ( ad_alternate_title ) return ad_alternate_title;

    if ( titolo.length < maxLen ) return titolo;
    else {      
      let cut = titolo.substring(0, maxLen);
      // trova ultimo spazio
      let lastSpace = cut.lastIndexOf(" ");
      if (lastSpace > 0) {
          cut = cut.substring(0, lastSpace);
      }

      // rimuove spazi finali
      cut = cut.trim();

      // rimuove punteggiatura finale
      cut = cut.replace(/[.,;:!?]+$/g, "");
      return cut + " [...]";
    }

  }

  static getTitoloShort(record: Record<string, unknown>, fieldToRead: string): string {
    let titolo = GetDataUtils.getSingleField(record, fieldToRead!, GetDataUtils.FIELD_TITOLO_IT)


    const stringheDaRimuovere = [
      'denominazione attuale',
      'denominazione attribuita',
      'denominazione dialettale',
      'denominazione locale',
      'denominazione originaria',
      'denominazione storica',
      'denominazione tradizionale',
      'titolo proprio',
      'Titolo proprio',
      'titolo attribuito',
      'Titolo attribuito',
    ]

    for (const s of stringheDaRimuovere)
      titolo = titolo.replaceAll(s, '')

    titolo = titolo.replaceAll('()', '')

    let maxLen = 40;  
    if ( titolo.length < maxLen ) return titolo;
    else {      
      let cut = titolo.substring(0, maxLen);
      // trova ultimo spazio
      let lastSpace = cut.lastIndexOf(" ");
      if (lastSpace > 0) {
          cut = cut.substring(0, lastSpace);
      }

      // rimuove spazi finali
      cut = cut.trim();

      // rimuove punteggiatura finale
      cut = cut.replace(/[.,;:!?]+$/g, "");
      return cut + " [...]";
    }
  }  

  static getTitoloProprio(record: Record<string, unknown>, fieldToRead: string): string {
    let titolo = GetDataUtils.getSingleField(record, fieldToRead!, GetDataUtils.FIELD_TITOLO_IT)

    if (!titolo.includes('titolo proprio') && !titolo.includes('Titolo proprio'))
      return GetDataUtils.EMPTY_DATA

    titolo = titolo.replaceAll('titolo proprio', '')
    titolo = titolo.replaceAll('Titolo proprio', '')
    titolo = titolo.replaceAll('()', '')
    return titolo.trim()
  }

  static getTitoloIntervista(record: Record<string, unknown>, fieldToRead: string[]): string {
    const intervistatore = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const intervistato = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)

    let titolo = 'Interview with ' + intervistato;

    return titolo.trim()
  }  

  static getTitoloIntervista2(record: Record<string, unknown>, fieldToRead: string[]): string {
    const intervistatore = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const intervistato = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)

    let titolo = "by " + intervistatore;

    return titolo.trim()
  }  

  static getTitoloAttribuito(record: Record<string, unknown>, fieldToRead: string): string {
    let titolo = GetDataUtils.getSingleField(record, fieldToRead!, GetDataUtils.FIELD_TITOLO_IT)

    if (titolo.includes('titolo proprio') || titolo.includes('Titolo proprio'))
      return GetDataUtils.EMPTY_DATA

    const stringheDaRimuovere = [
      'denominazione attuale',
      'denominazione attribuita',
      'denominazione dialettale',
      'denominazione locale',
      'denominazione originaria',
      'denominazione storica',
      'denominazione tradizionale',
      'titolo proprio',
      'Titolo proprio',
      'titolo attribuito',
      'Titolo attribuito'
    ]

    for (const s of stringheDaRimuovere)
      titolo = titolo.replaceAll(s, '')

    titolo = titolo.replaceAll('()', '')

    return titolo.trim()
  }  

  static getAnno(_record: Record<string, unknown>, _fieldToRead: string): string {
    return ''
  }

  static getAutore(record: Record<string, unknown>, fieldToRead: string[]): string {
    let autn = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const auts = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const autr = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)
    const rofa = GetDataUtils.getSingleField(record, fieldToRead[3]!, GetDataUtils.EMPTY_DATA)
    
    autn = autn.replaceAll('(attr.)', '')

    let autn_e = autn;
    if (autn.includes(',')) {
      const autnParts = autn.split(',')
      autn_e = `${autnParts[1]} ${autnParts[0]}`
    }

    let autor = autn_e + ' ' + auts;

    /*
    if ( autr != "" ) {
      autor = autor + ' (' + autr + ')';
    }
    */

    if (rofa != "" && rofa != autn) {

      autor = autor + '  after ' + rofa;
    }

    return autor
  }

  static getAutoreGeneric(record: Record<string, unknown>, fieldToRead: string): string {
    let autn = GetDataUtils.getSingleField(record, fieldToRead!, GetDataUtils.EMPTY_DATA)
  
    autn = autn.replaceAll('(attr.)', '')

    if (autn.includes(',')) {
      const autnParts = autn.split(',')
      autn = `${autnParts[1]} ${autnParts[0]}`
    }

    return `${autn}`
  }  

  static getAutoreMIDF(record: Record<string, unknown>, fieldToRead: string[]): string {
    let autn = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
  
    autn = autn.replaceAll('(attr.)', '')

    if (autn.includes(',')) {
      const autnParts = autn.split(',')
      autn = `${autnParts[1]} ${autnParts[0]}`
    }

    return `${autn}`
  }  

  static getAutoreSBN(record: Record<string, unknown>, fieldToRead: string[]): string {
    let autn = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
  
    if (autn.includes(',')) {
      const autnParts = autn.split(',')
      autn = `${autnParts[1]} ${autnParts[0]}`
    }

    return `${autn}`
  }   

  static getAutoriSecSBN(record: Record<string, unknown>, fieldToRead: string[]): string {
    let autn1 = GetDataUtils.getSingleField(record, fieldToRead[0]!, "")
    let autn2 = GetDataUtils.getSingleField(record, fieldToRead[1]!, "")

    if (autn1.includes(',')) {
      const autnParts = autn1.split(',')
      autn1 = `${autnParts[1]} ${autnParts[0]}`
    }    

    if (autn2.includes(',')) {
      const autnParts = autn2.split(',')
      autn2 = `${autnParts[1]} ${autnParts[0]}`
    }     

    let autn = "";
    if (autn1) autn = autn1;
    if (autn2) autn = autn + ", " + autn2;

    // rimuove punteggiatura iniziale
    autn = autn.replace(/^[.,;:!?']+/g, "");

    return `${autn}`
  }   

  static getDatazioneSBN(record: Record<string, unknown>, fieldToRead: string[]): string {
    let autn1 = GetDataUtils.getSingleField(record, fieldToRead[0]!, "")
    let autn2 = GetDataUtils.getSingleField(record, fieldToRead[1]!, "")
   
    let autn = autn1;
    if ( autn == "" ) autn = autn2;

    return `${autn}`
  } 

  static getDatazioneJson(record: Record<string, unknown>, fieldToRead: string[]): string {
    let begin= GetDataUtils.getSingleField(record, fieldToRead[0]!, "")
    let end = GetDataUtils.getSingleField(record, fieldToRead[1]!, "")

    let datazione = "";
    if (begin != "" && end != "") {
      datazione = `${begin}-${end}`;
    } else if (begin != "") {
      datazione = begin;
    } else if (end != "") {
      datazione = end;
    }
   
    return datazione;
  }   

  private static isBlank(s: string): boolean {
    return s.trim().length === 0
  }

  /** Anno intero solo se la stringa è composta da sole cifre (dopo trim). */
  private static parseYearDigits(s: string): number | null {
    const t = s.trim()
    if (!DIGITS_ONLY_YEAR.test(t))
      return null
    const n = Number.parseInt(t, 10)
    return Number.isFinite(n) ? n : null
  }

  private static getDatazioneIccd(record: Record<string, unknown>, fieldToRead: string[]): string {
    const DTSF = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const DTSI = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const DTZG = GetDataUtils.getSingleField(record, fieldToRead[4]!, GetDataUtils.EMPTY_DATA)
    const DTZS = GetDataUtils.getSingleField(record, fieldToRead[5]!, GetDataUtils.EMPTY_DATA)

    const dtsiBlank = GetDataUtils.isBlank(DTSI)
    const dtsfBlank = GetDataUtils.isBlank(DTSF)

    if (dtsiBlank && dtsfBlank) {
      const z = [DTZG, DTZS].filter(s => !GetDataUtils.isBlank(s)).join(' ').trim()
      return z.length > 0 ? z : GetDataUtils.NO_DATA
    }

    const rangeDefault = (): string => {
      if (!dtsiBlank && !dtsfBlank)
        return `${DTSI}-${DTSF}`
      if (!dtsiBlank)
        return DTSI
      return DTSF
    }

    if (!dtsiBlank && !dtsfBlank && DTSI === DTSF)
      return DTSI

    const nI = GetDataUtils.parseYearDigits(DTSI)
    const nF = GetDataUtils.parseYearDigits(DTSF)
    if (nI !== null && nF !== null && nI !== nF) {
      // Secolo + 100 anni: solo DTZG se DTZS vuoto
      if (nI % 100 === 0 && nF === nI + 100) {
        if (!GetDataUtils.isBlank(DTZG) && GetDataUtils.isBlank(DTZS))
          return DTZG
        return rangeDefault()
      }
      // Quarto / metà secolo: DTZG + DTZS solo se entrambi compilati (simmetrico su DTSF multiplo di 100)
      const exception25or50
        = (nI % 100 === 0 && (nF === nI + 25 || nF === nI + 50))
          || (nF % 100 === 0 && (nI === nF - 25 || nI === nF - 50))
      if (exception25or50) {
        if (!GetDataUtils.isBlank(DTZG) && !GetDataUtils.isBlank(DTZS))
          return `${DTZG} ${DTZS}`.trim()
        return rangeDefault()
      }
    }

    return rangeDefault()
  }

  /**
   * Datazione dal primo elemento dell'array `dates` sul record (ISO begin/end → anno).
   */
  private static getDatazioneFromDates(
    record: Record<string, unknown>,
    datesField: string,
    beginKey: string,
    endKey: string,
  ): string {
    if (!existsField(record, datesField) || !fieldIsArray(record, datesField))
      return GetDataUtils.NO_DATA
    const dates = record[datesField] as Array<Record<string, unknown>>
    if (dates.length === 0)
      return GetDataUtils.NO_DATA
    const first = dates[0]
    if (!first)
      return GetDataUtils.NO_DATA
    const beginVal = first[beginKey]
    const endVal = first[endKey]
    const beginDate = typeof beginVal === 'string' ? (beginVal.split('-')[0]?.trim() ?? '') : ''
    const endDate = typeof endVal === 'string' ? (endVal.split('-')[0]?.trim() ?? '') : ''
    if (!beginDate && !endDate)
      return GetDataUtils.NO_DATA
    if (beginDate && endDate) {
      if (beginDate === endDate)
        return beginDate
      return `${beginDate}-${endDate}`
    }
    return beginDate || endDate
  }

  /**
   * Datazione da campi ICCD (`FIELD_DATAZIONE`) oppure da array `dates` + chiavi begin/end.
   */
  static getDatazione(
    record: Record<string, unknown>,
    fieldToRead: string[],
  ): string
  static getDatazione(
    record: Record<string, unknown>,
    datesField: string,
    beginKey: string,
    endKey: string,
  ): string
  static getDatazione(
    record: Record<string, unknown>,
    fieldToReadOrDatesField: string[] | string,
    beginKey?: string,
    endKey?: string,
  ): string {
    if (Array.isArray(fieldToReadOrDatesField))
      return GetDataUtils.getDatazioneIccd(record, fieldToReadOrDatesField)
    if (beginKey === undefined || endKey === undefined)
      return GetDataUtils.NO_DATA
    return GetDataUtils.getDatazioneFromDates(record, fieldToReadOrDatesField, beginKey, endKey)
  }

  static getIscrizioni(record: Record<string, unknown>, fieldToRead: string[]): string {
    const ISRP = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const ISRS = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const ISRI = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)

    const skType = GetDataUtils.getSingleField(record,GetDataUtils.FIELD_CARD_TYPE)
    const skOSS = GetDataUtils.getSingleField(record,GetDataUtils.FIELD_OSS_TYPE)
    const autore = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_ICCD_AUTORE)

    // se la scheda è di tipo OA e l'OSS è Contemporary, non mostra le iscrizioni
    if (skType === 'OA' && skOSS.includes('Contemporary')) {
      return GetDataUtils.EMPTY_DATA
    }    
    else if (skType === 'D' && autore.includes('Appiani')) {
      return GetDataUtils.EMPTY_DATA
    }    
    else if (skType === 'S' && skOSS.includes('Contemporary') ) {
      return GetDataUtils.EMPTY_DATA
    }      

    let iscrizioni = "";
    if (ISRP)
      iscrizioni = `${ISRP}`;
    if (ISRS)
      iscrizioni = `${iscrizioni} ${ISRS} `;
    if (ISRI)
      iscrizioni = `${iscrizioni} ${ISRI} `;

    return iscrizioni.trim();
  }

  static getStemmi(record: Record<string, unknown>, fieldToRead: string[]): string {
    // STMC e STMQ separati da spazio, poi STMI separato da virgola, poi STMP separato da virgola, poi STMD separato da punto e a capo
    const STMC = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const STMQ = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const STMI = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)
    const STMP = GetDataUtils.getSingleField(record, fieldToRead[3]!, GetDataUtils.EMPTY_DATA)
    const STMD = GetDataUtils.getSingleField(record, fieldToRead[4]!, GetDataUtils.EMPTY_DATA)

    const skType = GetDataUtils.getSingleField(record,GetDataUtils.FIELD_CARD_TYPE)
    const skOSS = GetDataUtils.getSingleField(record,GetDataUtils.FIELD_OSS_TYPE)

    const autore = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_ICCD_AUTORE)
    const crestad = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_AD_CREST)

    // se la scheda è di tipo OA e l'OSS è Contemporary, non mostra i stemmi
    if (skType === 'OA' && skOSS.includes('Contemporary')) {
      return GetDataUtils.EMPTY_DATA
    }
    else if (skType === 'D' && autore.includes('Appiani')) {
      if (crestad) 
        return crestad
      else
        return GetDataUtils.EMPTY_DATA
    }  
    else if (skType === 'S' && skOSS.includes('Contemporary') ) {
      return GetDataUtils.EMPTY_DATA
    }      

    // return `${STMC} ${STMQ}, ${STMI}, ${STMP}.<br />${STMD}.`.trim()

    const head = [STMP, STMC].filter(Boolean).join(', ')
    const mid = [STMQ, STMI].filter(Boolean).join(', ')
    let line = ''
    if (head && mid)
      line = `${head}, ${mid}.`
    else if (head)
      line = `${head}.`
    else if (mid)
      line = `${mid}.`
    if (STMD)
      line = line ? `${line}<br />${STMD}.` : `${STMD}.`
    return line || GetDataUtils.EMPTY_DATA
  }

  static getMisure_OA(record: Record<string, unknown>, fieldToRead: string[]): string {
    // [MISU MISA x MISL x MISN; Ø MISD - [MISV]]
    const MISU = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const MISA = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const MISL = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)
    const MISN = GetDataUtils.getSingleField(record, fieldToRead[3]!, GetDataUtils.EMPTY_DATA)
    const MISD = GetDataUtils.getSingleField(record, fieldToRead[4]!, GetDataUtils.EMPTY_DATA)
    const MISV = GetDataUtils.getSingleField(record, fieldToRead[5]!, GetDataUtils.EMPTY_DATA)

    let mm = ""

    if ( MISU ) mm = `${MISU} ${MISA}`;
    else mm = `cm ${MISA}`;

    if ( MISL ) mm = `${mm} x ${MISL}`;

    if (MISN)
      mm = `${mm} x ${MISN}`;
    if (MISD)
      mm = `${mm}; Ø ${MISD}`;
    if (MISV)
      mm = `${mm} - [${MISV}]`;

    return GetDataUtils.unCapitalizeFirstLetter(mm);
  }

    static getMisure_S(record: Record<string, unknown>, fieldToRead: string[]): string {
      // [MISU MISA x MISL; Ø MISD]
      const MISU = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
      const MISA = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
      const MISL = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)
      const MISD = GetDataUtils.getSingleField(record, fieldToRead[3]!, GetDataUtils.EMPTY_DATA)

      let mm = ""
    
      if ( MISU ) mm = `${MISU} ${MISA}`;
      else mm = `cm ${MISA}`;

      if ( MISL ) mm = `${mm} x ${MISL}`;

      if (MISD)
        mm = `${mm}; Ø ${MISD}`;

      return GetDataUtils.unCapitalizeFirstLetter(mm);
    }

  static getMisure_MIDF(record: Record<string, unknown>, fieldToRead: string[]): string {
 
    const MISU = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const MISM = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const MISZ = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)

    let mm = ""
    
    if ( MISU ) mm = `${MISU} ${MISM}`;
    else mm = `cm ${MISM}`;

    return GetDataUtils.unCapitalizeFirstLetter(mm);
  }  

  static getMisure_F(record: Record<string, unknown>, fieldToRead: string[]): string {
    // [MISU MISA x MISL; Ø MISD]
    const MISU = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const MISA = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)

    let mm = ""
    if ( MISU ) mm = `${MISU} ${MISA}`;
    else mm = `cm ${MISA}`;

    return GetDataUtils.unCapitalizeFirstLetter(mm);
  }  

  static getOggetto(record: Record<string, unknown>, fieldToRead: string[]): string {
    const OGTD = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const OGTT = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)

    //    return `${OGTD} (${OGTT})`
    return OGTD || OGTT
  }

  static getAcquisizione(record: Record<string, unknown>, fieldToRead: string[]): string {

    const ACQN = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const ACQT = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const ACQD = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)

    const skType = GetDataUtils.getSingleField(record,GetDataUtils.FIELD_CARD_TYPE)
    const skOSS = GetDataUtils.getSingleField(record,GetDataUtils.FIELD_OSS_TYPE)
    const autore = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_ICCD_AUTORE)

    // se la scheda è di tipo OA e l'OSS è Contemporary, non mostra l'acquisizione
    if (skType === 'OA' && skOSS.includes('Contemporary')) {
      let acquismall =  `${ACQT}`  
      return acquismall.trim();
    }    
    else if (skType === 'S' && skOSS.includes('Contemporary') ) {
      let acquismall =  `${ACQT}`  
      return acquismall.trim();
    }      
    else if (skType === 'D' && autore.includes('Appiani')) {
      let acquismall =  `${ACQT}`  
      return acquismall.trim();
    }    

    let acquisizione = "";  

    if (ACQN)
      acquisizione = `${ACQN}`;
    if (ACQT)
      acquisizione = `${acquisizione} ${ACQT} `;
    if (ACQD)
      acquisizione = `${acquisizione}  ${ACQD} `;

    return acquisizione.trim();
  }

  static getAcquisizioneMIDF(record: Record<string, unknown>, fieldToRead: string[]): string {
    const ACQT = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const ACQD = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)

    let acquisizione = "";  

    if (ACQT)
      acquisizione = `${ACQT}`;
    if (ACQD)
      acquisizione = `${acquisizione} ${ACQD} `;

    return acquisizione.trim();
  }

  static getMostre(record: Record<string, unknown>, fieldToRead: string[]): string {
    // [MSTT; [MSTL]; [MSTD]]
    const MSTT = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const MSTL = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const MSTD = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)

    // return `${MSTT}; ${MSTL};  ${MSTD}`
    const s = [MSTT, MSTL, MSTD].filter(Boolean).join('; ')
    return s || GetDataUtils.EMPTY_DATA
  }

  static getBibliografia(record: Record<string, unknown>, fieldToRead: string): string {
    const BIB = GetDataUtils.getSingleField(record, fieldToRead!, GetDataUtils.EMPTY_DATA)

    const skType = GetDataUtils.getSingleField(record,GetDataUtils.FIELD_CARD_TYPE)
    const skOSS = GetDataUtils.getSingleField(record,GetDataUtils.FIELD_OSS_TYPE)
    const autore = GetDataUtils.getSingleField(record, GetDataUtils.FIELD_ICCD_AUTORE)

    // se la scheda è di tipo OA e l'OSS è Contemporary, non mostra le iscrizioni
    if (skType === 'OA' && skOSS.includes('Contemporary')) {
      return GetDataUtils.EMPTY_DATA
    }    
    else if (skType === 'D' && autore.includes('Appiani')) {
      return GetDataUtils.EMPTY_DATA
    }     
    else if (skType === 'S' ) {
      return GetDataUtils.EMPTY_DATA
    }      

    if ( BIB ){
      let bib = BIB.replaceAll(';', ', ')
      return bib;
    }
          
    return GetDataUtils.EMPTY_DATA
  }

  static getRestauri(record: Record<string, unknown>, fieldToRead: string[]): string {
    // se è compilato il campo aggiuntivo RSN (solo OA) lo si usa altrimenti si usa il campo strutturato RST, che è ripetitivo, separando con un ritorno a capo    // se è compilato il campo aggiuntivo RSN (solo OA) lo si usa altrimenti si usa il campo strutturato RST, che è ripetitivo, separando con un ritorno a capo
    const ad_restoration_description = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const RSN = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const RST = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)

    if (ad_restoration_description && ad_restoration_description != GetDataUtils.NO_DATA) return ad_restoration_description;
    if (RSN && RSN != GetDataUtils.NO_DATA) return RSN;
    if (RST && RST != GetDataUtils.NO_DATA) return RST;

    return GetDataUtils.EMPTY_DATA
  }

  static getCorniceBasamentoSupporto(record: Record<string, unknown>, fieldToRead: string[]): string {

    const ad_a = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const ad_b = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const ad_c = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)

    let value = ""; 

    if (ad_a && ad_a != GetDataUtils.NO_DATA) value = `${value} ${ad_a}`;
    if (ad_b && ad_b != GetDataUtils.NO_DATA) value = `${value} ${ad_b}`;
    if (ad_c && ad_c != GetDataUtils.NO_DATA) value = `${value} ${ad_c}`; 

    return value.trim();
  }  

  static getSoggettoMIDF(record: Record<string, unknown>, fieldToRead: string[]): string {
    // se è compilato il campo aggiuntivo RSN (solo OA) lo si usa altrimenti si usa il campo strutturato RST, che è ripetitivo, separando con un ritorno a capo    // se è compilato il campo aggiuntivo RSN (solo OA) lo si usa altrimenti si usa il campo strutturato RST, che è ripetitivo, separando con un ritorno a capo
    const retA = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const retB = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)

    if (retA) return retA;
    if (retB) return retB;

    return ''
  }

  static getLuogoRipresa(record: Record<string, unknown>, fieldToRead: string[]): string {
    const lrcs = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const lrct = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const lrcc = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)
    const lrcp = GetDataUtils.getSingleField(record, fieldToRead[3]!, GetDataUtils.EMPTY_DATA)


    let luogoRipresa = "";
    if ( lrcs != "ITALIA")
    {
      if (lrcs) luogoRipresa = `${lrcs}`;
      if (lrct) luogoRipresa = `${luogoRipresa} ${lrct} `;
    }
    else
    {
      if (lrcc) luogoRipresa = `${luogoRipresa} ${lrcc} `;
      if (lrcp) luogoRipresa = `${luogoRipresa} ${lrcp} `;
      if (lrct) luogoRipresa = `${luogoRipresa} loc. ${lrct} `;
    }

    return luogoRipresa.trim();
  }

  static getLuogoConservazione(record: Record<string, unknown>, fieldToRead: string[]): string {
    const strA = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const strB = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)

    let luogoConservazione = "";
    if (strA) luogoConservazione = `${strA}`;
    else if (strB) luogoConservazione = `${strB}`;

    return luogoConservazione.trim();
  }


  static getDescrizioneSBN(record: Record<string, unknown>, fieldToRead: string[]): string {
    // se è compilato il campo aggiuntivo RSN (solo OA) lo si usa altrimenti si usa il campo strutturato RST, che è ripetitivo, separando con un ritorno a capo    // se è compilato il campo aggiuntivo RSN (solo OA) lo si usa altrimenti si usa il campo strutturato RST, che è ripetitivo, separando con un ritorno a capo
    const retA = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const retB = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const retC = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)
    const retD = GetDataUtils.getSingleField(record, fieldToRead[3]!, GetDataUtils.EMPTY_DATA)

    let descrizione = "";
    if (retA)
      descrizione = `${retA}`;
    if (retB)
      descrizione = `${descrizione} ${retB} `;
    if (retC)
      descrizione = `${descrizione}  ${retC} `;
    if (retD)
      descrizione = `${descrizione}  ${retD} `;

    //descrizione = descrizione.replaceAll(';', '')

    return descrizione.trim();
  }  

  static getSingleFieldTerminated(record: Record<string, unknown>, fieldToRead: string): string {
    const strA = GetDataUtils.getSingleField(record, fieldToRead!, GetDataUtils.EMPTY_DATA)

    return strA.trim().replace(/[.,;:!?]+$/g, "");

    return strA;
  }  

  /**
   * Estrae soggetto (o altro campo) da record_fields (array di { value }) con cleanData.
   * Restituisce NO_DATA se il campo manca o non è un array.
   */
  static getSingleField(record: Record<string, unknown>, fieldToRead: string, defaultValue?: string): string {
    if (!existsField(record, 'record_fields'))
      return GetDataUtils.getDefaultValue(defaultValue)
    const rf = record.record_fields as Record<string, unknown>
    if (!existsField(rf, fieldToRead) || !fieldIsArray(rf, fieldToRead))
      return GetDataUtils.getDefaultValue(defaultValue)
    const arr = rf[fieldToRead] as Array<{ value: string }>
    let retVal = arr.map(s => s.value).join(', ')
    return GetDataUtils.capitalizeFirstLetter(retVal)
  }

  /**
   * Estrae solo il primo valore di un campo in record_fields (array di { value }), con cleanData.
   * Restituisce NO_DATA se il campo manca, non è un array o è vuoto.
   */
  static getSoggetto(record: Record<string, unknown>, fieldToRead: string): string {
    if (!existsField(record, 'record_fields'))
      return GetDataUtils.NO_DATA
    const rf = record.record_fields as Record<string, unknown>
    if (!existsField(rf, fieldToRead) || !fieldIsArray(rf, fieldToRead) || (rf[fieldToRead] as unknown[]).length === 0)
      return GetDataUtils.NO_DATA
    const first = (rf[fieldToRead] as Array<{ value: string }>)[0]
    return first ? cleanData(first.value) : GetDataUtils.NO_DATA
  }

  /**
   * Estrae solo il primo valore (senza cleanData) di un campo in record_fields (es. tipologia oggetto).
   * Restituisce NO_DATA se il campo manca, non è un array o è vuoto.
   */
  static getCardType(record: Record<string, unknown>, fieldToRead: string): string {
    if (!existsField(record, 'record_fields'))
      return GetDataUtils.NO_DATA
    const rf = record.record_fields as Record<string, unknown>
    if (!existsField(rf, fieldToRead) || !fieldIsArray(rf, fieldToRead) || (rf[fieldToRead] as unknown[]).length === 0)
      return GetDataUtils.NO_DATA
    const first = (rf[fieldToRead] as Array<{ value: string }>)[0]
    return first ? first.value : GetDataUtils.NO_DATA
  }


  
    /*
  static getTitoloSBN(record: Record<string, unknown>, fieldToRead: string[]): string {
    let tit1 = GetDataUtils.getSingleField(record, fieldToRead[0]!, "")
    let tit2 = GetDataUtils.getSingleField(record, fieldToRead[1]!, "")
   
    let tit = "";
    if ( tit1 != GetDataUtils.NO_DATA) tit = tit1;
    if ( tit2 != GetDataUtils.NO_DATA) tit = tit + ' ' + tit2;

    return `${tit}`
  }*/   

     
  /**
   * Estrae "autore originale" da un campo in record_fields (array di { value }).
   * Come getAbout ma restituisce NO_DATA se manca e non applica cleanData.
   */

 

  /*
  static getTitolo(record: Record<string, unknown>, fieldToRead: string): string {
    if (!existsField(record, 'record_fields'))
      return GetDataUtils.NO_DATA
    const rf = record.record_fields as Record<string, unknown>
    if (!existsField(rf, fieldToRead) || !fieldIsArray(rf, fieldToRead))
      return GetDataUtils.NO_DATA

    const title = rf[fieldToRead] as Array<{ value: string }>

    if (title.length === 1)
      return title[0]?.value || ''

    return cleanData(title.map(t => t.value).join(', '))
  }
  */

  static getEditori(record: Record<string, unknown>, fieldToRead: string[]): string {
    // se è compilato il campo aggiuntivo RSN (solo OA) lo si usa altrimenti si usa il campo strutturato RST, che è ripetitivo, separando con un ritorno a capo    // se è compilato il campo aggiuntivo RSN (solo OA) lo si usa altrimenti si usa il campo strutturato RST, che è ripetitivo, separando con un ritorno a capo
    const retA = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const retB = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const retC = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)
    
    if (retA) return retA;
    if (retB) return retB;
    if (retC) return retC;

    return ''
  }

  static getTiratura(record: Record<string, unknown>, fieldToRead: string[]): string {
    // se è compilato il campo aggiuntivo RSN (solo OA) lo si usa altrimenti si usa il campo strutturato RST, che è ripetitivo, separando con un ritorno a capo    // se è compilato il campo aggiuntivo RSN (solo OA) lo si usa altrimenti si usa il campo strutturato RST, che è ripetitivo, separando con un ritorno a capo
    const retA = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const retB = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)

    if (retA) return retA;
    if (retB) return retB;

    return ''
  }  
  
  static getDBMetadata(record: Record<string, unknown>, fieldToRead: string): string {
    if (!existsField(record, fieldToRead) || !fieldIsArray(record, fieldToRead))
      return GetDataUtils.EMPTY_DATA
    const places = record[fieldToRead] as Array<{ labels: Record<string, string> }>
    return places.map(p => p.labels.en).join(', ')
  }

  static getAgents(record: Record<string, unknown>, fieldToRead: string): string {
    if (!existsField(record, fieldToRead) || !fieldIsArray(record, fieldToRead))
      return GetDataUtils.EMPTY_DATA
    const agents = record[fieldToRead] as Array<{ labels: Record<string, string> }>

    let autn = agents[0]?.labels.en || '';
    if (autn.includes(',')) {
      const autnParts = autn.split(',')
      autn = `${autnParts[1]} ${autnParts[0]}`
    }

    return `${autn}`
  }


  static getPaeIncipit(record: Record<string, unknown>, fieldToRead: string[]): PaeIncipit {
    const empty: PaeIncipit = { clef: '', data: '' }
    const data = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const clef = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const timesig = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)
    const keysig =
      fieldToRead.length > 3
        ? GetDataUtils.getSingleField(record, fieldToRead[3]!, GetDataUtils.EMPTY_DATA)
        : GetDataUtils.EMPTY_DATA

    if (!data)
      return empty

    const pae: PaeIncipit = { clef: clef || '', data }
    if (timesig)
      pae.timesig = timesig
    if (keysig)
      pae.keysig = keysig
    return pae
  }

  static getIdSigec(record: Record<string, unknown>, fieldToRead: string[]): string {
    const NCTN = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const NCTR = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)
    const NCTS = GetDataUtils.getSingleField(record, fieldToRead[2]!, GetDataUtils.EMPTY_DATA)
    const RVEL = GetDataUtils.getSingleField(record, fieldToRead[3]!, GetDataUtils.EMPTY_DATA)

    let ret = NCTR + NCTN + NCTS;
    if (RVEL) ret = ret + '-' + RVEL;

    return ret;
  }  

  static getIIFTechnique(record: Record<string, unknown>, fieldToRead: string[]): string {
    const mtc = GetDataUtils.getSingleField(record, fieldToRead[0]!, GetDataUtils.EMPTY_DATA)
    const medium = GetDataUtils.getSingleField(record, fieldToRead[1]!, GetDataUtils.EMPTY_DATA)

    if (mtc) return mtc;
    else if (medium) return medium;

    return '';
  }  

  static getStrumenti(record: Record<string, unknown>, fieldToRead: string): string {
    let strumento = GetDataUtils.getSingleField(record, fieldToRead!, GetDataUtils.FIELD_TITOLO_IT)

    strumento = strumento.toLowerCase();

    strumento = strumento.trim();

    switch (strumento) {
      case 'arp':
        return 'Arpa';
      case 'b':
        return 'Basso (strumento)';
      case 'chit':
        return 'Chitarra';
      case 'cl':
        return 'Clarinetto';
      case 'coro':
        return 'Coro';
      case 'fag':
        return 'Fagotto';
      case 'fl':
        return 'Flauto';
      case 'ob':
          return 'Oboe';
      case 'org':
          return 'Organo';       
      case 'pf':
          return 'Pianoforte';
      case 's':
          return 'Soprano (voce)';    
      case 'str':
          return 'Strumento';
      case 'tr':
          return 'Tromba';     
      case 'trb':
          return 'Trombone';
      case 'vl':
          return 'Violino';
      case 'vla':
          return 'Viola';
      case 'vlc':
          return 'Violoncello';                                                 
      default:
        return strumento;
    }
  }
 
}

