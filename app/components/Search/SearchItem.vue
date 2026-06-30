<template>
  <article ref="rootRef" class="search-item">
    <div class="search-item__detail">
      <!-- <ClientOnly> -->
      <NuxtLink class="search-item__link" :to="localePath({ name: 'digital-object-slug', params: { slug: item.stable_id } })">
        <div class="osdContainer">
          <img
            v-if="media?.mediaType === 'image'"
            :src="searchItemImageUrl"
            :alt="media?.mediaTitle"
            width="300"
            height="300"
          >
          <img
            v-else-if="media?.mediaType === 'video' && vimeoThumbnailUrl"
            :src="vimeoThumbnailUrl"
            :alt="vimeoThumbAlt"
            width="300"
            height="300"
            loading="lazy"
            decoding="async"
          >
          <div
            v-else-if="media?.mediaType === 'video'"
            class="noImage"
          />
          <div
            v-else-if="media?.mediaType === 'music'"
            class="noImageMusic"
          >
            <img
              :src="musicalNoteIcon"
              :alt="musicThumbAlt"
              width="300"
              height="300"
            >
          </div>
          <div
            v-else
            class="noImage"
          />
        </div>
      </NuxtLink>
      <!-- </ClientOnly> -->
      <NuxtLink class="search-item__link" :to="localePath({ name: 'digital-object-slug', params: { slug: item.stable_id } })">
        <h3 class="search-item__title">
          <span v-html="title" />
        </h3>
        <span v-if="titleAuthor" class="search-item__author">
          {{ titleAuthor }}
        </span>
        <span v-if="titleDatazione" class="search-item__datazione">
          <span v-if="titleAuthor && titleDatazione" class="search-item__datazione-sep" aria-hidden="true">&#8226;</span>
          {{ titleDatazione }}
        </span>
      </NuxtLink>

      <ToolTip
        v-if="showHiddenData && hasLoadedCardDetail"
        :snippet="snippetTooltip"
        :info="infoScore"
        :tipo-scheda="tipoScheda"
      >
        <img :src="showMetadataIcon" alt="Metadata" class="search-item__metadataIcon">
      </ToolTip>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { SearchResultItem } from '#shared/types/api'
import musicalNoteIcon from '@/assets/icons/osd-musical-note.svg'
import showMetadataIcon from '@/assets/icons/osd-show-metadata.svg'
/* import OsdViewer from '~/components/Osd/OsdViewer/OsdViewer.vue' */
import ToolTip from '~/components/Search/ToolTip.vue'
import {
  getJsonRecordVimeoSource,
  getJsonRecordYoutubeEmbedUrl,
  vimeoOEmbedRequestUrl,
  youtubeThumbnailUrlFromEmbedUrl,
} from '~/utils/vimeoUtils'

const props = defineProps<{
  item: SearchResultItem
}>()

const localePath = useLocalePath()
const { locale } = useI18n()
const config = useRuntimeConfig()
const showHiddenData = config.public.showHiddenData// === 'true'
const rootRef = ref<HTMLElement | null>(null)
const media = ref<tSearchItemMedia | null>(null)
const vimeoThumbnailUrl = ref('')
/** Evita che una risposta oEmbed tardiva sovrascriva un item già aggiornato. */
const vimeoThumbFetchId = ref(0)
const title = ref('')
const titleAuthor = ref('')
const titleDatazione = ref('')
const snippetTooltip = ref('')
const infoScore = ref('')
const tipoScheda = ref('')
const hasLoadedCardDetail = ref(false)

const vimeoThumbAlt = computed(() => {
  const t = title.value?.trim()
  return t || 'Video'
})

const musicThumbAlt = computed(() => {
  const t = title.value?.trim()
  return t || 'Music'
})

const searchItemImageUrl = computed(() => {
  const url = media.value?.mediaUrl?.trim()
  if (!url || media.value?.mediaType !== 'image')
    return ''
  return iiifImageUrl(url, IiifImageSize.SearchThumb)
})

const FIELD_MUSIC_ID = '929c' as const

interface tSearchItemMedia {
  mediaType: '' | 'music' | 'image' | 'video'
  mediaUrl: string
  mediaTitle: string
}

const { data: cardDetail, execute: fetchCardDetail } = useFetch(`/api/cardDetail/${props.item.stable_id}`, {
  query: {
    locale: locale.value,
  },
  immediate: false,
  server: false,
})

let cardObserver: IntersectionObserver | null = null

function loadCardDetail() {
  if (hasLoadedCardDetail.value)
    return

  hasLoadedCardDetail.value = true
  fetchCardDetail()
}

onMounted(() => {
  if (!import.meta.client || !rootRef.value)
    return

  cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadCardDetail()
        cardObserver?.disconnect()
        cardObserver = null
      }
    })
  }, { rootMargin: '200px 0px' })

  cardObserver.observe(rootRef.value)
})

onUnmounted(() => {
  cardObserver?.disconnect()
  cardObserver = null
})

/*
const config = useRuntimeConfig()

export const api = $fetch.create({
  baseURL: `${config.public.baseUrl}/api`,
  // headers: {
  //   Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
  // }
})

*/

watch(cardDetail, async () => {
  //  console.log('cardDetail', cardDetail.value)
  //  console.log('cardDetail.value.record_json', JSON.parse(cardDetail.value!.record_json))
  if (cardDetail.value) {
    const fetchId = ++vimeoThumbFetchId.value
    const record_json = JSON.parse(cardDetail.value.record_json)

    tipoScheda.value = `Tipo scheda: ${GetDataUtils.getCardType(record_json, 'card_type')}`

    let tscheda = `${GetDataUtils.getCardType(record_json, 'card_type')}`

    // resetto media
    media.value = {
      mediaType: '',
      mediaUrl: '',
      mediaTitle: '',
    }
    vimeoThumbnailUrl.value = ''

    title.value = GetDataUtils.getTitoloShort(record_json, GetDataUtils.FIELD_TITOLO_IT)

    if ( tscheda == "D")
    {
      title.value = GetDataUtils.getTitoloGeneric(record_json, GetDataUtils.FIELD_GEN_TITOLO)
    }

    if ( tscheda == "SBN")
    {
      title.value = GetDataUtils.getTitoloSBN(record_json, GetDataUtils.FIELD_SBN_TITOLO)
    }
    else if ( tscheda == "SALON")
    {
      title.value = GetDataUtils.getSingleField(record_json, GetDataUtils.FIELD_SALON_TITOLO)
    }    

    titleAuthor.value = ''
    titleDatazione.value = ''

    if (record_json.media) {
      // assegno a media il tipo e l'url dell'immagine

      if ( tscheda == "MIDF" || tscheda == "MINV" )
      {
        titleAuthor.value = GetDataUtils.getAutoreMIDF(record_json, GetDataUtils.FIELD_MIDF_AUTORE)
        titleDatazione.value = GetDataUtils.getDatazione(record_json, GetDataUtils.FIELD_GENERIC_DATAZIONE)      
      }
      else if ( tscheda == "SBN")
      {
        titleAuthor.value = GetDataUtils.getAutoreSBN(record_json, GetDataUtils.FIELD_SBN_AUTORE)        
        titleDatazione.value = GetDataUtils.getDatazioneSBN(record_json, GetDataUtils.FIELD_SBN_DATAZIONE)
      }
      else if ( tscheda == "JSON")
      {
        titleAuthor.value = GetDataUtils.getAgents(record_json, GetDataUtils.FIELD_AGENTS)
        titleDatazione.value = GetDataUtils.getDatazioneJson(record_json, GetDataUtils.FIELD_JSON_DATAZIONE)
      }          
      else if ( tscheda == "SALON")
      {
        titleDatazione.value = GetDataUtils.getSingleField(record_json, GetDataUtils.FIELD_SALON_YEAR)
      }       
      else
      {
        titleAuthor.value = GetDataUtils.getAutore(record_json, GetDataUtils.FIELD_GENERIC_AUTORE)
        titleDatazione.value = GetDataUtils.getDatazione(record_json, GetDataUtils.FIELD_GENERIC_DATAZIONE)         
      }

     if (titleAuthor.value === GetDataUtils.NO_DATA)
       titleAuthor.value = ''      

     if (titleDatazione.value === GetDataUtils.NO_DATA)
       titleDatazione.value = ''      
      
      const publisherdImage = record_json.media.find(m => m.publish_state === 'published')

      media.value = {
        mediaType: 'image',
        mediaUrl: publisherdImage?.url || '',
        mediaTitle: publisherdImage?.iiif_image_api || '',
      }
    }
    else if (record_json.record_fields?.digital_resources) {

      if ( tscheda == "JSON")
      {
        titleAuthor.value = GetDataUtils.getAgents(record_json, GetDataUtils.FIELD_AGENTS)
        titleDatazione.value = GetDataUtils.getDatazioneJson(record_json, GetDataUtils.FIELD_JSON_DATAZIONE)
      }  
        
     if (titleAuthor.value === GetDataUtils.NO_DATA)
       titleAuthor.value = ''      

     if (titleDatazione.value === GetDataUtils.NO_DATA)
       titleDatazione.value = ''      

      // assegno a media il tipo e l'url del video
      media.value = {
        mediaType: 'video',
        mediaUrl: GetDataUtils.getSingleField(record_json, GetDataUtils.FIELD_JSON_DIGITAL_RESOURCES),
        mediaTitle: '',
      }
      const record = record_json as Record<string, unknown>
      const embed = getJsonRecordVimeoSource(record)
      if (embed) {
        const pageUrl = vimeoOEmbedRequestUrl(embed)
        if (pageUrl) {
          try {
            const o = await $fetch<{ thumbnail_url: string }>('/api/vimeo/oembed', {
              query: { url: pageUrl },
            })
            if (fetchId !== vimeoThumbFetchId.value)
              return
            if (o.thumbnail_url)
              vimeoThumbnailUrl.value = o.thumbnail_url
          }
          catch {
            if (fetchId === vimeoThumbFetchId.value)
              vimeoThumbnailUrl.value = ''
          }
        }
      }
      else {
        const youtubeThumb = youtubeThumbnailUrlFromEmbedUrl(getJsonRecordYoutubeEmbedUrl(record))
        if (fetchId === vimeoThumbFetchId.value && youtubeThumb)
          vimeoThumbnailUrl.value = youtubeThumb
      }
    }
    else if (record_json.record_fields[FIELD_MUSIC_ID] && record_json.record_fields[FIELD_MUSIC_ID] !== '') {

      titleAuthor.value = GetDataUtils.getAutoreSBN(record_json, GetDataUtils.FIELD_SBN_AUTORE)

      let tit = GetDataUtils.getSingleField(record_json, GetDataUtils.FIELD_TITOLO_IT)
      if (tit.endsWith('.')) tit = tit.slice(0, -1)
      title.value = tit       

      titleDatazione.value = GetDataUtils.getDatazioneSBN(record_json, GetDataUtils.FIELD_SBN_DATAZIONE)
      
     if (titleAuthor.value === GetDataUtils.NO_DATA)
       titleAuthor.value = ''       

      media.value = {
        mediaType: 'music',
        mediaUrl: '',
        mediaTitle: '',
      }
    }

    snippetTooltip.value = props.item.snippet
    infoScore.value = `score_fts:${props.item.score_fts}<br />score_fuzzy:${props.item.score_fuzzy}<br />score_total:${props.item.score_total}`

    //tipoScheda.value = `Tipo scheda: ${GetDataUtils.getCardType(record_json, 'card_type')}`
  }
})
</script>

<style lang="postcss" scoped>
.search-item {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  border-bottom: 1px solid var(--color-border, #eee);
  width: 310px;
  gap: 12px;
}

.search-item:last-child {
  border-bottom: none;
}

.search-item__title {
  font-weight: 300;
  font-style: Light;
  font-size: var(--SearchItem-title);
  line-height: 120%;
  letter-spacing: 0%;
  vertical-align: bottom;
}

.search-item__detail {
  display: flex;
  flex-direction: column;
}

.search-item__link {
  display: block;
  color: inherit;
  text-decoration: none;
  margin-top: 4px;
}

.search-item__link:hover {
  text-decoration: underline;
}

.search-item__author {
  font-weight: 300;
  font-style: Light;
  font-size: var(--SearchItem-author);
  line-height: 100%;
  letter-spacing: 0%;
}
.search-item__datazione {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  font-weight: 300;
  font-style: Light;
  font-size: var(--SearchItem-author);
  line-height: 100%;
  letter-spacing: 0%;
}

.search-item__datazione-sep {
  flex-shrink: 0;
  user-select: none;
}
.search-item__metadataIcon {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  padding: 4px;
  background-color: lightgray;
}

.osdContainer {
  display: flex;
  align-items: flex-end;
  width: 100%;
  height: 440px;
  overflow: hidden;
}

.osdContainer img {
  /* display: block; */
  /* width: 100%; */
  /* height: 100%; */
  /* object-fit: cover; */
  border-radius: var(--ui-radius-large);
}

.noImage {
  display: block;
  width: 100%;
  height: 100%;
}

.noImageMusic {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  min-height: 0;
}
</style>

<style>
.smallOsdContainer {
  .osdContainer {
  }
}
</style>
