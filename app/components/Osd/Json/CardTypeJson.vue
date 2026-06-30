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
          <JsonVimeoStage
            v-else-if="vimeoEmbed || youtubeEmbedUrl"
            :embed="vimeoEmbed"
            :youtube-embed-url="youtubeEmbedUrl"
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
import type { JSON_AboutTheWorkDataTarget } from '~/utils/AboutTheWorkData'
import type { CampiAggiuntiviDataTarget } from '~/utils/CampiAggiuntivi'
import type { JSON_HeaderDataTarget } from '~/utils/HeaderData'
import type { JSON_ManifestDataTarget } from '~/utils/ManifestData'
import type { JSON_MetaDataTarget } from '~/utils/MetaData'
import type { JSON_TitleDataTarget } from '~/utils/TitleData'
import type { VimeoEmbedSource } from '~/utils/vimeoUtils'
import { IiifImageSize, iiifImageUrl } from '#shared/utils/iiif'
import { pickOsdRepresentativeImageUrl } from '#shared/utils/osdRepresentativeImage'
import { getPublishedRecordMedia } from '#shared/utils/recordMedia'
import VueJsonPretty from 'vue-json-pretty'
import showRawDataIcon from '@/assets/icons/osd-show-metadata.svg'
import { JSON_AboutTheWorkData } from '~/utils/AboutTheWorkData'
import { GEN_CampiAggiuntiviData } from '~/utils/CampiAggiuntivi'
import { JSON_HeaderData } from '~/utils/HeaderData'
import { JSON_ManifestData } from '~/utils/ManifestData'
import { JSON_MetaData } from '~/utils/MetaData'
import { JSON_TitleData } from '~/utils/TitleData'
import { getJsonRecordVimeoSource, getJsonRecordYoutubeEmbedUrl } from '~/utils/vimeoUtils'
import OsdViewer from '../OsdViewer/OsdViewer.vue'
import JsonVimeoStage from './JsonVimeoStage.vue'
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
const vimeoEmbed = ref<VimeoEmbedSource | null>(null)
const youtubeEmbedUrl = ref<string | null>(null)
const rawData = ref('')
const showRawData = ref(false)
const config = useRuntimeConfig()
const showHiddenData = computed(() => String(config.public.showHiddenData) === 'true')
const recordID = ref('')

const titleData: JSON_TitleDataTarget = reactive({ autore: '', titolo: '' })
const headerData: JSON_HeaderDataTarget = reactive({ type: '', copyrights: '' })
const metaData: JSON_MetaDataTarget = reactive({ titolo: '', autore: '', soggetto: '', datazione: '', contesto: '', luogo: '', opera: '', compositore: '', orchestra: '', directorchestra: '', regista: '', dipartimento: '', dataregistrazione: '', corso: '', docente: '', collezione: '', accademicyear: '', copyrights: '' })
const aboutTheWorkData: JSON_AboutTheWorkDataTarget = reactive({ about: '' })
const manifestData: JSON_ManifestDataTarget = reactive({ autore: '', anno: '', tecnica: '', luogo: '' })
const campiAggiuntiviData: CampiAggiuntiviDataTarget = reactive({ campoAggiuntivo: [{ label: '', value: '' }] })

const titleDataExtractor = new JSON_TitleData(titleData)
const headerDataExtractor = new JSON_HeaderData(headerData)
const aboutTheWorkExtractor = new JSON_AboutTheWorkData(aboutTheWorkData)
const metaDataExtractor = new JSON_MetaData(metaData)
const manifestExtractor = new JSON_ManifestData(manifestData)
const campiAggiuntiviExtractor = new GEN_CampiAggiuntiviData(campiAggiuntiviData)

/** JSON header espone `type` e `copyrights` al posto di soggetto / istituto. */
const osdSeoDescriptionParts = computed(() => [
  titleData.titolo,
  titleData.autore,
  headerData.type,
  headerData.copyrights,
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

  if (tileSource.value.length) {
    vimeoEmbed.value = null
    youtubeEmbedUrl.value = null
  }
  else {
    vimeoEmbed.value = getJsonRecordVimeoSource(record_json)
    youtubeEmbedUrl.value = vimeoEmbed.value ? null : getJsonRecordYoutubeEmbedUrl(record_json)
  }

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

  /* IIIF: altezza fissa viewer. Video (Vimeo/YouTube): JsonVimeoStage non usa .osdViewer e si dimensiona da solo (16:9). */
  .viewer-row :deep(.osdViewer) {
    height: calc(80vh);
  }

  small {
    font-size: var(--ui-text-small);
  }
}
</style>
