<template>
  <section
    v-if="showSection && layoutClass.toUpperCase().includes('LEFT')"
    class="story-section story-section--split-image"
    :class="[layoutClass, { 'story-split-image--video': isVideo }]"
    :style="sectionStyle"
  >
    <div class="story-split-image__inner">
      <figure class="story-split-image__media">
        <div class="story-split-image__media-stack">
          <div class="story-split-image__media-inner">
            <StoryLinkSchedaMedia
              :link-scheda="LinkScheda"
              :fill="isCoverLayout"
            >
              <img
                v-if="!isVideo && displayUrl"
                ref="inlineVerticalMediaEl"
                class="story-split-image__image"
                :src="displayUrl"
                :alt="imageAlt"
                loading="lazy"
                decoding="async"
                @load="syncInlineVerticalCaptionWidth"
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
              class="story-split-image__caption story-split-image__caption--below story-caption"
              :style="inlineVerticalCaptionStyle"
              v-html="captionHtml"
            />
          </div>
        </div>
      </figure>

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
    :class="[layoutClass, { 'story-split-image--video': isVideo }]"
    :style="sectionStyle"
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

      <figure class="story-split-image__media">
        <div class="story-split-image__media-stack">
          <div class="story-split-image__media-inner">
            <StoryLinkSchedaMedia
              :link-scheda="LinkScheda"
              :fill="isCoverLayout"
            >
              <img
                v-if="!isVideo && displayUrl"
                ref="inlineVerticalMediaEl"
                class="story-split-image__image"
                :src="displayUrl"
                :alt="imageAlt"
                loading="lazy"
                decoding="async"
                @load="syncInlineVerticalCaptionWidth"
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
              class="story-split-image__caption story-split-image__caption--below story-caption"
              :style="inlineVerticalCaptionStyle"
              v-html="captionHtml"
            />
          </div>
        </div>
      </figure>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TStorySplitImageType } from '#shared/types/api'
import { readStorySplitMediaType } from '#shared/utils/storySplitMedia'
import { storyHtmlContent } from '#shared/utils/storyText'
import { useResizeObserver } from '@vueuse/core'
import { computed, nextTick, ref, useAttrs, watch } from 'vue'
import StoryLinkSchedaMedia from '~/components/Narratives_OLD/StoryLinkSchedaMedia.vue'
import StorySectionVideoPlayer from '~/components/Narratives_OLD/StorySectionVideoPlayer.vue'
import { useStorySectionImage } from '~/composables/useStorySectionImage'
import { useStorySectionLegacyImageBackground } from '~/composables/useStorySectionBackground'
import { useStorySectionVideo } from '~/composables/useStorySectionVideo'

const props = defineProps<
  TStorySplitImageType & {
    sectionKey: string
    mediaType?: TStorySplitImageType['MediaType']
  }
>()
const attrs = useAttrs()


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
  return Boolean(displayUrl.value || !pending.value)
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

const isInlineVerticalLayout = computed(
  () => props.Layout === 'LeftInlineVertical' || props.Layout === 'RightInlineVertical',
)

const inlineVerticalMediaEl = ref<HTMLImageElement | null>(null)
const inlineVerticalVideoPlayerEl = ref<InstanceType<typeof StorySectionVideoPlayer> | null>(null)
const inlineVerticalCaptionWidth = ref<number | null>(null)

const inlineVerticalCaptionStyle = computed(() => {
  if (!isInlineVerticalLayout.value || !inlineVerticalCaptionWidth.value)
    return undefined
  return { width: `${inlineVerticalCaptionWidth.value}px` }
})

function getInlineVerticalMediaElement(): HTMLElement | null {
  if (inlineVerticalMediaEl.value)
    return inlineVerticalMediaEl.value
  return inlineVerticalVideoPlayerEl.value?.containerRef ?? null
}

function syncInlineVerticalCaptionWidth() {
  const mediaEl = getInlineVerticalMediaElement()
  if (!isInlineVerticalLayout.value || !mediaEl)
    return
  inlineVerticalCaptionWidth.value = Math.round(mediaEl.getBoundingClientRect().width)
}

useResizeObserver(() => getInlineVerticalMediaElement(), syncInlineVerticalCaptionWidth)
watch([displayUrl, hasPlayableVideo], () => nextTick(syncInlineVerticalCaptionWidth))

const { color: legacyImageBgColor } = useStorySectionLegacyImageBackground(
  () => props.bgColor,
  () => props.bgImage,
  () => bgColor.value,
)

const sectionStyle = computed(() => {
  const backgroundColor = legacyImageBgColor.value
  if (!backgroundColor)
    return undefined

  const style: Record<string, string> = {
    backgroundColor,
  }

  if (isVideo.value)
    style['--story-color-background'] = backgroundColor

  return style
})
</script>

<style scoped>
.story-split-image--video .story-split-image__text-outer {
  background-color: transparent;
  color: var(--story-color-text);
}

.story-split-image--video .story-split-image__text :deep(a) {
  color: inherit;
}

.story-split-image__text :deep(p + p) {
  margin-block-start: 0.2em;
}

/* —— Mobile —— */
@media (max-width: 767px) {
  .story-section--split-image {
    background-color: var(--story-color-background);
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
    padding: 32px 16px;
    gap: 24px;
  }

  .story-split-image__media {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    height: auto;
    min-height: auto;
    margin: 0;
    padding: 0;
    order: 1;
  }

  .story-split-image__media-inner {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: 0;
    margin: 0;
    padding: 0;
    overflow: visible;
  }

  .story-split-image__media-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: auto;
    min-height: 0;
  }

  .story-split-image__media-inner :deep(.story-link-scheda-media),
  .story-split-image__media-inner :deep(.story-link-scheda-media--fill) {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: auto;
    flex: none;
    align-self: center;
  }

  .story-split-image__image {
    display: block;
    width: auto;
    max-width: 100%;
    height: auto;
    max-height: none;
    min-height: 0;
    margin-inline: auto;
    object-fit: contain;
    object-position: center;
  }

  .story-split-image__video {
    display: block;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    min-height: 0;
    margin-inline: auto;
  }

  .story-split-image__text-outer {
    position: relative;
    box-sizing: border-box;
    flex-shrink: 0;
    width: 100%;
    min-height: auto;
    order: 2;
    padding: 0;
    background-color: var(--story-color-background);
  }

  .story-split-image--video .story-split-image__text-outer {
    background-color: transparent;
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

  .story-split-image--left .story-split-image__media,
  .story-split-image--right .story-split-image__media,
  .story-split-image--left-inline .story-split-image__media,
  .story-split-image--right-inline .story-split-image__media,
  .story-split-image--left-inline-vertical .story-split-image__media,
  .story-split-image--right-inline-vertical .story-split-image__media {
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
  }

  .story-split-image--right .story-split-image__media,
  .story-split-image--right-inline .story-split-image__media,
  .story-split-image--right-inline-vertical .story-split-image__media {
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
    width: 100%;
    max-width: 100%;
    margin-top: 0.5rem;
    padding: 0;
    text-align: center;
    color: inherit;
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border-radius: 0;
    overflow-wrap: break-word;
  }

  .story-split-image--left-inline-vertical .story-split-image__media-inner,
  .story-split-image--right-inline-vertical .story-split-image__media-inner {
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
  }

  .story-split-image--left-inline .story-split-image__media-inner,
  .story-split-image--right-inline .story-split-image__media-inner {
    max-width: 100%;
    margin-inline: 0;
    align-items: center;
  }

  .story-split-image--left-inline .story-split-image__media-stack,
  .story-split-image--right-inline .story-split-image__media-stack,
  .story-split-image--left-inline-vertical .story-split-image__media-stack,
  .story-split-image--right-inline-vertical .story-split-image__media-stack {
    align-items: center;
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
.story-section--split-image {
  background-color: var(--story-color-background);
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

.story-split-image--left .story-split-image__media,
.story-split-image--right .story-split-image__media,
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

.story-split-image--left-inline .story-split-image__media,
.story-split-image--right-inline .story-split-image__media,
.story-split-image--left-inline-vertical .story-split-image__media,
.story-split-image--right-inline-vertical .story-split-image__media,
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

/* left */
.story-split-image--left .story-split-image__media {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100vh;
  height: 100dvh;
  min-height: 100vh;
  min-height: 100dvh;
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
.story-split-image--right .story-split-image__media {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100vh;
  height: 100dvh;
  min-height: 100vh;
  min-height: 100dvh;
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
  text-align: center;
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

  .story-split-image--left .story-split-image__media,
  .story-split-image--right .story-split-image__media,
  .story-split-image--left .story-split-image__text-outer,
  .story-split-image--right .story-split-image__text-outer {
    flex: none;
    width: 100%;
    max-width: 100%;
    min-height: auto;
    height: auto;
  }

  .story-split-image--left .story-split-image__media,
  .story-split-image--right .story-split-image__media {
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
}
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
