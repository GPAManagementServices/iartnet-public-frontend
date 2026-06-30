<template>
  <figure
    v-if="showLayer"
    ref="layerEl"
    class="story-scroll-reveal__media-layer"
    :class="{
      'story-scroll-reveal__media-layer--active': active,
      'story-scroll-reveal__media-layer--gsap': gsapControlled,
      'story-scroll-reveal__media-layer--has-caption': useCaptionLayout,
    }"
    :data-paragraph-index="paragraphIndex"
    :aria-hidden="gsapControlled ? false : !active"
  >
    <div class="story-scroll-reveal__media-bundle">
      <div class="story-scroll-reveal__media-image-slot">
        <StoryLinkSchedaMedia :link-scheda="paragraph.LinkScheda">
          <img
            v-if="displayUrl"
            ref="imageEl"
            class="story-scroll-reveal__image"
            :src="displayUrl"
            :alt="imageAlt"
            loading="lazy"
            decoding="async"
            @load="onImageLoad"
          >
        </StoryLinkSchedaMedia>
      </div>
      <figcaption
        v-if="captionHtml && (gsapControlled || active)"
        ref="captionEl"
        class="story-scroll-reveal__caption story-caption"
        v-html="captionHtml"
      />
    </div>
  </figure>
</template>

<script setup lang="ts">
import type { TStoryScrollRevealParagraphType } from '#shared/types/api'
import { computed, ref } from 'vue'
import StoryLinkSchedaMedia from '~/components/Narratives/StoryLinkSchedaMedia.vue'
import { useScrollRevealMediaCaptionLayout } from '~/composables/useScrollRevealMediaCaptionLayout'
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

const layerEl = ref<HTMLElement | null>(null)
const captionEl = ref<HTMLElement | null>(null)
const imageEl = ref<HTMLImageElement | null>(null)

const { displayUrl, pending, captionHtml, captionAlt, hasSource } = useStorySectionImage(
  () => props.paragraph.Image,
  () => `${props.sectionKey}-p-${props.paragraphIndex}`,
)

const showLayer = computed(
  () => hasSource.value && (displayUrl.value || !pending.value),
)

const imageAlt = computed(() => captionAlt.value)

const useCaptionLayout = computed(
  () => props.gsapControlled && Boolean(captionHtml.value),
)

const { syncLayout } = useScrollRevealMediaCaptionLayout({
  enabled: useCaptionLayout,
  layerEl,
  captionEl,
  imageEl,
})

function onImageLoad() {
  syncLayout()
}
</script>
