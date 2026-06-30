<template>
  <section
    v-if="hasSource && (displayUrl || !pending)"
    class="story-section story-section--inline-image"
    :class="{ }"
    :style="sectionStyle"
  >
    <figure class="story-inline-image__figure">
      <div class="story-inline-image__stack">
        <div class="story-inline-image__media">
          <StoryLinkSchedaMedia :link-scheda="LinkScheda">
            <img
              v-if="displayUrl"
              class="story-inline-image__image"
              :src="displayUrl"
              :alt="captionAlt"
              loading="lazy"
              decoding="async"
            >
          </StoryLinkSchedaMedia>
          <figcaption
            v-if="captionHtml"
            class="story-inline-image__caption story-caption"
            v-html="captionHtml"
          />
        </div>
      </div>
    </figure>
  </section>
</template>

<script setup lang="ts">
import type { TStoryInlineImageType } from '#shared/types/api'
import { computed } from 'vue'
import StoryLinkSchedaMedia from '~/components/Narratives_OLD/StoryLinkSchedaMedia.vue'
import { useStorySectionLegacyImageBackground } from '~/composables/useStorySectionBackground'
import { useStorySectionImage } from '~/composables/useStorySectionImage'

const props = defineProps<TStoryInlineImageType & { sectionKey: string }>()


const { displayUrl, pending, captionHtml, captionAlt, bgColor, hasSource } = useStorySectionImage(
  () => props.Image,
  () => `${props.sectionKey}-img`,
)

const { style: sectionStyle } = useStorySectionLegacyImageBackground(
  () => props.bgColor,
  () => props.bgImage,
  () => bgColor.value,
)
</script>

<style scoped>
/* —— Mobile —— */
@media (max-width: 767px) {
  .story-section--inline-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
    width: 100%;
    min-height: auto;
    margin: 0;
    padding: 32px 16px;
    background-color: var(--story-color-background);
    overflow: visible;
  }

  .story-inline-image__figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: fit-content;
    max-width: 100%;
    margin: 0;
  }

  .story-inline-image__stack {
    box-sizing: border-box;
    width: fit-content;
    max-width: 100%;
  }

  .story-inline-image__media {
    display: table;
    max-width: 100%;
  }

  .story-inline-image__media :deep(.story-link-scheda-media) {
    display: block;
    max-width: 100%;
  }

  .story-inline-image__image {
    display: block;
    max-width: 100%;
    max-height: 60vh;
    width: auto;
    height: auto;
    object-fit: contain;
    object-position: center;
  }

  .story-inline-image__caption {
    position: relative;
    z-index: 2;
    display: table-caption;
    caption-side: bottom;
    box-sizing: border-box;
    width: auto;
    min-height: 22px;
    margin-top: var(--story-inline-image-figure-gap);
    overflow-wrap: break-word;
    text-align: center;
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
  .story-section--inline-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
    width: 100%;
    min-height: auto;
    margin: 0;
    padding: var(--story-inline-image-padding);
    background-color: var(--story-color-background);
    overflow: visible;
  }

  .story-inline-image__figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: fit-content;
    max-width: 100%;
    margin: 0;
  }

  .story-inline-image__stack {
    box-sizing: border-box;
    width: fit-content;
    max-width: 100%;
  }

  .story-inline-image__media {
    display: table;
    max-width: 100%;
  }

  .story-inline-image__media :deep(.story-link-scheda-media) {
    display: block;
    max-width: 100%;
  }

  .story-inline-image__image {
    display: block;
    max-width: 1200px;
    max-height: var(--story-inline-image-max-height);
    width: auto;
    height: auto;
    object-fit: contain;
    object-position: center;
  }

  .story-inline-image__caption {
    position: relative;
    z-index: 2;
    display: table-caption;
    caption-side: bottom;
    box-sizing: border-box;
    width: auto;
    min-height: 22px;
    margin-top: var(--story-inline-image-figure-gap);
    overflow-wrap: break-word;
    text-align: center;
  }
}

@media (min-width: 1024px) {
  .story-section--inline-image {
    padding: var(--story-inline-image-padding-desktop);
  }
}

</style>
