<template>
 
  <div
    v-if="props.cardSubtype !== 1"
    class="osdMetadatiHeader"
  >
    <OsdMetaField
      :label="$t('OSD-IstitutoDiConservazione')"
      :value="props.data.istitutoDiConservazione"
      use-stacked
      :do-not-show-if-empty="true"
    />    

	  <OsdMetaField
      :label="$t('OSD-Scaffale')"
      :value="props.data.scaffale"
      use-stacked
      campo-aggiuntivo
      :do-not-show-if-empty="true"
    />      

    <OsdMetaField
      :label="$t('OSD-InventarioNumero')"
      :value="props.data.inventario"
      use-stacked
      campo-aggiuntivo
      hide-if-empty
      :do-not-show-if-empty="false"
    />
	
    <OsdMetaField
      :label="$t('OSD-Permalink')"
      :value="props.data.permalink"
      use-stacked
      campo-aggiuntivo
      value-as-external-link
      :do-not-show-if-empty="true"
    />    
	
  </div>
  <div
    v-else
    class="osdMetadatiHeader"
  >
    <OsdMetaField      
      :label="$t('OSD-AltriAutori')"
      :value="props.data.altriAutori"
      use-stacked
      hide-if-empty
      :do-not-show-if-empty="false"
    />


    <OsdMetaField
      :label="$t('OSD-Soggetto')"
      :value="props.data.soggetto"
      use-stacked
      campo-aggiuntivo
      :do-not-show-if-empty="true"
    />   

    <OsdMetaField
      :label="$t('OSD-TipologiaOggetto')"
      :value="props.data.tipologiaOggetto"
      use-stacked
      campo-aggiuntivo
      :do-not-show-if-empty="true"
    />

    <OsdMetaField
      :label="$t('OSD-Scaffale')"
      :value="props.data.scaffale"
      use-stacked
      campo-aggiuntivo
      :do-not-show-if-empty="true"
    />  

    <OsdMetaField
      :label="$t('OSD-IstitutoDiConservazione')"
      :value="props.data.istitutoDiConservazione"
      use-stacked
      :do-not-show-if-empty="true"
    />    

  </div>  
 
</template>

<script setup lang="ts">
import type { SbnCardSubtype } from './CardTypeSBN.vue'
import type { SBN_HeaderDataTarget } from '~/utils/HeaderData'
import OsdMetaField from '../OsdMetaField/OsdMetaField.vue'

interface OsdMetadatiHeaderProps {
  data: SBN_HeaderDataTarget
  cardSubtype: SbnCardSubtype
}

const props = defineProps<OsdMetadatiHeaderProps>()
</script>

<style lang="postcss" scoped>
.osdMetadatiHeader {
  width: calc(100% - 500px);
  gap: 12px;
  margin-left: auto;
  margin-right: 50px;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 1024px) {
  .osdMetadatiHeader {
    width: 100%;
    margin-left: 50px;
    margin-right: 50px;
  }
}

@media (max-width: 768px) {
  .osdMetadatiHeader {
    grid-template-columns: 1fr;
    margin-left: 1rem;
    margin-right: 1rem;
  }
}
</style>
