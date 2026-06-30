<template>
  <div ref="stackRoot" class="story-fullscreen-stack">
    <div
      v-for="(section, layerIndex) in sections"
      :key="indices[layerIndex]"
      class="story-fullscreen-stack__layer"
      :style="{ zIndex: sections.length - layerIndex }"
    >
      <StorySectionRenderer
        :section="section"
        :index="indices[layerIndex]!"
        :narrative-slug="narrativeSlug"
        in-fullscreen-stack
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TStorySection } from '#shared/types/api'
import { computed, ref } from 'vue'
import StorySectionRenderer from '~/components/Narratives_OLD/StorySectionRenderer.vue'
import { useStoryFullscreenStackScroll } from '~/composables/useStoryFullscreenStackScroll'

const props = defineProps<{
  sections: TStorySection[]
  indices: number[]
  narrativeSlug: string
}>()

const stackRoot = ref<HTMLElement | null>(null)
const layerCount = computed(() => props.sections.length)
const pinSpacingAfter = computed(() => true)

useStoryFullscreenStackScroll(stackRoot, layerCount, pinSpacingAfter)
</script>

<style scoped>
/* —— Mobile: stack naturale, niente layer assoluti a 100vh —— */
@media (max-width: 767px) {
  .story-fullscreen-stack {
    position: relative;
    height: auto !important;
    isolation: auto;
  }

  .story-fullscreen-stack__layer {
    position: relative !important;
    inset: auto !important;
    width: 100%;
    height: auto !important;
    overflow: visible;
    will-change: auto;
  }
}
</style>
