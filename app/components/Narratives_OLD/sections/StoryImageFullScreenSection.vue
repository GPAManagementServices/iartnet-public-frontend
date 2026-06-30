<template>
  <section
    v-if="hasSource && (displayUrl || !pending)"
    class="story-section story-section--bleed story-section--image-full-screen"
    :class="fitClass"
    :style="sectionStyle"
  >
    <figure class="story-fs-figure">
      <div class="story-fs-media">
        <StoryLinkSchedaMedia
          :link-scheda="LinkScheda"
          fill
        >
          <img
            v-if="displayUrl"
            class="story-fs-image"
            :src="displayUrl"
            :alt="captionAlt"
            loading="lazy"
            decoding="async"
          >
        </StoryLinkSchedaMedia>
        <figcaption
          v-if="captionHtml"
          class="story-fs-caption story-caption story-caption--overlay story-fs-caption--overlay"
          :class="positionClass"
          v-html="captionHtml"
        />
      </div>
    </figure>
  </section>
</template>

<script setup lang="ts">
import type { TStoryImageFullScreenType } from '#shared/types/api'
import { computed } from 'vue'
import StoryLinkSchedaMedia from '~/components/Narratives_OLD/StoryLinkSchedaMedia.vue'
import { useStorySectionLegacyImageBackground } from '~/composables/useStorySectionBackground'
import { useStorySectionImage } from '~/composables/useStorySectionImage'

const props = defineProps<TStoryImageFullScreenType & { sectionKey: string }>()

const { displayUrl, pending, captionHtml, captionAlt, bgColor, hasSource } = useStorySectionImage(
  () => props.Image,
  () => `${props.sectionKey}-img`,
)

const fitClass = computed(() =>
  props.Fit === 'Contain'
    ? 'story-section--image-full-screen--contain'
    : 'story-section--image-full-screen--cover',
)

const positionClass = computed(() => {
  const map = {
    BottomLeft: 'story-fs-caption--bottom-left',
    BottomRight: 'story-fs-caption--bottom-right',
    TopLeft: 'story-fs-caption--top-left',
    TopRight: 'story-fs-caption--top-right',
  } as const
  return map[props.Position]
})

const { style: sectionStyle } = useStorySectionLegacyImageBackground(
  () => props.bgColor,
  () => props.bgImage,
  () => bgColor.value,
)
</script>

<style scoped>
/* —— Mobile —— */
@media (max-width: 767px) {
  .story-section--image-full-screen {
    height: auto !important;
    min-height: auto !important;
    padding: 48px 16px 24px;
    overflow: visible;
  }

  .story-fs-figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: auto;
    margin: 0;
  }

  .story-fs-media {
    position: relative;
    display: flex;
    flex-direction: column !important;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: auto !important;
    gap: 0;
  }

  .story-fs-media :deep(.story-link-scheda-media),
  .story-fs-media :deep(.story-link-scheda-media--fill) {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: auto !important;
  }

  .story-fs-image {
    display: block;
    width: auto;
    max-width: 100%;
    height: auto;
    max-height: none;
    margin-inline: auto;
    object-fit: contain;
    object-position: center;
  }

  .story-fs-caption--overlay {
    position: relative !important;
    z-index: 2;
    box-sizing: border-box;
    width: 100% !important;
    max-width: 100% !important;
    margin: 16px 0 0;
    padding: 0.35rem 0.65rem;
    text-align: left;
    color: #fff !important;
    background: rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    overflow-wrap: break-word;
  }

  .story-fs-caption--bottom-left,
  .story-fs-caption--bottom-right,
  .story-fs-caption--top-left,
  .story-fs-caption--top-right {
    position: relative !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    bottom: auto !important;
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
  .story-section--image-full-screen {
    height: var(--story-section-min-height);
    min-height: var(--story-section-min-height);
    padding: 0;
    overflow: hidden;
  }

  .story-fs-figure {
    width: 100%;
    height: 100%;
    margin: 0;
  }

  .story-fs-media {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .story-fs-media :deep(.story-link-scheda-media--fill) {
    width: 100%;
    height: 100%;
  }

  .story-fs-image {
    display: block;
    width: 100%;
    height: 100%;
  }

  .story-fs-caption--overlay {
    position: absolute;
    z-index: 2;
    box-sizing: border-box;
    max-width: min(var(--story-caption-overlay-max-width), calc(100% - 2rem));
    margin: 0;
    padding: 0.35rem 0.65rem;
    color: #fff;
    background: rgba(0, 0, 0, 0.22);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    overflow-wrap: break-word;
  }

  .story-section--image-full-screen--cover .story-fs-image {
    object-fit: cover;
    object-position: center;
  }

  .story-section--image-full-screen--contain .story-fs-image {
    object-fit: contain;
    object-position: center;
  }

  .story-fs-caption--bottom-left {
    left: clamp(1rem, 4vw, 2.5rem);
    bottom: clamp(1rem, 4vw, 2.5rem);
  }

  .story-fs-caption--bottom-right {
    right: clamp(1rem, 4vw, 2.5rem);
    bottom: clamp(1rem, 4vw, 2.5rem);
  }

  .story-fs-caption--top-left {
    left: clamp(1rem, 4vw, 2.5rem);
    top: clamp(1rem, 4vw, 2.5rem);
  }

  .story-fs-caption--top-right {
    right: clamp(1rem, 4vw, 2.5rem);
    top: clamp(1rem, 4vw, 2.5rem);
  }
}
</style>

<!-- Unscoped: override global story-sections.css fullscreen-stack rules on mobile -->
<style>
@media (max-width: 767px) {
  .story-fullscreen-stack__layer .story-section--image-full-screen,
  .story-section-renderer.story-panel-opaque .story-section--image-full-screen,
  .story-section.story-section--image-full-screen {
    height: auto !important;
    min-height: auto !important;
  }

  .story-fullscreen-stack__layer .story-fs-media {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    height: auto !important;
  }

  .story-fullscreen-stack__layer .story-fs-caption--overlay.story-caption--overlay,
  .story-fs-caption--overlay.story-caption--overlay {
    position: relative !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    bottom: auto !important;
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
