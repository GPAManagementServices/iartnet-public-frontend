<template>
  <div v-if="props.cardSubtype !== 1" class="osdMeta">

    <OsdMetaField :label="$t('OSD-Strumento')" :value="props.data.strumento" />
    <OsdMetaField :label="$t('OSD-Titolo')" :value="props.data.titoloM" />
    <OsdMetaField :label="$t('OSD-Autore')" :value="props.data.autore" />
    <OsdMetaField :label="$t('OSD-TitoloOpera')" :value="props.data.titoloopera" />
    
    <OsdMetaField :label="$t('OSD-Edizione')" :value="props.data.edizione" />
    <OsdMetaField :label="$t('OSD-Editore')" :value="props.data.editore" />    
    <OsdMetaField :label="$t('OSD-LuogoEdizione')" :value="props.data.luogoedizione" />
    <OsdMetaField :label="$t('OSD-Datazione')" :value="props.data.datazione" />
    <OsdMetaField :label="$t('OSD-PaeseLingua')" :value="props.data.paeselingua" />
    <OsdMetaField :label="$t('OSD-Description')" :value="props.data.descrizione" />
    
  </div>
  <div v-else class="osdMeta">

    <OsdMetaField :label="$t('OSD-Titolo')" :value="props.data.titoloM" />
    <OsdMetaField :label="$t('OSD-Autore')" :value="props.data.autore" />

    <OsdMetaField :label="$t('OSD-AltriAutori')" :value="props.data.altriAutori" />
    
    <OsdMetaField :label="$t('OSD-Edizione')" :value="props.data.edizione" />
    <OsdMetaField :label="$t('OSD-Editore')" :value="props.data.editore" />    
    <OsdMetaField :label="$t('OSD-LuogoEdizione')" :value="props.data.luogoedizione" />
    <OsdMetaField :label="$t('OSD-Datazione')" :value="props.data.datazione" />
    <OsdMetaField :label="$t('OSD-PaeseLingua')" :value="props.data.paeselingua" />
    <OsdMetaField :label="$t('OSD-Description')" :value="props.data.descrizione" />
    <OsdMetaField :label="$t('OSD-TitoloOpera')" :value="props.data.titoloopera" />

    <OsdMetaField
      :label="$t('OSD-Formato')"
      :value="props.data.supporto"
      campo-aggiuntivo
    />

    <OsdMetaField
      :label="$t('OSD-InventarioNumero')"
      :value="props.data.inventario"
      campo-aggiuntivo
    />    

    <OsdMetaField
      :label="$t('OSD-Legatura')"
      :value="props.data.legatura"
      campo-aggiuntivo
    />    

    <OsdMetaField
      :label="$t('OSD-Note')"
      :value="props.data.note"
      campo-aggiuntivo
    />        
    
    <OsdMetaField
      :label="$t('OSD-ItemNotes')"
      :value="props.data.intemNote"
      campo-aggiuntivo
    />       

  </div>

</template>

<script setup lang="ts">
import type { CampiAggiuntiviDataTarget } from '~/utils/CampiAggiuntivi'
import type { SBN_MetaDataTarget } from '~/utils/MetaData'
import type { SbnCardSubtype } from './CardTypeSBN.vue'
import OsdMetaField from '../OsdMetaField/OsdMetaField.vue'

interface OsdMetaProps {
  data: SBN_MetaDataTarget
  campiAggiuntivi: CampiAggiuntiviDataTarget
  cardSubtype: SbnCardSubtype
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
