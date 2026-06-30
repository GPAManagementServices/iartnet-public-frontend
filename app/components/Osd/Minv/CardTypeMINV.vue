<template>
  <div>
    <HeaderMain style="padding-top:92px;border-bottom: none !important">
      <template #breadcrumb-items>
        <OsdSearchBackNav style="padding-left:0px" />
      </template>
      <OsdTitle :data="titleData" />
    </HeaderMain>
    <main>
      <OsdMetadatiHeader :data="headerData" />

      <div class="viewer-row">
        <ClientOnly>
          <OsdViewer
            v-if="tileSource.length"
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

      <OsdAbout :data="aboutTheWorkData" />
      <OsdMeta :data="metaData" :campi-aggiuntivi="campiAggiuntiviData" />

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
import type { MINV_AboutTheWorkDataTarget } from '~/utils/AboutTheWorkData'
import type { CampiAggiuntiviDataTarget } from '~/utils/CampiAggiuntivi'
import type { MINV_HeaderDataTarget } from '~/utils/HeaderData'
import type { MINV_ManifestDataTarget } from '~/utils/ManifestData'
import type { MINV_MetaDataTarget } from '~/utils/MetaData'
import type { MINV_TitleDataTarget } from '~/utils/TitleData'
import { IiifImageSize, iiifImageUrl } from '#shared/utils/iiif'
import { pickOsdRepresentativeImageUrl } from '#shared/utils/osdRepresentativeImage'
import { getPublishedRecordMedia } from '#shared/utils/recordMedia'
import VueJsonPretty from 'vue-json-pretty'
import showRawDataIcon from '@/assets/icons/osd-show-metadata.svg'
import { MINV_AboutTheWorkData } from '~/utils/AboutTheWorkData'
import { GEN_CampiAggiuntiviData } from '~/utils/CampiAggiuntivi'
import { MINV_HeaderData } from '~/utils/HeaderData'
import { MINV_ManifestData } from '~/utils/ManifestData'
import { MINV_MetaData } from '~/utils/MetaData'
import { MINV_TitleData } from '~/utils/TitleData'
import OsdViewer from '../OsdViewer/OsdViewer.vue'
import OsdAbout from './OsdAbout.vue'
import OsdMeta from './OsdMeta.vue'
import OsdMetadatiHeader from './OsdMetadatiHeader.vue'
import OsdTitle from './OsdTitle.vue'
import 'vue-json-pretty/lib/styles.css'

export interface CardDetailPayload {
  record_id: string
  record_json: string
}

const props = defineProps<{
  cardDetail: CardDetailPayload
  slug: string
}>()

const tileSource = ref<string[]>([])
const galleryThumbUrls = ref<string[]>([])
const rawData = ref('')
const showRawData = ref(false)
const config = useRuntimeConfig()
const showHiddenData = computed(() => String(config.public.showHiddenData) === 'true')
const recordID = ref('')

const titleData: MINV_TitleDataTarget = reactive({ autore: '', titolo: '', titoloProprio: '' })
const headerData: MINV_HeaderDataTarget = reactive({ tipologiaOggetto: '', soggetto: '', datazione: '', istitutoDiConservazione: '' })
const metaData: MINV_MetaDataTarget = reactive({ titolo: '', autoreOriginale: '', soggetto: '', autore: '', ambitoCulturale: '', datazione: '', luogoRipresa: '', dataRipresa: '', indicazionidiColore: '', iscrizioni: '', tipologiaOggetto: '', funzionaOriginaria: '', tecnica_e_supporto: '', misure: '', analyticalTechnique: '', acquisizione: '', istitutoDiConservazione: '', mostre: '', bibliografia: '', restauri: '' })
const aboutTheWorkData: MINV_AboutTheWorkDataTarget = reactive({ about: '' })
const manifestData: MINV_ManifestDataTarget = reactive({ autore: '', anno: '', tecnica: '', luogo: '' })
const campiAggiuntiviData: CampiAggiuntiviDataTarget = reactive({ campoAggiuntivo: [{ label: '', value: '' }] })

const titleDataExtractor = new MINV_TitleData(titleData)
const headerDataExtractor = new MINV_HeaderData(headerData)
const aboutTheWorkExtractor = new MINV_AboutTheWorkData(aboutTheWorkData)
const metaDataExtractor = new MINV_MetaData(metaData)
const manifestExtractor = new MINV_ManifestData(manifestData)
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
