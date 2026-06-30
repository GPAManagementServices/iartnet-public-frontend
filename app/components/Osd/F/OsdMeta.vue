<template>
  <div class="osdMeta">
    <OsdMetaField :label="$t('OSD-Titolo')" :value="props.data.titolo" />
    <OsdMetaField :label="$t('OSD-Autore')" :value="props.data.autore" />
    <OsdMetaField :label="$t('OSD-Soggetto')" :value="props.data.soggetto" />
    <OsdMetaField :label="$t('OSD-Datazione')" :value="props.data.datazione" />

    <OsdMetaField :label="$t('OSD-LuogoRipresa')" :value="props.data.luogoRipresa" />
    <OsdMetaField :label="$t('OSD-DataRipresa')" :value="props.data.dataRipresa" />

    <OsdMetaField :label="$t('OSD-TipologiaOggetto')" :value="props.data.tipologiaOggetto" />

    <OsdMetaField
      :label="$t('OSD-FunzioneOriginaria')"
      :value="props.data.funzionaOriginaria"
      campo-aggiuntivo
      use-see-more
    />

    <OsdMetaField :label="$t('OSD-IndicazionidiColore')" :value="props.data.indicazionidiColore" />
    <OsdMetaField :label="$t('OSD-Tecnica_e_Supporto')" :value="props.data.tecnica_e_supporto" />

    <OsdMetaField :label="$t('OSD-Misure')" :value="props.data.misure" />

    <OsdMetaField :label="$t('OSD-Formato')" :value="props.data.formato" />

    <OsdMetaField :label="$t('OSD-Collocazione')" :value="props.data.collocazione" />

    <OsdMetaField :label="$t('OSD-Iscrizioni')" :value="props.data.iscrizioni" />
    <OsdMetaField :label="$t('OSD-Stemmi')" :value="props.data.stemmi" use-see-more />

    <OsdMetaField
      v-if="props.data.bibliografia_AD"
      :label="$t('OSD-Bibliografia_AD')"
      :value="props.data.bibliografia_AD"
      campo-aggiuntivo
      use-see-more
    />
    <OsdMetaField
      v-else
      :label="$t('OSD-Bibliografia')"
      :value="props.data.bibliografia"
      use-see-more
    />

  <OsdMetaField :label="$t('OSD-UniqueIdentifier')" :value="props.data.idSigec" />
  
  </div>
</template>

<script setup lang="ts">
import type { F_MetaDataTarget } from '~/utils/MetaData'
import OsdMetaField from '../OsdMetaField/OsdMetaField.vue'

interface OsdMetaProps {
  data: F_MetaDataTarget
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
