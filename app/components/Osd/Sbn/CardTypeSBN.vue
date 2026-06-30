<template>
  <div>
    <HeaderMain style="padding-top:92px;border-bottom: none !important">
      <template #breadcrumb-items>
        <OsdSearchBackNav style="padding-left:0px" />
      </template>
      <OsdTitle :data="titleData" :card-subtype="cardSubtype" />
    </HeaderMain>
    <main>
      <OsdMetadatiHeader :data="headerData" :card-subtype="cardSubtype" />

      <div class="viewer-row" v-if="cardSubtype === 1">
        <ClientOnly>
          <OsdViewer            
            :slug="props.slug"
            :record-id="recordID"
            :tile-sources="tileSource"
            :gallery-thumb-urls="galleryThumbUrls"
            :manifest-data="manifestData"
            :show-navigator="true"
            :current-page="0"
            :options="{
              debugMode: false,
              showRotationControl: false,
              showZoomControl: true,
              showHomeControl: true,
              showFullPageControl: true,
              showFlipControl: false,
              autoHideControls: true,
              defaultZoomLevel: 0,
              sequenceMode: true,
              preload: true,
              showSequenceControl: false,
              stopZoomWheelPropagation: true,
              constrainDuringPan: true,
              visibilityRatio: 1,
            }"
          />
         </ClientOnly>
      </div>

      <div v-else-if="cardSubtype === 0">
        <ClientOnly>
          <VerovioPae :pae=metaData.PentIncipit :verovio-options="{
            scale: 45,
            header: 'none',
            footer: 'none',
            pageWidth: 5000,
            pageHeight: 220,
            adjustPageWidth: true,
          }" />
        </ClientOnly>
      </div>
      <div v-else />
    
      <OsdAbout :data="aboutTheWorkData" />
      <OsdMeta :data="metaData" :campi-aggiuntivi="campiAggiuntiviData" :card-subtype="cardSubtype" />

      <div v-if="showHiddenData" id="rawData">
        <button type="button" @click="showRawData = !showRawData">
          <img :src="showRawDataIcon" :alt="$t('OSD-RawDataToggleAlt')">
        </button>
        <div v-if="showRawData" style="height: 600px; width: 100%; overflow: auto; border:1px solid red">
          <VueJsonPretty
            :data="JSON.parse(rawData)"
            show-icon
            show-line-number
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { SBN_AboutTheWorkDataTarget } from '~/utils/AboutTheWorkData'
import type { CampiAggiuntiviDataTarget } from '~/utils/CampiAggiuntivi'
import type { SBN_HeaderDataTarget } from '~/utils/HeaderData'
import type { SBN_ManifestDataTarget } from '~/utils/ManifestData'
import { hasPaeIncipitData, type PaeIncipit } from '~/utils/PaeIncipit'
import type { SBN_MetaDataTarget } from '~/utils/MetaData'
import type { SBN_TitleDataTarget } from '~/utils/TitleData'
import { IiifImageSize, iiifImageUrl } from '#shared/utils/iiif'
import { pickOsdRepresentativeImageUrl } from '#shared/utils/osdRepresentativeImage'
import { getPublishedRecordMedia } from '#shared/utils/recordMedia'
import VueJsonPretty from 'vue-json-pretty'
import showRawDataIcon from '@/assets/icons/osd-show-metadata.svg'
import { SBN_AboutTheWorkData } from '~/utils/AboutTheWorkData'
import { GEN_CampiAggiuntiviData } from '~/utils/CampiAggiuntivi'
import { SBN_HeaderData } from '~/utils/HeaderData'
import { SBN_ManifestData } from '~/utils/ManifestData'
import { SBN_MetaData } from '~/utils/MetaData'
import { SBN_TitleData } from '~/utils/TitleData'
import OsdViewer from '../OsdViewer/OsdViewer.vue'
import OsdAbout from './OsdAbout.vue'
import OsdMeta from './OsdMeta.vue'
import OsdMetadatiHeader from './OsdMetadatiHeader.vue'
import OsdTitle from './OsdTitle.vue'
import 'vue-json-pretty/lib/styles.css'

export type SbnCardSubtype = 0 | 1 | 2

export interface CardDetailPayload {
  record_id: string
  record_json: string
}

const props = defineProps<{
  cardDetail: CardDetailPayload
  slug: string
}>()


const tileSource = ref<string[]>([])
/** 1 = scheda con tile IIIF, 0 = incipit PAE, 2 = senza immagini né incipit */
const cardSubtype = computed<SbnCardSubtype>(() => {
  if (tileSource.value.length > 0)
    return 1
  if (hasPaeIncipitData(metaData.PentIncipit))
    return 0
  return 2
})
const galleryThumbUrls = ref<string[]>([])
const rawData = ref('')
const showRawData = ref(false)
const config = useRuntimeConfig()
const showHiddenData = computed(() => String(config.public.showHiddenData) === 'true')
const recordID = ref('')

const titleData: SBN_TitleDataTarget = reactive({ autore: '', titolo: '', titoloM: '' })
const headerData: SBN_HeaderDataTarget = reactive({ autoreOriginale: '', soggetto: '', datazione: '', altriAutori: '', tipologiaOggetto: '', istitutoDiConservazione: '', scaffale: '' })
const metaData: SBN_MetaDataTarget = reactive({
  altriAutori: '',
  titolo: '',
  autore: '',
  datazione: '',
  edizione: '',
  editore: '',
  luogoedizione: '',
  paeselingua: '',
  descrizione: '',
  titoloopera: '',
  supporto: '',
  relazioni: '',
  inventario: '',
  legatura: '',
  note: '',
  statoconservazione: '',
  intemNote: '',
  permalink: '',
  PentIncipit: { clef: '', data: '' } satisfies PaeIncipit,
})
const aboutTheWorkData: SBN_AboutTheWorkDataTarget = reactive({ about: '' })
const manifestData: SBN_ManifestDataTarget = reactive({ autore: '', anno: '', tecnica: '', luogo: '' })
const campiAggiuntiviData: CampiAggiuntiviDataTarget = reactive({ campoAggiuntivo: [{ label: '', value: '' }] })

const titleDataExtractor = new SBN_TitleData(titleData)
const headerDataExtractor = new SBN_HeaderData(headerData)
const aboutTheWorkExtractor = new SBN_AboutTheWorkData(aboutTheWorkData)
const metaDataExtractor = new SBN_MetaData(metaData)
const manifestExtractor = new SBN_ManifestData(manifestData)
const campiAggiuntiviExtractor = new GEN_CampiAggiuntiviData(campiAggiuntiviData)

const osdSeoDescriptionParts = computed(() => [
  titleData.titolo,
  titleData.autore,
  headerData.soggetto,
  headerData.istitutoDiConservazione,
])

const seoImageUrl = ref<string | undefined>()

useOsdCardSeo({
  slug: () => props.slug,
  title: () => titleData.titolo,
  descriptionParts: osdSeoDescriptionParts,
  imageUrl: () => seoImageUrl.value,
})

function applyCardDetail(detail: CardDetailPayload) {
  seoImageUrl.value = undefined
  const record_json = JSON.parse(detail.record_json) as Record<string, unknown>
  const media = getPublishedRecordMedia(record_json)
  recordID.value = detail.record_id

  tileSource.value = media.map(m => m.iiif_image_api).filter((u): u is string => Boolean(u))

  galleryThumbUrls.value = media
    .filter(m => m.url)
    .map(m => iiifImageUrl(m.url!, IiifImageSize.Gallery))

  titleDataExtractor.populate(record_json)
  headerDataExtractor.populate(record_json)
  aboutTheWorkExtractor.populate(record_json)
  metaDataExtractor.populate(record_json)
  manifestExtractor.populate(record_json)
  campiAggiuntiviExtractor.populate(record_json)
  rawData.value = JSON.stringify(record_json, null, 2)
  seoImageUrl.value = pickOsdRepresentativeImageUrl(record_json)
}

watch(() => props.cardDetail, (detail) => {
  if (detail?.record_json) {
    applyCardDetail(detail)
  }
}, { immediate: true, deep: true })
</script>

<style lang="postcss" scoped>
.ui-breadcrumb {
  padding: var(--app-padding);
}

main {
  display: flex;
  flex-direction: column;
  gap: var(--app-padding);

  .viewer-row {
    margin-top: 75px;
    width: 100%;
  }

  .viewer-row :deep(.osdViewer) {
    height: calc(80vh);
  }

  small {
    font-size: var(--ui-text-small);
  }
}
</style>
