<template>
  <div
    v-if="kind && sectionComponent"
    class="story-section-renderer panel"
    :class="{
      'story-section-renderer--natural-height': hasNaturalHeight,
      'story-section-renderer--in-fullscreen-stack': inFullscreenStack,
      'story-section-renderer--split-content': kind === 'SplitContent',
      'story-section-renderer--inline-image': kind === 'InlineImage',
      'story-section-renderer--split-image': kind === 'SplitImage',
      'story-section-renderer--image-full-screen': kind === 'ImageFullScreen',
      'story-section-renderer--iif-annotations': kind === 'IIFAnnotationsGroup',
      'story-panel-opaque': hasOpaquePanel,
      'story-section-renderer--section-bg': hasCustomBackground,
      'story-section-renderer--section-fore-color': hasSectionForeColor,
    }"
    :data-section-kind="kind"
    :style="mergedPanelStyle"
  >
    <div
      v-if="bgImageUrl"
      class="story-section-renderer__bg-image"
      :style="{ backgroundImage: `url(${bgImageUrl})` }"
      aria-hidden="true"
    />
    <div
      v-if="showSectionDebug"
      class="story-section-debug"
      :title="debugTitle"
    >
      <span class="story-section-debug__kind">{{ kindLabel }}</span>
      <span class="story-section-debug__component">{{ componentName }}</span>
      <span class="story-section-debug__index">#{{ index }}</span>
    </div>
    <component
      :is="sectionComponent"
      v-bind="sectionProps"
    />
  </div>
  <div
    v-else-if="showSectionDebug"
    class="story-section-debug story-section-debug--unknown"
  >
    Unknown · #{{ index }}
  </div>
</template>

<script setup lang="ts">
import type { SectionKind, TStorySection } from '#shared/types/api'
import type { Component } from 'vue'
import { STORY_SECTION_CLASS, STORY_SECTION_KIND_LABEL } from '#shared/constants/storySectionStyles'
import { STORY_SECTION_DEBUG_ENABLED } from '#shared/constants/storySectionDebug'
import { getStorySectionKind } from '#shared/utils/storySectionKind'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStorySectionBackground, useStorySectionFontColor } from '~/composables/useStorySectionBackground'
import StoryIIFAnnotationsGroupSection from '~/components/Narratives_OLD/sections/StoryIIFAnnotationsGroupSection.vue'
import StoryImageFullScreenSection from '~/components/Narratives_OLD/sections/StoryImageFullScreenSection.vue'
import StoryInlineImageSection from '~/components/Narratives_OLD/sections/StoryInlineImageSection.vue'
import StoryInlineTextSection from '~/components/Narratives_OLD/sections/StoryInlineTextSection.vue'
import StoryScrollRevealSection from '~/components/Narratives_OLD/sections/StoryScrollRevealSection.vue'
import StorySplitContentSection from '~/components/Narratives_OLD/sections/StorySplitContentSection.vue'
import StorySplitImageSection from '~/components/Narratives_OLD/sections/StorySplitImageSection.vue'
import StoryTextIntroSection from '~/components/Narratives_OLD/sections/StoryTextIntroSection.vue'

const props = defineProps<{
  section: TStorySection
  index: number
  narrativeSlug: string
  /** Layer in a GAC-style fullscreen stack (scroll driven by parent). */
  inFullscreenStack?: boolean
}>()

const kind = computed(() => getStorySectionKind(props.section))

const sectionKey = computed(() =>
  `narrative-section-${props.narrativeSlug}-${props.index}`,
)

const {
  bgImageUrl,
  hasCustomBackground,
  panelStyle: sectionBackgroundStyle,
} = useStorySectionBackground(
  () => props.section.bgColor,
  () => props.section.bgImage,
  () => `${sectionKey.value}-section-bg`,
)

const { textStyle: sectionFontColorStyle, trimmedForeColor } = useStorySectionFontColor(
  () => props.section,
)

const hasSectionForeColor = computed(() => !!trimmedForeColor.value)

const COMPONENTS: Record<SectionKind, Component> = {
  TextIntro: StoryTextIntroSection,
  InlineText: StoryInlineTextSection,
  SplitContent: StorySplitContentSection,
  SplitImage: StorySplitImageSection,
  ScrollReveal: StoryScrollRevealSection,
  InlineImage: StoryInlineImageSection,
  ImageFullScreen: StoryImageFullScreenSection,
  IIFAnnotationsGroup: StoryIIFAnnotationsGroupSection,
}

const COMPONENT_NAMES: Record<SectionKind, string> = {
  TextIntro: 'StoryTextIntroSection',
  InlineText: 'StoryInlineTextSection',
  SplitContent: 'StorySplitContentSection',
  SplitImage: 'StorySplitImageSection',
  ScrollReveal: 'StoryScrollRevealSection',
  InlineImage: 'StoryInlineImageSection',
  ImageFullScreen: 'StoryImageFullScreenSection',
  IIFAnnotationsGroup: 'StoryIIFAnnotationsGroupSection',
}

const route = useRoute()

const showSectionDebug = computed(() =>
  STORY_SECTION_DEBUG_ENABLED
  && (import.meta.dev || route.query.storySectionsDebug === '1'),
)


const componentName = computed(() => {
  const k = kind.value
  return k ? COMPONENT_NAMES[k] : '—'
})

const kindLabel = computed(() => {
  const k = kind.value
  return k ? STORY_SECTION_KIND_LABEL[k] : 'Unknown'
})

const sectionCssClass = computed(() => {
  const k = kind.value
  return k ? STORY_SECTION_CLASS[k] : null
})

const debugTitle = computed(() =>
  `Label: ${kindLabel.value}\nKind: ${kind.value ?? '—'}\nCSS: .${sectionCssClass.value ?? '—'}\nComponent: ${componentName.value}\nIndex: ${props.index}`,
)

const sectionComponent = computed(() => {
  const k = kind.value
  return k ? COMPONENTS[k] : null
})

const IMAGE_SECTION_KINDS = new Set<SectionKind>([
  'SplitImage',
  'ScrollReveal',
  'InlineImage',
  'ImageFullScreen',
  'IIFAnnotationsGroup',
])

const NATURAL_HEIGHT_KINDS = new Set<SectionKind>([
  'SplitContent',
  'InlineText',
  'InlineImage',
  'ScrollReveal',
])

const OPAQUE_PANEL_KINDS = new Set<SectionKind>([
  'TextIntro',
  'InlineText',
  'InlineImage',
  'SplitContent',
  'SplitImage',
  'ScrollReveal',
])

const hasNaturalHeight = computed(() =>
  !!kind.value && NATURAL_HEIGHT_KINDS.has(kind.value),
)

const hasOpaquePanel = computed(() =>
  !!kind.value && OPAQUE_PANEL_KINDS.has(kind.value),
)

const mergedPanelStyle = computed(() => {
  const style: Record<string, string> = {}

  if (hasOpaquePanel.value)
    style['--panel-z-index'] = String(props.index + 1)

  const bgStyle = sectionBackgroundStyle.value
  if (bgStyle) {
    for (const [key, value] of Object.entries(bgStyle))
      style[key] = value
  }

  const fontStyle = sectionFontColorStyle.value
  if (fontStyle) {
    for (const [key, value] of Object.entries(fontStyle))
      style[key] = value
  }

  return Object.keys(style).length ? style : undefined
})

const sectionProps = computed(() => {
  const k = kind.value
  const section = props.section
  if (k && IMAGE_SECTION_KINDS.has(k)) {
    return {
      ...section,
      sectionKey: sectionKey.value,
    }
  }
  return section
})
</script>

<style scoped>
/* —— Mobile —— */
@media (max-width: 767px) {
  .story-section-renderer {
    position: relative;
    min-height: auto;
  }

  .story-section-renderer--natural-height {
    min-height: auto;
  }

  .story-section-renderer--in-fullscreen-stack {
    min-height: auto !important;
    height: auto !important;
  }

  .story-section-renderer--split-image,
  .story-section-renderer--split-image :deep(.story-section--split-image),
  .story-section-renderer--image-full-screen,
  .story-section-renderer--image-full-screen :deep(.story-section--image-full-screen),
  .story-section-renderer--iif-annotations,
  .story-section-renderer--iif-annotations :deep(.story-section--iif-annotations) {
    min-height: auto !important;
    height: auto !important;
  }

  .story-section-debug {
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.75rem;
    margin: 0 16px 0.5rem;
    padding: 0.35rem 0.65rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.7rem;
    line-height: 1.3;
    color: #f5f5f5;
    background: rgba(120, 40, 160, 0.92);
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    pointer-events: none;
  }

  .story-section-debug--unknown {
    background: rgba(180, 50, 50, 0.92);
  }

  .story-section-debug__kind {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .story-section-debug__component {
    opacity: 0.95;
  }

  .story-section-debug__component::before {
    content: '·';
    margin-right: 0.5rem;
    opacity: 0.7;
  }

  .story-section-debug__index {
    margin-left: auto;
    opacity: 0.85;
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
  .story-section-renderer {
    position: relative;
    min-height: var(--story-section-min-height);
  }

  .story-section-renderer--natural-height {
    min-height: auto;
  }

  .story-section-renderer--in-fullscreen-stack {
    min-height: 0;
    height: 100%;
  }

  .story-section-debug {
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.75rem;
    margin: 0 5vw 0.5rem;
    padding: 0.35rem 0.65rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.75rem;
    line-height: 1.3;
    color: #f5f5f5;
    background: rgba(120, 40, 160, 0.92);
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    pointer-events: none;
  }

  .story-section-debug--unknown {
    background: rgba(180, 50, 50, 0.92);
  }

  .story-section-debug__kind {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .story-section-debug__component {
    opacity: 0.95;
  }

  .story-section-debug__component::before {
    content: '·';
    margin-right: 0.5rem;
    opacity: 0.7;
  }

  .story-section-debug__index {
    margin-left: auto;
    opacity: 0.85;
  }
}
</style>

<!-- Unscoped: mobile ScrollReveal must not paint opaque panels over section bgImage -->
<style>
@media (max-width: 767px) {
  .story-section-renderer--section-bg .story-section--scroll-reveal,
  .story-section-renderer--section-bg .story-scroll-reveal__block {
    background-color: transparent !important;
  }
}
</style>
