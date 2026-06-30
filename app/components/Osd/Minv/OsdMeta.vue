<template>
  <div class="osdMeta">

    <OsdMetaField
      v-if="props.data.titoloProprio"
      :label="$t('OSD-Titolo')"
      :value="props.data.titoloProprio"
    />
    <OsdMetaField
      v-else
      :label="$t('OSD-Titolo')"
      :value="props.data.titolo"
    /> 

    <OsdMetaField :label="$t('OSD-Soggetto')" :value="props.data.soggetto" />
    <OsdMetaField :label="$t('OSD-Autore')" :value="props.data.autore" />    
    <OsdMetaField :label="$t('OSD-AmbitoCulturale')" :value="props.data.ambitoCulturale" /> 
    <OsdMetaField :label="$t('OSD-Datazione')" :value="props.data.datazione" />      
    <OsdMetaField :label="$t('OSD-TipologiaOggetto')" :value="props.data.tipologiaOggetto" />
        
    <OsdMetaField
      :label="$t('OSD-FunzioneOriginaria')"
      :value="props.data.funzionaOriginaria"
      campo-aggiuntivo
      use-see-more
    />
    
    <OsdMetaField :label="$t('OSD-Iscrizioni')" :value="props.data.iscrizioni" />
    <OsdMetaField :label="$t('OSD-Tecnica_e_Supporto')" :value="props.data.tecnica_e_supporto" />
    <OsdMetaField :label="$t('OSD-Misure')" :value="props.data.misure" />

    <OsdMetaField :label="$t('OSD-IstitutoDiConservazione')" :value="props.data.istitutoDiConservazione" />
    
    <OsdMetaField
      :label="$t('OSD-AnalyticalTechnique')"
      :value="props.data.analyticalTechnique"
      campo-aggiuntivo
      use-see-more
    />    

    <OsdMetaField :label="$t('OSD-Acquisizione')" :value="props.data.acquisizione" />
    <OsdMetaField :label="$t('OSD-Mostre')" :value="props.data.mostre" />
    <OsdMetaField :label="$t('OSD-Bibliografia')" :value="props.data.bibliografia" />
    <OsdMetaField :label="$t('OSD-Restauri')" :value="props.data.restauri" />

    <OsdMetaField :label="$t('OSD-UniqueIdentifier')" :value="props.data.idSigec" />
    
  </div>
</template>

<script setup lang="ts">
import type { MINV_MetaDataTarget } from '~/utils/MetaData'
import OsdMetaField from '../OsdMetaField/OsdMetaField.vue'

interface OsdMetaProps {
  data: MINV_MetaDataTarget
  campiAggiuntivi: CampiAggiuntiviDataTarget
}

const props = defineProps<OsdMetaProps>()
</script>

<style lang="postcss" scoped>
.osdMeta {
  display: flex;
  flex-direction: column;
  width: calc(100% - 500px);
  margin-left: auto;
  margin-right: 50px;

  opacity: 1;
}

/* tablet and below: align to OsdAbout */
@media (max-width: 1024px) {
  .osdMeta {
    width: calc(100% - 100px);
    margin-left: 50px;
    margin-right: 50px;
  }
}
@media (max-width: 768px) {
  /* Stessi width / margini / padding di .osdAbout su mobile */
  .osdMeta {
    width: 100%;
    max-width: 100%;
    margin-left: 10px;
    margin-right: 0;
    padding: 0 1rem;
    box-sizing: border-box;
  }
}
</style>
