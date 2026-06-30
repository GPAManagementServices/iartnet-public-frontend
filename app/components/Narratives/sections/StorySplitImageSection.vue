<template>
  <section
    v-if="showSection && layoutClass.toUpperCase().includes('LEFT')"
    class="story-section story-section--split-image"
    :class="[layoutClass, { 'story-split-image--has-media-bg': hasMediaBgColor, 'story-split-image--has-caption-below': useCaptionLayout, 'story-split-image--video': isVideo, 'story-section--debug-layout': showLayoutDebug }]"
  >
    <div class="story-split-image__inner">
      <div
        ref="mediaColumnEl"
        class="story-split-image__media-column"
        :style="mediaColumnStyle"
      >
        <figure class="story-split-image__media">
          <div class="story-split-image__media-stack">
          <div class="story-split-image__media-inner">
            <StoryLinkSchedaMedia
              :link-scheda="LinkScheda"
              :fill="isCoverLayout"
            >
              <img
                v-if="!isVideo && displayUrl"
                ref="mediaImageEl"
                class="story-split-image__image"
                :src="displayUrl"
                :alt="imageAlt"
                loading="lazy"
                decoding="async"
                @load="syncCaptionLayout"
              >
              <StorySectionVideoPlayer
                v-else-if="isVideo && hasPlayableVideo"
                ref="inlineVerticalVideoPlayerEl"
                class="story-split-image__video"
                :source-url="isNativeVideo ? sourceUrl : null"
                :vimeo-embed="vimeoEmbed"
                :youtube-embed-url="youtubeEmbedUrl"
                :title="imageAlt"
                :fill="isCoverLayout"
              />
              <figcaption
                v-if="captionHtml && isCoverLayout"
                class="story-split-image__caption story-split-image__caption--overlay story-caption story-caption--overlay"
                :class="overlayCaptionClass"
                v-html="captionHtml"
              />
            </StoryLinkSchedaMedia>
            <figcaption
              v-if="captionHtml && !isCoverLayout"
              ref="captionBelowEl"
              class="story-split-image__caption story-split-image__caption--below story-caption"
              v-html="captionHtml"
            />
          </div>
          </div>
        </figure>
      </div>

      <div
        v-if="hasContent"
        class="story-split-image__text-outer"
      >
        <div class="story-split-image__text-inner">
          <div
            v-if="textHtml"
            class="story-split-image__text story-prose"
            v-html="textHtml"
          />
        </div>
      </div>
    </div>
  </section>
  <section
    v-if="showSection && layoutClass.toUpperCase().includes('RIGHT')"
    class="story-section story-section--split-image"
    :class="[layoutClass, { 'story-split-image--has-media-bg': hasMediaBgColor, 'story-split-image--has-caption-below': useCaptionLayout, 'story-split-image--video': isVideo, 'story-section--debug-layout': showLayoutDebug }]"
  >
    <div class="story-split-image__inner">
      <div v-if="hasContent" class="story-split-image__text-outer">
        <div class="story-split-image__text-inner">
          <div
            v-if="textHtml"
            class="story-split-image__text story-prose"
            v-html="textHtml"
          />
        </div>
      </div>

      <div
        ref="mediaColumnEl"
        class="story-split-image__media-column"
        :style="mediaColumnStyle"
      >
        <figure class="story-split-image__media">
          <div class="story-split-image__media-stack">
          <div class="story-split-image__media-inner">
            <StoryLinkSchedaMedia
              :link-scheda="LinkScheda"
              :fill="isCoverLayout"
            >
              <img
                v-if="!isVideo && displayUrl"
                ref="mediaImageEl"
                class="story-split-image__image"
                :src="displayUrl"
                :alt="imageAlt"
                loading="lazy"
                decoding="async"
                @load="syncCaptionLayout"
              >
              <StorySectionVideoPlayer
                v-else-if="isVideo && hasPlayableVideo"
                ref="inlineVerticalVideoPlayerEl"
                class="story-split-image__video"
                :source-url="isNativeVideo ? sourceUrl : null"
                :vimeo-embed="vimeoEmbed"
                :youtube-embed-url="youtubeEmbedUrl"
                :title="imageAlt"
                :fill="isCoverLayout"
              />
            </StoryLinkSchedaMedia>
            <figcaption
              v-if="captionHtml && isCoverLayout"
              class="story-split-image__caption story-split-image__caption--overlay story-caption story-caption--overlay"
              :class="overlayCaptionClass"
              v-html="captionHtml"
            />
            <figcaption
              v-if="captionHtml && !isCoverLayout"
              ref="captionBelowEl"
              class="story-split-image__caption story-split-image__caption--below story-caption"
              v-html="captionHtml"
            />
          </div>
          </div>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TStorySplitImageType } from '#shared/types/api'
import { readStorySplitMediaType } from '#shared/utils/storySplitMedia'
import { normalizeStoryCssColor } from '#shared/utils/storySectionBackground'
import { storyHtmlContent } from '#shared/utils/storyText'
import { useMediaQuery } from '@vueuse/core'
import { computed, ref, useAttrs } from 'vue'
import StoryLinkSchedaMedia from '~/components/Narratives/StoryLinkSchedaMedia.vue'
import StorySectionVideoPlayer from '~/components/Narratives/StorySectionVideoPlayer.vue'
import {
  STORY_SPLIT_IMAGE_CAPTION_WIDTH_VAR,
  STORY_SPLIT_IMAGE_MEDIA_MAX_HEIGHT_VAR,
  useStoryMediaCaptionLayout,
} from '~/composables/useStoryMediaCaptionLayout'
import { useStorySectionImage } from '~/composables/useStorySectionImage'
import { useStorySectionLayoutDebug } from '~/composables/useStorySectionLayoutDebug'
import { useStorySectionVideo } from '~/composables/useStorySectionVideo'

const props = defineProps<
  TStorySplitImageType & {
    sectionKey: string
    mediaType?: TStorySplitImageType['MediaType']
  }
>()
const attrs = useAttrs()

const showLayoutDebug = useStorySectionLayoutDebug()

const resolvedMediaType = computed(() =>
  readStorySplitMediaType({
    ...(props as unknown as Record<string, unknown>),
    ...(attrs as Record<string, unknown>),
  }),
)

const { displayUrl, pending, captionHtml, captionAlt, bgColor, hasSource } = useStorySectionImage(
  () => props.Image,
  () => `${props.sectionKey}-img`,
)

const {
  isVideo,
  sourceUrl,
  vimeoEmbed,
  youtubeEmbedUrl,
  isNativeVideo,
  hasPlayableVideo,
} = useStorySectionVideo(
  () => props.Image,
  () => resolvedMediaType.value,
)

const textHtml = computed(() => storyHtmlContent(props.Text))

const hasContent = computed(() => textHtml.value != null)

const showSection = computed(() => {
  if (hasContent.value)
    return true
  if (!hasSource.value)
    return false
  if (isVideo.value)
    return hasPlayableVideo.value
  return Boolean(displayUrl.value || hasSource.value)
})

const imageAlt = computed(() => captionAlt.value)

const isCoverLayout = computed(
  () => props.Layout === 'Left' || props.Layout === 'Right',
)

const overlayCaptionClass = computed(() =>
  props.Layout === 'Left'
    ? 'story-split-image__caption--bottom-left'
    : 'story-split-image__caption--bottom-right',
)

const layoutClass = computed(() => {
  const map: Record<TStorySplitImageType['Layout'], string> = {
    Left: 'story-split-image--left', // OK
    Right: 'story-split-image--right', // OK
    LeftInline: 'story-split-image--left-inline', // OK
    RightInline: 'story-split-image--right-inline', // OK
    LeftInlineVertical: 'story-split-image--left-inline-vertical',
    RightInlineVertical: 'story-split-image--right-inline-vertical',
  }
  return map[props.Layout]
})

const isInlineLayout = computed(
  () => props.Layout === 'LeftInline'
    || props.Layout === 'RightInline'
    || props.Layout === 'LeftInlineVertical'
    || props.Layout === 'RightInlineVertical',
)

const isDesktop = useMediaQuery('(min-width: 768px)')

const useCaptionLayout = computed(
  () => isDesktop.value
    && isInlineLayout.value
    && !isCoverLayout.value
    && Boolean(captionHtml.value),
)

const mediaColumnEl = ref<HTMLElement | null>(null)
const captionBelowEl = ref<HTMLElement | null>(null)
const mediaImageEl = ref<HTMLImageElement | null>(null)
const inlineVerticalVideoPlayerEl = ref<InstanceType<typeof StorySectionVideoPlayer> | null>(null)

const mediaEl = computed<HTMLElement | null>(() => {
  if (mediaImageEl.value)
    return mediaImageEl.value
  return inlineVerticalVideoPlayerEl.value?.containerRef ?? null
})

const { syncLayout: syncCaptionLayout } = useStoryMediaCaptionLayout({
  enabled: useCaptionLayout,
  layerEl: mediaColumnEl,
  captionEl: captionBelowEl,
  mediaEl,
  mediaMaxHeightVar: STORY_SPLIT_IMAGE_MEDIA_MAX_HEIGHT_VAR,
  captionWidthVar: STORY_SPLIT_IMAGE_CAPTION_WIDTH_VAR,
})

const imageBgColor = computed(() => normalizeStoryCssColor(bgColor.value))

const hasMediaBgColor = computed(() => !!imageBgColor.value)

const mediaColumnStyle = computed(() => {
  if (!imageBgColor.value)
    return undefined

  return { backgroundColor: imageBgColor.value }
})
</script>

<style scoped>
.story-split-image__text-outer {
  background-color: transparent;
}

.story-split-image__media-column {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
}

.story-split-image__media-column .story-split-image__media {
  flex: 1;
  width: 100%;
  min-height: 0;
  margin: 0;
}

.story-split-image__text :deep(p + p) {
  margin-block-start: 0.2em;
}

/* —— Mobile —— */
@media (max-width: 767px) {
  .story-section--split-image {
    background-color: transparent;
    margin-block: 0;
    padding-block: 0;
    min-height: auto !important;
    height: auto !important;
  }

  .story-split-image--left .story-split-image__inner,
  .story-split-image--right .story-split-image__inner,
  .story-split-image--left-inline .story-split-image__inner,
  .story-split-image--right-inline .story-split-image__inner,
  .story-split-image--left-inline-vertical .story-split-image__inner,
  .story-split-image--right-inline-vertical .story-split-image__inner,
  .story-split-image__inner {
    display: flex !important;
    flex-direction: column !important;
    flex-wrap: nowrap !important;
    box-sizing: border-box;
    width: 100% !important;
    max-width: 100% !important;
    min-height: auto !important;
    height: auto !important;
    margin-inline: auto;
    padding: 0;
    gap: 24px;
  }

  .story-split-image--left .story-split-image__text-inner,
  .story-split-image--right .story-split-image__text-inner,
  .story-split-image--left-inline .story-split-image__text-inner,
  .story-split-image--right-inline .story-split-image__text-inner,
  .story-split-image--left-inline-vertical .story-split-image__text-inner,
  .story-split-image--right-inline-vertical .story-split-image__text-inner,
  .story-split-image__text-inner {
    position: static !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 32px 16px;
  }

  .story-split-image__media-column {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    height: auto;
    min-height: auto;
    margin: 0;
    padding: 0;
    order: 1;
  }

  .story-split-image__media {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
  }

  .story-split-image__media-inner {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    max-width: none;
    height: auto;
    min-height: 0;
    margin: 0;
    padding: 0;
    overflow: visible;
  }

  .story-split-image__media-stack {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    height: auto;
    min-height: 0;
  }

  .story-split-image__media-inner :deep(.story-link-scheda-media),
  .story-split-image__media-inner :deep(.story-link-scheda-media--fill) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    height: auto;
    flex: none;
    align-self: stretch;
  }

  .story-split-image__image {
    display: block;
    width: 100%;
    max-width: none;
    height: auto;
    max-height: none;
    min-height: 0;
    margin-inline: 0;
    object-fit: contain;
    object-position: center;
  }

  .story-split-image__video {
    display: block;
    width: 100%;
    max-width: none;
    min-width: 0;
    min-height: 0;
    margin-inline: 0;
  }

  .story-split-image__text-outer {
    position: relative;
    box-sizing: border-box;
    flex-shrink: 0;
    width: 100%;
    min-height: auto;
    order: 2;
    padding: 0;
  }

  .story-split-image--left .story-split-image__text-outer,
  .story-split-image--right .story-split-image__text-outer,
  .story-split-image--left-inline .story-split-image__text-outer,
  .story-split-image--right-inline .story-split-image__text-outer,
  .story-split-image--left-inline-vertical .story-split-image__text-outer,
  .story-split-image--right-inline-vertical .story-split-image__text-outer,
  .story-split-image__text-outer {
    width: 100% !important;
    min-height: auto !important;
    height: auto !important;
  }

  .story-split-image--left .story-split-image__media-column,
  .story-split-image--right .story-split-image__media-column,
  .story-split-image--left-inline .story-split-image__media-column,
  .story-split-image--right-inline .story-split-image__media-column,
  .story-split-image--left-inline-vertical .story-split-image__media-column,
  .story-split-image--right-inline-vertical .story-split-image__media-column {
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
  }

  .story-split-image--right .story-split-image__media-column,
  .story-split-image--right-inline .story-split-image__media-column,
  .story-split-image--right-inline-vertical .story-split-image__media-column {
    order: 1;
  }

  .story-split-image--right .story-split-image__text-outer,
  .story-split-image--right-inline .story-split-image__text-outer,
  .story-split-image--right-inline-vertical .story-split-image__text-outer {
    order: 2;
  }

  .story-split-image__caption--overlay,
  .story-split-image__caption--below {
    position: relative;
    left: auto;
    right: auto;
    top: auto;
    bottom: auto;
    box-sizing: border-box;
    width: auto;
    max-width: calc(100% - 32px);
    margin: 0.5rem 16px 0;
    padding: 0;
    text-align: left;
    color: inherit;
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border-radius: 0;
    overflow-wrap: break-word;
  }

  .story-split-image--left-inline-vertical .story-split-image__media-inner,
  .story-split-image--right-inline-vertical .story-split-image__media-inner {
    max-width: none;
    margin-left: 0;
    margin-right: 0;
  }

  .story-split-image--left-inline .story-split-image__media-inner,
  .story-split-image--right-inline .story-split-image__media-inner {
    max-width: none;
    margin-inline: 0;
    align-items: stretch;
  }

  .story-split-image--left-inline .story-split-image__media-stack,
  .story-split-image--right-inline .story-split-image__media-stack,
  .story-split-image--left-inline-vertical .story-split-image__media-stack,
  .story-split-image--right-inline-vertical .story-split-image__media-stack {
    align-items: stretch;
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
.story-section--split-image {
  background-color: transparent;
  margin-block: 0;
  padding-block: 0;
}

/* Cover Left/Right — 50/50 viewport, testo con padding come scroll-reveal */
.story-split-image--left .story-split-image__inner,
.story-split-image--right .story-split-image__inner {
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  margin-inline: 0;
  min-height: 100vh;
  min-height: 100dvh;
}

.story-split-image--left .story-split-image__media-column,
.story-split-image--right .story-split-image__media-column,
.story-split-image--left .story-split-image__text-outer,
.story-split-image--right .story-split-image__text-outer {
  box-sizing: border-box;
  flex: 0 0 50%;
  width: 50%;
  max-width: 50%;
  min-width: 0;
}

.story-split-image--left .story-split-image__media,
.story-split-image--right .story-split-image__media {
  align-items: center;
}

/* Inline — contenitore centrato come scroll-reveal */
.story-split-image--left-inline .story-split-image__inner,
.story-split-image--right-inline .story-split-image__inner,
.story-split-image--left-inline-vertical .story-split-image__inner,
.story-split-image--right-inline-vertical .story-split-image__inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  gap: 5vw;
  width: 1440px;
  max-width: 100%;
  margin-inline: auto;
  padding-inline: 5vw;
  padding-block: 1rem;
  min-height: auto;
}

.story-split-image--left-inline .story-split-image__media-column,
.story-split-image--right-inline .story-split-image__media-column,
.story-split-image--left-inline-vertical .story-split-image__media-column,
.story-split-image--right-inline-vertical .story-split-image__media-column,
.story-split-image--left-inline .story-split-image__text-outer,
.story-split-image--right-inline .story-split-image__text-outer,
.story-split-image--left-inline-vertical .story-split-image__text-outer,
.story-split-image--right-inline-vertical .story-split-image__text-outer {
  box-sizing: border-box;
  flex: 1;
  width: auto;
  max-width: none;
  min-width: 0;
}

.story-split-image--left-inline .story-split-image__text-outer,
.story-split-image--right-inline .story-split-image__text-outer,
.story-split-image--left-inline-vertical .story-split-image__text-outer,
.story-split-image--right-inline-vertical .story-split-image__text-outer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: auto;
}

.story-split-image--left-inline .story-split-image__text-inner,
.story-split-image--right-inline .story-split-image__text-inner,
.story-split-image--left-inline-vertical .story-split-image__text-inner,
.story-split-image--right-inline-vertical .story-split-image__text-inner {
  position: static;
  top: auto;
  left: auto;
  right: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: auto;
}

/* Image.bgColor — split 50/50 viewport (inline promosso a full-bleed come Left/Right cover) */
.story-split-image--has-media-bg .story-split-image__inner {
  display: flex;
  flex-direction: row !important;
  box-sizing: border-box;
  width: 100%;
  max-width: none;
  margin-inline: 0;
  padding-inline: 0;
  padding-block: 0;
  gap: 0;
  min-height: 100vh;
  min-height: 100dvh;
  align-items: stretch;
}

.story-split-image--has-media-bg .story-split-image__media-column {
  flex: 0 0 50%;
  width: 50%;
  max-width: 50%;
  min-width: 0;
  align-self: stretch;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
}

.story-split-image--has-media-bg .story-split-image__text-outer {
  flex: 0 0 50%;
  width: 50%;
  max-width: 50%;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding-inline: 5vw;
  padding-block: 1rem;
}

/* left */
.story-split-image--left .story-split-image__media-column {
  height: 100vh;
  height: 100dvh;
  min-height: 100vh;
  min-height: 100dvh;
  opacity: 1;
}

.story-split-image--left .story-split-image__media {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  margin: 0;
  padding: 0;
  opacity: 1;
}

.story-split-image--left .story-split-image__media,
.story-split-image--left .story-split-image__media-inner {
  margin-block: 0;
  padding-block: 0;
}

.story-split-image--left .story-split-image__media-inner {
  position: relative;
  display: flex;
  flex: 1;
  align-items: stretch;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.story-split-image--left .story-split-image__media-stack {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.story-split-image--left .story-split-image__media-inner :deep(.story-link-scheda-media--fill) {
  flex: 1;
  align-self: stretch;
  min-height: 0;
}

.story-split-image--left .story-split-image__image {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: cover;
  object-position: center;
}

.story-split-image--left .story-split-image__video {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.story-split-image--left .story-split-image__text-outer {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  min-height: 100vh;
  min-height: 100dvh;
  padding-inline: 5vw;
  padding-block: 1rem;
  opacity: 1;
}

.story-split-image--left .story-split-image__text-inner {
  position: static;
  top: auto;
  left: auto;
  right: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: auto;
  opacity: 1;
}

/* right */
.story-split-image--right .story-split-image__media-column {
  height: 100vh;
  height: 100dvh;
  min-height: 100vh;
  min-height: 100dvh;
  opacity: 1;
}

.story-split-image--right .story-split-image__media {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  margin: 0;
  padding: 0;
  opacity: 1;
}

.story-split-image--right .story-split-image__media,
.story-split-image--right .story-split-image__media-inner {
  margin-block: 0;
  padding-block: 0;
}

.story-split-image--right .story-split-image__media-inner {
  position: relative;
  display: flex;
  flex: 1;
  align-items: stretch;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.story-split-image--right .story-split-image__media-stack {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.story-split-image--right .story-split-image__media-inner :deep(.story-link-scheda-media--fill) {
  flex: 1;
  align-self: stretch;
  min-height: 0;
}

.story-split-image--right .story-split-image__image {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: cover;
  object-position: center;
}

.story-split-image--right .story-split-image__video {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.story-split-image--right .story-split-image__text-outer {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  min-height: 100vh;
  min-height: 100dvh;
  padding-inline: 5vw;
  padding-block: 1rem;
  opacity: 1;
}

.story-split-image--right .story-split-image__text-inner {
  position: static;
  top: auto;
  left: auto;
  right: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: auto;
  opacity: 1;
}

/* left-inline */
.story-split-image--left-inline .story-split-image__media {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.story-split-image--left-inline .story-split-image__media-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  margin-inline: auto;
  flex: 0 1 auto;
  min-height: 0;
  overflow: hidden;
}

.story-split-image--left-inline .story-split-image__media-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.story-split-image--left-inline .story-split-image__image {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  object-position: center;
}

.story-split-image--left-inline .story-split-image__video {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

/* right-inline */
.story-split-image--right-inline .story-split-image__media {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.story-split-image--right-inline .story-split-image__media-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  margin-inline: auto;
  flex: 0 1 auto;
  min-height: 0;
  overflow: hidden;
}

.story-split-image--right-inline .story-split-image__media-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.story-split-image--right-inline .story-split-image__image {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  object-position: center;
}

.story-split-image--right-inline .story-split-image__video {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.story-split-image--left-inline.story-split-image--video .story-split-image__media-inner :deep(.story-link-scheda-media),
.story-split-image--right-inline.story-split-image--video .story-split-image__media-inner :deep(.story-link-scheda-media) {
  display: block;
  width: 100%;
  max-width: 100%;
  line-height: 0;
}

/* left-inline-vertical */
.story-split-image--left-inline-vertical .story-split-image__media {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.story-split-image--left-inline-vertical .story-split-image__media-stack,
.story-split-image--right-inline-vertical .story-split-image__media-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* Inline vertical: colonna immagine shrink-wrap, centrata nella metà */
.story-split-image--left-inline-vertical .story-split-image__media-inner,
.story-split-image--right-inline-vertical .story-split-image__media-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  margin-inline: auto;
}

.story-split-image--left-inline-vertical .story-split-image__media-inner :deep(.story-link-scheda-media),
.story-split-image--right-inline-vertical .story-split-image__media-inner :deep(.story-link-scheda-media) {
  display: block;
  max-width: 100%;
  line-height: 0;
}

.story-split-image--left-inline-vertical .story-split-image__image,
.story-split-image--right-inline-vertical .story-split-image__image {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  object-position: center;
}

.story-split-image--left-inline-vertical .story-split-image__video,
.story-split-image--right-inline-vertical .story-split-image__video {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

/* right-inline-vertical */
.story-split-image--right-inline-vertical .story-split-image__media {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Caption — overlay su Left / Right */
.story-split-image__caption--overlay {
  position: absolute;
  z-index: 2;
  box-sizing: border-box;
  max-width: min(var(--story-caption-overlay-max-width), calc(100% - 64px));
  margin: 0;
  padding: 0.35rem 0.65rem;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  overflow-wrap: break-word;
}

.story-split-image__caption--bottom-left {
  left: 32px;
  bottom: 32px;
}

.story-split-image__caption--bottom-right {
  right: 32px;
  bottom: 32px;
}

/* Caption — sotto l'immagine su layout inline */
.story-split-image--left-inline .story-split-image__caption--below,
.story-split-image--right-inline .story-split-image__caption--below,
.story-split-image--left-inline-vertical .story-split-image__caption--below,
.story-split-image--right-inline-vertical .story-split-image__caption--below {
  box-sizing: border-box;
  width: 100%;
  max-width: var(--story-caption-max-width);
  margin-top: 0.5rem;
  margin-inline: auto;
  overflow-wrap: break-word;
  text-align: left;
}

/* Inline caption-below — resize-safe bundle (≈ ScrollReveal Mode C) */
.story-split-image--has-caption-below .story-split-image__media-column {
  align-self: stretch;
  box-sizing: border-box;
  min-height: 0;
  max-height: 100%;
  padding-block: var(--story-split-image-media-padding-block);
}

.story-split-image--has-caption-below .story-split-image__media-inner {
  overflow: visible;
}

.story-split-image--left-inline.story-split-image--has-caption-below .story-split-image__media-inner,
.story-split-image--right-inline.story-split-image--has-caption-below .story-split-image__media-inner {
  overflow: visible;
}

.story-split-image--has-caption-below .story-split-image__media-inner :deep(.story-link-scheda-media) {
  max-height: var(--story-split-image-media-max-height, none);
}

.story-split-image--has-caption-below .story-split-image__image {
  max-height: var(--story-split-image-media-max-height, none);
  object-position: center bottom;
}

.story-split-image--has-caption-below .story-split-image__video {
  max-height: var(--story-split-image-media-max-height, none);
}

.story-split-image--has-caption-below .story-split-image__caption--below {
  width: var(--story-split-image-caption-width, auto);
  max-width: min(var(--story-caption-max-width), 100%);
}

@media (min-width: 1025px) {
  .story-split-image--left .story-split-image__media-column {
    padding-inline-start: var(--story-split-cover-media-edge-gutter);
  }

  .story-split-image--right .story-split-image__media-column {
    padding-inline-end: var(--story-split-cover-media-edge-gutter);
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .story-split-image--left .story-split-image__inner,
  .story-split-image--right .story-split-image__inner,
  .story-split-image--left-inline .story-split-image__inner,
  .story-split-image--right-inline .story-split-image__inner,
  .story-split-image--left-inline-vertical .story-split-image__inner,
  .story-split-image--right-inline-vertical .story-split-image__inner {
    flex-direction: column !important;
    padding-block: 0.75rem;
  }

  .story-split-image--left .story-split-image__inner,
  .story-split-image--right .story-split-image__inner {
    gap: 5vw;
    padding-inline: 5vw;
  }

  .story-split-image--left .story-split-image__media-column,
  .story-split-image--right .story-split-image__media-column,
  .story-split-image--left .story-split-image__text-outer,
  .story-split-image--right .story-split-image__text-outer {
    flex: none;
    width: 100%;
    max-width: 100%;
    min-height: auto;
    height: auto;
  }

  .story-split-image--left .story-split-image__media-column,
  .story-split-image--right .story-split-image__media-column {
    height: auto;
    min-height: auto;
  }

  .story-split-image--left .story-split-image__media-inner,
  .story-split-image--right .story-split-image__media-inner,
  .story-split-image--left .story-split-image__media-stack {
    height: auto;
    flex: none;
  }

  .story-split-image--left .story-split-image__image,
  .story-split-image--right .story-split-image__image,
  .story-split-image--left .story-split-image__video,
  .story-split-image--right .story-split-image__video {
    height: auto;
    object-fit: contain;
  }

  .story-split-image--left .story-split-image__text-outer,
  .story-split-image--right .story-split-image__text-outer {
    padding-inline: 0;
    padding-block: 0;
  }

  .story-split-image--has-media-bg .story-split-image__inner {
    flex-direction: row !important;
    padding-block: 0;
    gap: 0;
  }

  .story-split-image--has-media-bg .story-split-image__media-column,
  .story-split-image--has-media-bg .story-split-image__text-outer {
    flex: 0 0 50%;
    width: 50%;
    max-width: 50%;
    min-height: 100vh;
    min-height: 100dvh;
    height: auto;
  }
}
}

/* DEBUG layout — bordi sottili per visualizzare i contenitori */
.story-section--debug-layout.story-section--split-image {
  outline: 1px solid rgba(220, 38, 38, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-split-image__inner {
  outline: 1px solid rgba(234, 88, 12, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-split-image__media-column {
  outline: 1px solid rgba(22, 163, 74, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-split-image__media {
  outline: 1px solid rgba(13, 148, 136, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-split-image__media-stack {
  outline: 1px solid rgba(13, 148, 136, 0.35);
  outline-offset: -1px;
}

.story-section--debug-layout .story-split-image__media-inner {
  outline: 1px solid rgba(37, 99, 235, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-split-image__media-inner :deep(.story-link-scheda-media) {
  outline: 1px solid rgba(124, 58, 237, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-split-image__image,
.story-section--debug-layout .story-split-image__video {
  outline: 1px solid rgba(219, 39, 119, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-split-image__caption {
  outline: 1px solid rgba(202, 138, 4, 0.55);
  outline-offset: -1px;
}

.story-section--debug-layout .story-split-image__text-outer {
  outline: 1px solid rgba(225, 29, 72, 0.45);
  outline-offset: -1px;
}

.story-section--debug-layout .story-split-image__text-inner {
  outline: 1px solid rgba(132, 204, 22, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-split-image__text {
  outline: 1px solid rgba(8, 145, 178, 0.5);
  outline-offset: -1px;
}
</style>

<!-- Unscoped: override global story-sections.css fullscreen-stack rules on mobile -->
<style>
@media (max-width: 767px) {
  .story-fullscreen-stack__layer .story-section--split-image,
  .story-section-renderer.story-panel-opaque .story-section--split-image,
  .story-section.story-section--split-image {
    min-height: auto !important;
    height: auto !important;
  }

  .story-fullscreen-stack__layer .story-section--split-image .story-split-image__inner {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
  }

  .story-fullscreen-stack__layer .story-split-image__caption--overlay.story-caption--overlay,
  .story-split-image__caption--overlay.story-caption--overlay {
    position: relative !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    bottom: auto !important;
  }
}
</style>
