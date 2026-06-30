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

      <div
        v-if="primaryImageUrl"
        class="interview-primary-image-row"
      >
        <figure class="interview-image-viewer">
          <img
            :src="primaryImageUrl"
            :alt="imageAlt"
            class="interview-image-viewer__img"
          >
          <figcaption
            v-if="primaryImageCaption"
            class="interview-image-viewer__caption"
          >
            {{ primaryImageCaption }}
          </figcaption>
        </figure>
      </div>

      <OsdAbout :data="aboutTheWorkData" />

      <OsdMeta
        :data-interview="domandeRisposteData"
        :inline-images="inlineImagesData.placements"
      />

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
import type { INTERVIEW_AboutTheWorkDataTarget } from '~/utils/AboutTheWorkData'
import type { INTERVIEW_HeaderDataTarget } from '~/utils/hederData'
import type { INTERVIEW_DidascalieTarget, INTERVIEW_DomandeRisposteTarget, INTERVIEW_InlineImagesTarget, INTERVIEW_MediaUrlsTarget } from '~/utils/InterviewArray'
import type { INTERVIEW_TitleDataTarget } from '~/utils/TitleData'
import { pickOsdRepresentativeImageUrl } from '#shared/utils/osdRepresentativeImage'
import VueJsonPretty from 'vue-json-pretty'
import showRawDataIcon from '@/assets/icons/osd-show-metadata.svg'
import { INTERVIEW_AboutTheWorkData } from '~/utils/AboutTheWorkData'
import { INTERVIEW_HeaderData } from '~/utils/HeaderData'
import { INTERVIEW_DidascalieData, INTERVIEW_DomandeRisposteData, INTERVIEW_InlineImagesData, INTERVIEW_MediaUrlsData } from '~/utils/InterviewArray'
import { INTERVIEW_TitleData } from '~/utils/TitleData'

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

const rawData = ref('')
const showRawData = ref(false)
const config = useRuntimeConfig()
const showHiddenData = computed(() => String(config.public.showHiddenData) === 'true')
const recordID = ref('')

const titleData: INTERVIEW_TitleDataTarget = reactive({ titolo: '', titolo1: '' })
const headerData: INTERVIEW_HeaderDataTarget = reactive({ date: '', type: '' })
const aboutTheWorkData: INTERVIEW_AboutTheWorkDataTarget = reactive({ about: '' })
const domandeRisposteData: INTERVIEW_DomandeRisposteTarget = reactive({ domande: [{ label: '', value: '' }], risposte: [{ label: '', value: '' }] })
const mediaUrlsData: INTERVIEW_MediaUrlsTarget = reactive({ urls: [] })
const didascalieData: INTERVIEW_DidascalieTarget = reactive({ didascalie: [] })
const inlineImagesData: INTERVIEW_InlineImagesTarget = reactive({ placements: [] })

const titleDataExtractor = new INTERVIEW_TitleData(titleData)
const headerDataExtractor = new INTERVIEW_HeaderData(headerData)
const aboutTheWorkExtractor = new INTERVIEW_AboutTheWorkData(aboutTheWorkData)
const domandeRisposteExtractor = new INTERVIEW_DomandeRisposteData(domandeRisposteData)
const mediaUrlsExtractor = new INTERVIEW_MediaUrlsData(mediaUrlsData)
const didascalieExtractor = new INTERVIEW_DidascalieData(didascalieData)

const primaryImageUrl = computed(() => mediaUrlsData.urls[0] ?? '')
const primaryImageCaption = computed(() => didascalieData.didascalie[0]?.trim() ?? '')
const imageAlt = computed(() => titleData.titolo || '')

const osdSeoDescriptionParts = computed(() => [
  titleData.titolo,
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
  recordID.value = detail.record_id

  titleDataExtractor.populate(record_json)
  headerDataExtractor.populate(record_json)
  aboutTheWorkExtractor.populate(record_json)
  domandeRisposteExtractor.populate(record_json)
  mediaUrlsExtractor.populate(record_json)
  didascalieExtractor.populate(record_json)
  inlineImagesData.placements = INTERVIEW_InlineImagesData.buildPlacements(
    record_json,
    mediaUrlsData.urls,
    didascalieData.didascalie,
  )
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
}

.interview-primary-image-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100% - 100px);
  margin-top: 75px;
  margin-left: 50px;
  margin-right: 50px;
  min-width: 0;
  box-sizing: border-box;
}

.interview-image-viewer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: fit-content;
  max-width: 100%;
  margin: 0;
}

.interview-image-viewer__img {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 800px;
  object-fit: contain;
}

.interview-image-viewer__caption {
  margin: 0.5rem 0 0;
  max-width: 100%;
  font-size: var(--ui-text-small, 0.875rem);
  line-height: 1.4;
  text-align: left;
  color: var(--gray-7, #7b7b7b);
}

@media (max-width: 768px) {
  .interview-primary-image-row {
    width: 100%;
    max-width: 100%;
    margin-left: 10px;
    margin-right: 0;
    padding: 0 1rem;
  }
}
</style>
