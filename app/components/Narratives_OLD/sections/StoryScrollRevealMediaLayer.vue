<template>
  <figure
    v-if="showLayer"
    class="story-scroll-reveal__media-layer"
    :class="{
      'story-scroll-reveal__media-layer--active': active,
      'story-scroll-reveal__media-layer--gsap': gsapControlled,
    }"
    :aria-hidden="gsapControlled ? false : !active"
  >
    <div class="story-scroll-reveal__media-image-slot">
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
    </div>
    <figcaption
      v-if="captionHtml && (gsapControlled || active)"
      class="story-scroll-reveal__caption story-caption"
      v-html="captionHtml"
    />
  </figure>
</template>

<script setup lang="ts">
import type { TStoryScrollRevealParagraphType } from '#shared/types/api'
import { computed } from 'vue'
import StoryLinkSchedaMedia from '~/components/Narratives_OLD/StoryLinkSchedaMedia.vue'
import { useStorySectionImage } from '~/composables/useStorySectionImage'

const props = withDefaults(
  defineProps<{
    paragraph: TStoryScrollRevealParagraphType
    paragraphIndex: number
    sectionKey: string
    active?: boolean
    gsapControlled?: boolean
  }>(),
  {
    active: false,
    gsapControlled: false,
  },
)

const { displayUrl, pending, captionHtml, captionAlt, hasSource } = useStorySectionImage(
  () => props.paragraph.Image,
  () => `${props.sectionKey}-p-${props.paragraphIndex}`,
)

const showLayer = computed(
  () => hasSource.value && (displayUrl.value || !pending.value),
)

const imageAlt = computed(() => captionAlt.value)
</script>
