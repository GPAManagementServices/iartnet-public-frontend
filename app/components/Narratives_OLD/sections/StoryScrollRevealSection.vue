<template>
  <section
    v-if="visibleParagraphs.length"
    ref="sectionRoot"
    class="story-section story-section--scroll-reveal"
    :class="{
      'story-scroll-reveal--animated': canAnimate,
      'story-scroll-reveal--slide-media': canAnimate,
    }"
  >
    <template v-if="canAnimate">
      <div
        ref="layoutRef"
        class="story-scroll-reveal__layout"
      >
        <div class="story-scroll-reveal__text-viewport">
          <div class="story-scroll-reveal__text-stream">
            <article
              v-for="(paragraph, index) in visibleParagraphs"
              :key="`${sectionKey}-step-${index}`"
              class="story-scroll-reveal__step-text"
              :data-paragraph-index="index"
            >
              <div
                v-if="paragraphTextHtml(paragraph)"
                class="story-scroll-reveal__text-block"
              >
                <div
                  class="story-scroll-reveal__prose story-prose"
                  v-html="paragraphTextHtml(paragraph)"
                />
              </div>
            </article>
          </div>
        </div>

        <aside class="story-scroll-reveal__media-column">
          <div class="story-scroll-reveal__media-stack">
            <StoryScrollRevealMediaLayer
              v-for="(paragraph, index) in visibleParagraphs"
              :key="`${sectionKey}-media-${index}`"
              :paragraph="paragraph"
              :paragraph-index="index"
              :section-key="sectionKey"
              gsap-controlled
              :active="activeIndex === index"
            />
          </div>
        </aside>
      </div>
    </template>

    <template v-else>
      <StoryScrollRevealParagraph
        v-for="(paragraph, index) in visibleParagraphs"
        :key="`${sectionKey}-p-${index}`"
        :paragraph="paragraph"
        :paragraph-index="index"
        :section-key="sectionKey"
        image-side="right"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import type { TStoryScrollRevealParagraphType, TStoryScrollRevealType } from '#shared/types/api'
import { storyHtmlContent } from '#shared/utils/storyText'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import StoryScrollRevealMediaLayer from '~/components/Narratives_OLD/sections/StoryScrollRevealMediaLayer.vue'
import StoryScrollRevealParagraph from '~/components/Narratives_OLD/sections/StoryScrollRevealParagraph.vue'
import { useStoryScrollRevealScroll } from '~/composables/useStoryScrollRevealScroll'

const props = defineProps<TStoryScrollRevealType & { sectionKey: string }>()

const sectionRoot = ref<HTMLElement | null>(null)
const layoutRef = ref<HTMLElement | null>(null)
const canAnimate = ref(false)

function isParagraphRenderable(paragraph: TStoryScrollRevealParagraphType): boolean {
  if (storyHtmlContent(paragraph.Text) != null)
    return true

  const url = paragraph.Image?.URL
  return typeof url === 'string' && url.trim().length > 0
}

const visibleParagraphs = computed(() =>
  (props.Paragraphs ?? []).filter(isParagraphRenderable),
)

const stepCount = computed(() => visibleParagraphs.value.length)

function paragraphTextHtml(paragraph: TStoryScrollRevealParagraphType): string | null {
  return storyHtmlContent(paragraph.Text)
}

function updateCanAnimate() {
  if (!import.meta.client) {
    canAnimate.value = false
    return
  }

  canAnimate.value = stepCount.value > 1
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    && !window.matchMedia('(max-width: 767px)').matches
}

onMounted(() => {
  updateCanAnimate()
  window.addEventListener('resize', updateCanAnimate)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCanAnimate)
})

watch(stepCount, updateCanAnimate)

if (import.meta.client)
  updateCanAnimate()

const { activeIndex } = useStoryScrollRevealScroll(canAnimate, sectionRoot, layoutRef, stepCount, {
  mediaTransition: 'fade',
})
</script>

<style scoped>
.story-section--scroll-reveal {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  min-height: auto;
  margin-block: 0;
  padding-block: 0;
  background-color: var(--story-color-background);
}

/* —— Animated desktop —— */
@media (min-width: 768px) {
  .story-scroll-reveal--animated .story-scroll-reveal__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 5vw;
    box-sizing: border-box;
    width: 1440px;
    max-width: 100%;
    height: var(--story-scroll-reveal-sticky-height);
    margin-inline: auto;
    padding-inline: 5vw;
    padding-block: var(--story-scroll-reveal-padding-block);
    background-color: inherit;
  }

  .story-scroll-reveal--animated .story-scroll-reveal__text-viewport {
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }

  .story-scroll-reveal--animated .story-scroll-reveal__text-stream {
    display: flex;
    flex-direction: column;
    gap: var(--story-scroll-reveal-paragraph-gap);
    box-sizing: border-box;
    width: 100%;
    will-change: transform;
  }

  .story-scroll-reveal--animated .story-scroll-reveal__step-text {
    box-sizing: border-box;
    width: 100%;
    min-height: calc(
      var(--story-scroll-reveal-content-height) * (1 - var(--story-scroll-reveal-text-start-ratio))
    );
    padding-block: var(--story-scroll-reveal-text-padding-block);
  }

  .story-scroll-reveal--animated .story-scroll-reveal__prose :deep(p + p) {
    margin-block-start: 0.2em;
  }

  .story-scroll-reveal--animated .story-scroll-reveal__text-block {
    width: 100%;
  }

  .story-scroll-reveal--animated .story-scroll-reveal__media-column {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: visible;
  }

  .story-scroll-reveal--animated .story-scroll-reveal__media-stack {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: visible;
  }

  .story-scroll-reveal--slide-media .story-scroll-reveal__media-stack {
    overflow: hidden;
  }

  .story-scroll-reveal--animated :deep(.story-scroll-reveal__media-layer--gsap) {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    box-sizing: border-box;
    min-height: 0;
    margin: 0;
    overflow: visible;
    opacity: 0;
    pointer-events: none;
  }

  .story-scroll-reveal--slide-media :deep(.story-scroll-reveal__media-layer--gsap) {
    opacity: 1;
    will-change: transform;
  }

  .story-scroll-reveal--animated
    :deep(.story-scroll-reveal__media-layer--gsap.story-scroll-reveal__media-layer--active) {
    pointer-events: auto;
  }

  .story-scroll-reveal--animated
    :deep(.story-scroll-reveal__media-layer--gsap:not(.story-scroll-reveal__media-layer--active) *) {
    pointer-events: none;
  }

  .story-scroll-reveal--animated :deep(.story-scroll-reveal__media-image-slot) {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    container-type: size;
  }

  .story-scroll-reveal--animated
    :deep(.story-scroll-reveal__media-image-slot .story-link-scheda-media) {
    display: inline-block;
    position: relative;
    max-width: 100%;
    line-height: 0;
    vertical-align: top;
  }

  .story-scroll-reveal--animated
    :deep(.story-scroll-reveal__media-image-slot .story-scroll-reveal__image) {
    display: block;
    width: auto;
    max-width: 100cqw;
    height: auto;
    max-height: 100cqh;
    object-fit: contain;
    object-position: center;
  }

  .story-scroll-reveal--animated :deep(.story-scroll-reveal__caption) {
    flex: 0 0 auto;
    box-sizing: border-box;
    width: 100%;
    max-width: var(--story-caption-max-width);
    margin-top: 0.5rem;
    text-align: center;
  }
}
</style>
