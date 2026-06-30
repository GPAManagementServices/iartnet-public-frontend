import type { Ref } from 'vue'
import { useStoryMediaCaptionLayout } from '~/composables/useStoryMediaCaptionLayout'

const LAYER_MAX_HEIGHT_VAR = '--story-scroll-reveal-media-max-height'
const CAPTION_WIDTH_VAR = '--story-scroll-reveal-caption-width'

/**
 * Mode C: reserve caption space in the sticky ScrollReveal media layer via measured CSS vars.
 */
export function useScrollRevealMediaCaptionLayout(options: {
  enabled: Ref<boolean>
  layerEl: Ref<HTMLElement | null>
  captionEl: Ref<HTMLElement | null>
  imageEl: Ref<HTMLImageElement | null>
}) {
  return useStoryMediaCaptionLayout({
    enabled: options.enabled,
    layerEl: options.layerEl,
    captionEl: options.captionEl,
    mediaEl: options.imageEl as Ref<HTMLElement | null>,
    mediaMaxHeightVar: LAYER_MAX_HEIGHT_VAR,
    captionWidthVar: CAPTION_WIDTH_VAR,
  })
}
