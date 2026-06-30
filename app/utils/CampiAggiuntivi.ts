import { GetDataUtils } from './GetDataUtils'

interface TipoCampoAggiuntivo { label: string, value: string }

export interface CampiAggiuntiviDataTarget {
  campoAggiuntivo: Array<TipoCampoAggiuntivo>
}

export class GEN_CampiAggiuntiviData {
  populate: (record: Record<string, unknown>) => void

  private readonly identificazioneCampoAggiuntivo = 'ad_'

  private readonly ExclusionFields = ['AD_TAGS', 'AD_ORIGINAL_FUNCTION']

  constructor(target: CampiAggiuntiviDataTarget) {
    this.populate = (record: Record<string, unknown>) => {
      target.campoAggiuntivo = []
      // cerco tutti i campi che iniziano con "AD_", la label diventa il nome del campo senza AD_ e il value il contenuto del campo
      const campiAggiuntivi = Object.keys(record.record_fields as Record<string, unknown>).filter(key => key.startsWith(this.identificazioneCampoAggiuntivo))
      campiAggiuntivi.forEach((campo: string) => {
        if (this.ExclusionFields.includes(campo.toUpperCase())) {
          console.log('Campo escluso:', campo)
        }
        else {
          const label = campo.replace(this.identificazioneCampoAggiuntivo, '').replaceAll('_', ' ').trim()
          const value = GetDataUtils.getSingleField(record, campo)
          target.campoAggiuntivo.push({ label, value })
        }
      })
    }
  }
}
