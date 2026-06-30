<template>
  <div class="osdMeta">
    <OsdMetaField :label="$t('OSD-Titolo')" :value="props.data.titolo" />
    <OsdMetaField :label="$t('OSD-LuogoEdizione')" :value="props.data.sedeEspositiva" />
  
  </div>
</template>

<script setup lang="ts">
import type { SALON_MetaDataTarget } from '~/utils/MetaData'
import OsdMetaField from '../OsdMetaField/OsdMetaField.vue'

interface OsdMetaProps {
  data: SALON_MetaDataTarget
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
