<template>
  <article
    v-if="showBlock"
    class="story-scroll-reveal__block"
    :class="[layoutClass, { 'story-section--debug-layout': showLayoutDebug }]"
    :style="blockStyle"
    :data-paragraph-index="paragraphIndex"
  >
    <div class="story-scroll-reveal__inner">
      <div class="story-scroll-reveal__text">
        <div
          v-if="textHtml"
          class="story-scroll-reveal__text-block"
        >
          <div
            class="story-scroll-reveal__prose story-prose"
            v-html="textHtml"
          />
        </div>
      </div>

      <figure
        v-if="hasSource && (displayUrl || !pending)"
        class="story-scroll-reveal__media"
      >
        <StoryLinkSchedaMedia :link-scheda="paragraph.LinkScheda">
          <img
            v-if="displayUrl"
            class="story-scroll-reveal__image"
            :src="displayUrl"
            :alt="imageAlt"
            loading="lazy"
            decoding="async"
          >
        </StoryLinkSchedaMedia>
        <figcaption
          v-if="captionHtml"
          class="story-scroll-reveal__caption story-caption"
          v-html="captionHtml"
        />
      </figure>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { TStoryScrollRevealParagraphType } from '#shared/types/api'
import { storyHtmlContent } from '#shared/utils/storyText'
import { computed } from 'vue'
import StoryLinkSchedaMedia from '~/components/Narratives/StoryLinkSchedaMedia.vue'
import { useStorySectionLayoutDebug } from '~/composables/useStorySectionLayoutDebug'
import { useStorySectionImage } from '~/composables/useStorySectionImage'

const props = withDefaults(
  defineProps<{
    paragraph: TStoryScrollRevealParagraphType
    paragraphIndex: number
    sectionKey: string
    imageSide?: 'left' | 'right'
  }>(),
  { imageSide: 'right' },
)

const showLayoutDebug = useStorySectionLayoutDebug()

const { displayUrl, pending, captionHtml, captionAlt, bgColor, hasSource } = useStorySectionImage(
  () => props.paragraph.Image,
  () => `${props.sectionKey}-p-${props.paragraphIndex}`,
)

const textHtml = computed(() => storyHtmlContent(props.paragraph.Text))

const showBlock = computed(
  () => textHtml.value != null || (hasSource.value && (displayUrl.value || !pending.value)),
)

const imageAlt = computed(() => captionAlt.value)

const layoutClass = computed(() =>
  props.imageSide === 'left'
    ? 'story-scroll-reveal--image-left'
    : 'story-scroll-reveal--image-right',
)

const blockStyle = computed(() => {
  const bg = bgColor.value
  return bg ? { backgroundColor: bg } : undefined
})
</script>

<style scoped>
/* —— Mobile —— */
@media (max-width: 767px) {
  .story-scroll-reveal__block {
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    min-height: auto;
    margin-block: 0;
    padding-block: 0;
    background-color: transparent;
  }

  .story-scroll-reveal__inner {
    display: flex;
    flex-direction: column;
    position: relative;
    box-sizing: border-box;
    gap: 24px;
    width: 100%;
    max-width: 100%;
    margin-inline: auto;
    padding: 0;
    flex: 1;
    align-items: stretch;
    min-height: 0;
  }

  .story-scroll-reveal__block + .story-scroll-reveal__block .story-scroll-reveal__text {
    padding-block-start: 32px;
  }

  .story-scroll-reveal__prose :deep(p + p) {
    margin-block-start: 0.2em;
  }

  .story-scroll-reveal__text {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1rem;
    box-sizing: border-box;
    padding: 32px 16px 0;
  }

  .story-scroll-reveal__text-block {
    width: 100%;
  }

  .story-scroll-reveal__media {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    align-items: stretch;
    align-self: stretch;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 0;
  }

  .story-scroll-reveal__media :deep(.story-link-scheda-media) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .story-scroll-reveal__image {
    display: block;
    width: 100%;
    max-width: none;
    height: auto;
    margin-inline: 0;
    object-fit: contain;
    object-position: center;
  }

  .story-scroll-reveal__caption {
    width: auto;
    max-width: calc(100% - 32px);
    margin: 0.5rem 16px 32px;
    text-align: left;
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
  .story-scroll-reveal__block {
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    min-height: auto;
    margin-block: 0;
    padding-block: 0;
    background-color: var(--story-color-background);
  }

  .story-scroll-reveal__inner {
    display: flex;
    position: relative;
    box-sizing: border-box;
    gap: 5vw;
    width: 1440px;
    max-width: 100%;
    margin-inline: auto;
    padding-inline: 5vw;
    padding-block: 1rem;
    flex: 1;
    align-items: center;
    min-height: 0;
  }

  .story-scroll-reveal__block + .story-scroll-reveal__block .story-scroll-reveal__inner {
    padding-block-start: 0;
  }

  .story-scroll-reveal__prose :deep(p + p) {
    margin-block-start: 0.2em;
  }

  .story-scroll-reveal--image-left .story-scroll-reveal__inner {
    flex-direction: row-reverse;
  }

  .story-scroll-reveal__text {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.25rem;
    box-sizing: border-box;
  }

  .story-scroll-reveal__text-block {
    width: 100%;
  }

  .story-scroll-reveal__media {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    align-self: center;
    justify-content: center;
    box-sizing: border-box;
    width: fit-content;
    max-width: 100%;
    margin: 0;
  }

  .story-scroll-reveal__image {
    display: block;
    width: 100%;
    max-width: 100%;
    height: auto;
    object-fit: contain;
    object-position: center;
  }

  .story-scroll-reveal__caption {
    width: 100%;
    max-width: var(--story-caption-max-width);
    margin-top: 0.5rem;
    text-align: left;
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .story-scroll-reveal__inner {
    flex-direction: column !important;
    padding-block: 0.75rem;
  }

  .story-scroll-reveal__block + .story-scroll-reveal__block .story-scroll-reveal__inner {
    padding-block-start: 0;
  }
}

/* DEBUG layout — bordi sottili per visualizzare i contenitori */
.story-section--debug-layout.story-scroll-reveal__block {
  outline: 1px solid rgba(225, 29, 72, 0.45);
  outline-offset: -1px;
}

.story-section--debug-layout .story-scroll-reveal__inner {
  outline: 1px solid rgba(234, 88, 12, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-scroll-reveal__text {
  outline: 1px solid rgba(8, 145, 178, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-scroll-reveal__text-block {
  outline: 1px solid rgba(132, 204, 22, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-scroll-reveal__prose {
  outline: 1px solid rgba(13, 148, 136, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-scroll-reveal__media {
  outline: 1px solid rgba(22, 163, 74, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-scroll-reveal__media :deep(.story-link-scheda-media) {
  outline: 1px solid rgba(124, 58, 237, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-scroll-reveal__image {
  outline: 1px solid rgba(219, 39, 119, 0.5);
  outline-offset: -1px;
}

.story-section--debug-layout .story-scroll-reveal__caption {
  outline: 1px solid rgba(202, 138, 4, 0.55);
  outline-offset: -1px;
}
</style>
