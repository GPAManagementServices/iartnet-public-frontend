<template>
  <div class="osdMeta">
    <OsdMetaField :label="$t('OSD-Titolo')" :value="props.data.titolo" />
    <OsdMetaField :label="$t('OSD-Datazione')" :value="props.data.datazione" />
    <OsdMetaField :label="$t('OSD-Sujects')" :value="props.data.soggetto" />
    <OsdMetaField :label="$t('OSD-Contesto')" :value="props.data.contesto" />
    <OsdMetaField :label="$t('OSD-Collocazione')" :value="props.data.luogo" />
    <OsdMetaField :label="$t('OSD-Opera')" :value="props.data.opera" />
    <OsdMetaField :label="$t('OSD-Compositore')" :value="props.data.compositore" />
    <OsdMetaField :label="$t('OSD-Orchestra')" :value="props.data.orchestra" />
    <OsdMetaField :label="$t('OSD-DirectOrchestra')" :value="props.data.directorchestra" />
    <OsdMetaField :label="$t('OSD-Regista')" :value="props.data.regista" />
    <OsdMetaField :label="$t('OSD-Dipartimento')" :value="props.data.dipartimento" />
    <OsdMetaField :label="$t('OSD-DataRegistrazione')" :value="props.data.dataregistrazione" />
    <OsdMetaField :label="$t('OSD-Accademic year')" :value="props.data.accademicyear" />
    <OsdMetaField :label="$t('OSD-Corso')" :value="props.data.corso" />
    <OsdMetaField :label="$t('OSD-Docente')" :value="props.data.docente" />
    <OsdMetaField :label="$t('OSD-Collezione')" :value="props.data.collezione" />
    <OsdMetaField :label="$t('OSD-Copyrights')" :value="props.data.copyrights" />

    <OsdMetaField :label="$t('OSD-GeneralOrganization')" :value="props.data.generalOrganization" />
    <OsdMetaField :label="$t('OSD-ResearchAndScenario')" :value="props.data.researchAndScenario" />
    <OsdMetaField :label="$t('OSD-DirectorOfPhotography')" :value="props.data.directorOfPhotography" />

    <template v-if="props.campiAggiuntivi && props.campiAggiuntivi.campoAggiuntivo.length > 0">
      <div v-for="campo in props.campiAggiuntivi.campoAggiuntivo" :key="campo.label">
        <OsdMetaField
          use-see-more
          :label="campo.label"
          :value="campo.value"
          campo-aggiuntivo
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { JSON_MetaDataTarget } from '~/utils/MetaData'
import OsdMetaField from '../OsdMetaField/OsdMetaField.vue'

interface OsdMetaProps {
  data: JSON_MetaDataTarget
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
