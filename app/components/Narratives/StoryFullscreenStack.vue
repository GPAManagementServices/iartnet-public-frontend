<template>
  <div
    :class="{ 'story-stack-pin-host': useCssStackMotion }"
    :style="pinHostStyle"
  >
    <div
      ref="stackRoot"
      class="story-fullscreen-stack"
      :class="{
        'story-fullscreen-stack--static-scroll': useStaticStackLayout,
        'story-fullscreen-stack--css-hold': useCssStackHold,
        'story-fullscreen-stack--css-hold-video': useCssStackHoldVideo,
        'story-fullscreen-stack--css-peel': useCssStackPeel,
        'story-fullscreen-stack--css-peel-video': useCssStackPeelVideo,
        'story-fullscreen-stack--pin-offscreen': pinOffscreen,
      }"
    >
      <div
        v-for="(section, layerIndex) in sections"
        :key="indices[layerIndex]"
        class="story-fullscreen-stack__layer"
        :class="{ 'story-fullscreen-stack__layer--video': isVideoSection(section) }"
        :style="layerZIndexStyle(layerIndex)"
      >
        <StorySectionRenderer
          :section="section"
          :index="indices[layerIndex]!"
          :narrative-slug="narrativeSlug"
          in-fullscreen-stack
          :static-stack-scroll="useStaticStackLayout"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TStorySection } from '#shared/types/api'
import {
  isStoryDevCssMotionStrategyActive,
  isStoryDevGsapScrollEnabled,
} from '#shared/constants/storyDevMotion'
import { getStorySectionKind } from '#shared/utils/storySectionKind'
import { isStorySplitVideoMediaType, readStorySplitMediaType } from '#shared/utils/storySplitMedia'
import { computed, ref } from 'vue'
import StorySectionRenderer from '~/components/Narratives/StorySectionRenderer.vue'
import { useCssStackPeelMotion } from '~/composables/useCssStackPeelMotion'

const props = defineProps<{
  sections: TStorySection[]
  indices: number[]
  narrativeSlug: string
}>()

const stackRoot = ref<HTMLElement | null>(null)

function isVideoSection(section: TStorySection): boolean {
  if (getStorySectionKind(section) !== 'SplitImage')
    return false
  return isStorySplitVideoMediaType(
    readStorySplitMediaType(section as unknown as Record<string, unknown>),
  )
}

const hasVideoLayer = computed(() => props.sections.some(isVideoSection))

const useCssStackHold = computed(() =>
  isStoryDevCssMotionStrategyActive('stack-hold') && props.sections.length === 1,
)

const useCssStackHoldVideo = computed(() => useCssStackHold.value && hasVideoLayer.value)

const useCssStackPeel = computed(() => {
  if (props.sections.length < 2)
    return false
  if (hasVideoLayer.value)
    return isStoryDevCssMotionStrategyActive('stack-peel-video')
  return isStoryDevCssMotionStrategyActive('stack-peel')
})

const useCssStackPeelVideo = computed(() => useCssStackPeel.value && hasVideoLayer.value)

const useLayeredStackLayout = computed(() =>
  isStoryDevGsapScrollEnabled() || useCssStackHold.value || useCssStackPeel.value,
)

const useStaticStackLayout = computed(() => !useLayeredStackLayout.value)

function layerZIndexStyle(layerIndex: number) {
  if (useStaticStackLayout.value)
    return undefined
  // Primo layer in cima (≈ GSAP / produzione: sections.length - layerIndex).
  return { zIndex: stackLayerBaseZIndex.value + props.sections.length - layerIndex }
}

// z-index sul pin-host (sopra sezioni precedenti) durante peel/hold.
const pinHostStyle = computed(() => {
  if (!useCssStackMotion.value)
    return undefined
  return { zIndex: stackLayerBaseZIndex.value }
})

const stackLayerBaseZIndex = computed(() => {
  const sectionIndex = props.indices[0]
  return sectionIndex != null ? sectionIndex + 1 : 1
})

const layerCount = computed(() => props.sections.length)

const useCssStackMotion = computed(() => useCssStackHold.value || useCssStackPeel.value)

const videoLayerIndices = computed(() => {
  const indices = new Set<number>()
  props.sections.forEach((section, layerIndex) => {
    if (isVideoSection(section))
      indices.add(layerIndex)
  })
  return indices
})

const { pinOffscreen } = useCssStackPeelMotion(stackRoot, useCssStackMotion, layerCount, videoLayerIndices)
</script>

<style scoped>
@media (min-width: 768px) {
  .story-fullscreen-stack__layer {
    isolation: isolate;
  }
}

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

<!-- Static scroll (phase 0): stack layers flow vertically on desktop too -->
<style>
@media (min-width: 768px) {
  .story-fullscreen-stack--static-scroll {
    position: relative;
    height: auto !important;
    isolation: auto;
  }

  .story-fullscreen-stack--static-scroll .story-fullscreen-stack__layer {
    position: relative !important;
    inset: auto !important;
    width: 100%;
    height: auto !important;
    overflow: visible;
    will-change: auto;
  }

  .story-fullscreen-stack--static-scroll .story-section--split-image,
  .story-fullscreen-stack--static-scroll .story-section--split-image .story-split-image__inner,
  .story-fullscreen-stack--static-scroll .story-section--image-full-screen {
    height: auto !important;
    min-height: auto !important;
  }
}
</style>
