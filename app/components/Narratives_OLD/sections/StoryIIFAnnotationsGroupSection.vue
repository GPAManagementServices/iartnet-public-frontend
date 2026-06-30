<template>
  <section
    v-if="hasSource && ready"
    class="story-section story-section--bleed story-section--iif-annotations"
    :style="sectionStyle"
  >
    <figure class="story-fs-figure">
      <div class="story-fs-media">
        <div
          ref="viewerWrapRef"
          class="story-iif-osd-viewer-wrap"
          :class="{ 'story-iif-osd-viewer-wrap--explore': exploreActive }"
          :style="viewerWrapStyle"
        >
          <ClientOnly>
            <StoryIIFAnnotationsOsdViewer
              v-if="ready"
              v-model:explore-active="exploreActive"
              :tile-source="tileSource"
              :image-width="imageWidth!"
              :image-height="imageHeight!"
              :annotation="zoomAnnotation"
              :show-annotation-overlay="showAnnotationOverlay"
            />
          </ClientOnly>
          <button
            type="button"
            class="story-iif-explore-btn"
            :aria-label="exploreActive ? 'Chiudi esplorazione' : 'Esplora immagine'"
            :aria-pressed="exploreActive"
            @click="toggleExplore"
          >
            <img
              :src="exploreActive ? closeAnnotationsIcon : exploreImageIcon"
              alt=""
              width="36"
              height="36"
              class="story-iif-explore-btn__icon"
              aria-hidden="true"
            >
          </button>
        </div>
        <div
          v-if="showCaptionLayer && captionLayerOpen"
          class="story-iif-caption-layer story-iif-caption-layer--with-toolbar"
        >
          <div class="story-iif-caption-layer__body">
            <template v-if="isCaptionSlide">
              <div
                v-if="captionHtml"
                class="story-iif-caption-layer__caption"
                v-html="captionHtml"
              />
            </template>
            <template v-else>
              <div
                v-if="annotationHtml"
                class="story-iif-caption-layer__text"
                v-html="annotationHtml"
              />
            </template>
          </div>
          <div class="story-iif-caption-layer__nav">
            <button
              type="button"
              class="story-iif-caption-layer__nav-btn"
              aria-label="Chiudi annotazioni"
              @click="closeCaptionLayer"
            >
              <img
                :src="closeAnnotationsIcon"
                alt=""
                width="36"
                height="36"
                class="story-iif-caption-layer__nav-icon"
                aria-hidden="true"
              >
            </button>
            <div
              v-if="showNav"
              class="story-iif-caption-layer__nav-group"
            >
              <button
                type="button"
                class="story-iif-caption-layer__nav-btn"
                aria-label="Annotazione precedente"
                @click="goPrev"
              >
                <img
                  :src="goToPrevAnnotationIcon"
                  alt=""
                  width="36"
                  height="36"
                  class="story-iif-caption-layer__nav-icon"
                  aria-hidden="true"
                >
              </button>
              <button
                type="button"
                class="story-iif-caption-layer__nav-btn"
                aria-label="Annotazione successiva"
                @click="goNext"
              >
                <img
                  :src="goToNextAnnotationIcon"
                  alt=""
                  width="36"
                  height="36"
                  class="story-iif-caption-layer__nav-icon"
                  aria-hidden="true"
                >
              </button>
            </div>
          </div>
        </div>
        <button
          v-if="showCaptionLayer && !captionLayerOpen"
          type="button"
          class="story-iif-annotation-side-btn story-iif-annotation-side-btn--open"
          aria-label="Apri annotazioni"
          @click="openCaptionLayer"
        >
          <img
            :src="openAnnotationsIcon"
            alt=""
            width="40"
            height="40"
            class="story-iif-annotation-side-btn__icon story-iif-annotation-side-btn__icon--open"
            aria-hidden="true"
          >
        </button>
      </div>
    </figure>
  </section>
</template>

<script setup lang="ts">
import type { TStoryIIFAnnotationsGroupType } from '#shared/types/api'
import { fetchIiifImageDimensions, iiifInfoJsonUrl, isValidIiifAnnotationRect } from '#shared/utils/iiif'
import { requestStoryScrollLayoutRefresh } from '#shared/utils/storyPanelScroll'
import { storyHtmlContent } from '#shared/utils/storyText'
import { onClickOutside } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'
import closeAnnotationsIcon from '~/assets/icons/close-annotations.svg'
import exploreImageIcon from '~/assets/icons/eye.svg'
import goToNextAnnotationIcon from '~/assets/icons/go-to-next-annotation.svg'
import goToPrevAnnotationIcon from '~/assets/icons/go-to-prev-annotation.svg'
import openAnnotationsIcon from '~/assets/icons/open-annotations.svg'
import StoryIIFAnnotationsOsdViewer from '~/components/Narratives_OLD/sections/StoryIIFAnnotationsOsdViewer.vue'
import { useStorySectionLegacyImageBackground } from '~/composables/useStorySectionBackground'

const props = defineProps<TStoryIIFAnnotationsGroupType & { sectionKey: string }>()

const pending = ref(false)
const imageWidth = ref<number | null>(props.Image.Width)
const imageHeight = ref<number | null>(props.Image.Height)
const activeSlideIndex = ref(0)
const captionLayerOpen = ref(true)
const exploreActive = ref(false)
const viewerWrapRef = ref<HTMLElement | null>(null)

const baseUri = computed(() => {
  const uri = props.Image.BaseURI
  if (typeof uri !== 'string')
    return null
  const trimmed = uri.trim()
  return trimmed || null
})

const hasSource = computed(() => !!baseUri.value)

const tileSource = computed(() =>
  baseUri.value ? iiifInfoJsonUrl(baseUri.value) : '',
)

const ready = computed(() =>
  !!baseUri.value
  && imageWidth.value != null
  && imageHeight.value != null
  && imageWidth.value > 0
  && imageHeight.value > 0,
)

const annotations = computed(() => props.Annotations ?? [])

const caption = computed(() => {
  const c = props.Caption
  if (typeof c !== 'string')
    return null
  const trimmed = c.trim()
  return trimmed || null
})

const bgColor = computed(() => {
  const c = props.Image.bgColor
  if (typeof c !== 'string')
    return null
  const trimmed = c.trim()
  return trimmed || null
})

const { style: sectionStyle } = useStorySectionLegacyImageBackground(
  () => props.bgColor,
  () => props.bgImage,
  () => bgColor.value,
)

const viewerWrapStyle = computed(() => {
  const w = imageWidth.value
  const h = imageHeight.value
  if (w == null || h == null || w <= 0 || h <= 0)
    return undefined

  return { '--iif-viewer-aspect-ratio': `${w} / ${h}` } as Record<string, string>
})

const hasCaptionSlide = computed(() => !!caption.value)

const slideCount = computed(() =>
  (hasCaptionSlide.value ? 1 : 0) + annotations.value.length,
)

const isCaptionSlide = computed(() =>
  hasCaptionSlide.value && activeSlideIndex.value === 0,
)

const currentAnnotationIndex = computed(() => {
  if (isCaptionSlide.value)
    return -1
  return hasCaptionSlide.value
    ? activeSlideIndex.value - 1
    : activeSlideIndex.value
})

const currentAnnotation = computed(() => {
  const index = currentAnnotationIndex.value
  if (index < 0)
    return null
  return annotations.value[index] ?? null
})

/** Slide caption o annotazione senza area: immagine intera; altrimenti zoom su Rect. */
const zoomAnnotation = computed(() => {
  if (isCaptionSlide.value)
    return null

  const annotation = currentAnnotation.value
  if (!annotation || !isValidIiifAnnotationRect(annotation.Rect))
    return null

  return annotation
})

const showAnnotationOverlay = computed(() => {
  if (isCaptionSlide.value)
    return false

  const annotation = currentAnnotation.value
  return !!annotation && isValidIiifAnnotationRect(annotation.Rect)
})

const captionHtml = computed(() => storyHtmlContent(props.Caption))

const annotationHtml = computed(() =>
  storyHtmlContent(currentAnnotation.value?.Text ?? null),
)

const showCaptionLayer = computed(() => slideCount.value > 0)

const showNav = computed(() => slideCount.value > 1)

function goPrev() {
  if (slideCount.value <= 1)
    return

  exploreActive.value = false
  activeSlideIndex.value =
    (activeSlideIndex.value - 1 + slideCount.value) % slideCount.value
}

function goNext() {
  if (slideCount.value <= 1)
    return

  exploreActive.value = false
  activeSlideIndex.value =
    (activeSlideIndex.value + 1) % slideCount.value
}

function toggleExplore() {
  exploreActive.value = !exploreActive.value
}

function closeExplore() {
  exploreActive.value = false
}

onClickOutside(viewerWrapRef, () => {
  if (exploreActive.value)
    closeExplore()
})

function closeCaptionLayer() {
  captionLayerOpen.value = false
  void nextTick(() => requestStoryScrollLayoutRefresh())
}

function openCaptionLayer() {
  captionLayerOpen.value = true
  void nextTick(() => requestStoryScrollLayoutRefresh())
}

async function resolveImageDimensions() {
  if (!baseUri.value)
    return

  if (imageWidth.value != null && imageHeight.value != null)
    return

  pending.value = true
  try {
    const dims = await fetchIiifImageDimensions(baseUri.value)
    imageWidth.value = dims.width
    imageHeight.value = dims.height
  }
  catch (err) {
    console.error('[StoryIIFAnnotationsGroupSection] IIIF dimensions', err)
  }
  finally {
    pending.value = false
  }
}

watch(baseUri, () => {
  imageWidth.value = props.Image.Width
  imageHeight.value = props.Image.Height
  activeSlideIndex.value = 0
  captionLayerOpen.value = true
  exploreActive.value = false
  resolveImageDimensions()
}, { immediate: true })

watch([annotations, caption], () => {
  if (activeSlideIndex.value >= slideCount.value)
    activeSlideIndex.value = Math.max(0, slideCount.value - 1)
})

watch(ready, (isReady) => {
  if (!isReady)
    return
  void nextTick(() => requestStoryScrollLayoutRefresh())
})
</script>

<style scoped>
.story-iif-caption-layer {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 619px;
  height: auto;
  max-height: var(--story-iif-caption-max-height);
  padding: 16px;
  opacity: 1;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 4px;
  overflow: hidden;
  font-weight: 400;
  font-style: normal;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0;
  overflow-wrap: break-word;
}

.story-iif-caption-layer--with-toolbar {
  padding-bottom: 0;
}

.story-iif-caption-layer__caption,
.story-iif-caption-layer__text {
  font-weight: 400;
  font-style: normal;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0;
}

.story-iif-caption-layer__caption :deep(p),
.story-iif-caption-layer__caption :deep(li),
.story-iif-caption-layer__caption :deep(span),
.story-iif-caption-layer__caption :deep(div),
.story-iif-caption-layer__caption :deep(a),
.story-iif-caption-layer__text :deep(p),
.story-iif-caption-layer__text :deep(li),
.story-iif-caption-layer__text :deep(span),
.story-iif-caption-layer__text :deep(div),
.story-iif-caption-layer__text :deep(a),
.story-iif-caption-layer__caption :deep(blockquote),
.story-iif-caption-layer__text :deep(blockquote),
.story-iif-caption-layer__caption :deep(h1),
.story-iif-caption-layer__caption :deep(h2),
.story-iif-caption-layer__caption :deep(h3),
.story-iif-caption-layer__caption :deep(h4),
.story-iif-caption-layer__caption :deep(h5),
.story-iif-caption-layer__caption :deep(h6),
.story-iif-caption-layer__text :deep(h1),
.story-iif-caption-layer__text :deep(h2),
.story-iif-caption-layer__text :deep(h3),
.story-iif-caption-layer__text :deep(h4),
.story-iif-caption-layer__text :deep(h5),
.story-iif-caption-layer__text :deep(h6) {
  font: inherit;
  color: inherit;
  letter-spacing: inherit;
}

.story-iif-caption-layer__caption :deep(a),
.story-iif-caption-layer__text :deep(a) {
  text-decoration: underline;
}

.story-iif-caption-layer__caption :deep(img),
.story-iif-caption-layer__text :deep(img) {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: var(--story-iif-caption-image-max-height);
  object-fit: contain;
}

.story-iif-caption-layer__caption :deep(strong),
.story-iif-caption-layer__caption :deep(b),
.story-iif-caption-layer__text :deep(strong),
.story-iif-caption-layer__text :deep(b) {
  font-weight: 700;
}

.story-iif-caption-layer__caption :deep(em),
.story-iif-caption-layer__caption :deep(i),
.story-iif-caption-layer__text :deep(em),
.story-iif-caption-layer__text :deep(i) {
  font-style: italic;
}

.story-iif-caption-layer__caption :deep(u),
.story-iif-caption-layer__text :deep(u) {
  text-decoration: underline;
}

.story-iif-caption-layer__caption :deep(s),
.story-iif-caption-layer__caption :deep(del),
.story-iif-caption-layer__text :deep(s),
.story-iif-caption-layer__text :deep(del) {
  text-decoration: line-through;
}

.story-iif-caption-layer__body {
  display: flex;
  flex: 0 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}

.story-iif-caption-layer__caption {
  margin: 0;
}

.story-iif-caption-layer__text {
  margin: 0;
}

.story-iif-caption-layer__caption :deep(p),
.story-iif-caption-layer__text :deep(p) {
  margin: 0 0 0.35rem;
}

.story-iif-caption-layer__caption :deep(p:last-child),
.story-iif-caption-layer__text :deep(p:last-child) {
  margin-bottom: 0;
}

.story-iif-caption-layer__caption :deep(ul),
.story-iif-caption-layer__caption :deep(ol),
.story-iif-caption-layer__text :deep(ul),
.story-iif-caption-layer__text :deep(ol) {
  margin: 0 0 0.35rem;
  padding-left: 1.25rem;
}

.story-iif-caption-layer__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-self: stretch;
  width: 100%;
  gap: 0;
  flex-shrink: 0;
}

.story-iif-caption-layer__nav-group {
  display: flex;
  align-items: center;
  gap: 0;
  margin-left: auto;
}

.story-iif-caption-layer__nav-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  line-height: 0;
}

.story-iif-caption-layer__nav-icon {
  display: block;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.story-iif-caption-layer__nav-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.story-iif-annotation-side-btn {
  position: absolute;
  z-index: 3;
  left: 16px;
  bottom: 0;
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  line-height: 0;
  flex-shrink: 0;
}

.story-iif-annotation-side-btn__icon {
  display: block;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.story-iif-annotation-side-btn__icon--open {
  width: 40px;
  height: 40px;
}

.story-iif-osd-viewer-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.story-iif-osd-viewer-wrap--explore {
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.65);
}

.story-iif-explore-btn {
  position: absolute;
  z-index: 3;
  top: 16px;
  right: 16px;
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 8px;
  cursor: pointer;
  line-height: 0;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 4px;
}

.story-iif-explore-btn__icon {
  display: block;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.story-iif-osd-viewer-wrap :deep(.story-iif-osd-viewer) {
  width: 100%;
  height: 100%;
}

/* —— Mobile —— */
@media (max-width: 767px) {
  .story-section--iif-annotations {
    height: auto !important;
    min-height: auto !important;
    padding: 48px 16px 24px;
    overflow: visible;
  }

  .story-section--iif-annotations .story-fs-figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: auto;
    margin: 0;
  }

  .story-section--iif-annotations .story-fs-media {
    position: relative;
    display: flex;
    flex-direction: column !important;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: auto !important;
    min-height: 50vh;
    gap: 0;
  }

  .story-section--iif-annotations .story-iif-osd-viewer-wrap {
    width: 100%;
    height: auto;
    min-height: 50vh;
    max-height: 70vh;
    aspect-ratio: var(--iif-viewer-aspect-ratio, 4 / 3);
  }

  .story-section--iif-annotations .story-iif-osd-viewer-wrap :deep(.story-iif-osd-viewer) {
    width: 100%;
    height: 100%;
    min-height: 100%;
  }

  .story-section--iif-annotations .story-iif-caption-layer {
    position: relative !important;
    z-index: 2;
    width: 100% !important;
    max-width: 619px !important;
    height: auto;
    max-height: var(--story-iif-caption-max-height);
    margin: 16px 0 0;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    bottom: auto !important;
  }

  .story-section--iif-annotations .story-iif-annotation-side-btn {
    position: relative;
    left: auto;
    bottom: auto;
    align-self: flex-start;
    width: 100%;
    max-width: 619px;
    margin: 16px 0 0;
    justify-content: flex-start;
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
  .story-section--iif-annotations {
    height: var(--story-section-min-height);
    min-height: var(--story-section-min-height);
    padding: 0;
    overflow: hidden;
  }

  .story-section--iif-annotations .story-fs-figure {
    width: 100%;
    height: 100%;
    margin: 0;
  }

  .story-section--iif-annotations .story-fs-media {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .story-section--iif-annotations .story-iif-osd-viewer-wrap {
    width: 100%;
    height: 100%;
  }

  .story-section--iif-annotations .story-iif-caption-layer {
    position: absolute;
    z-index: 2;
    width: 619px;
    height: auto;
    left: 16px;
    bottom: 16px;
  }

  .story-section--iif-annotations .story-iif-annotation-side-btn {
    left: 16px;
    bottom: 16px;
  }
}
</style>

<!-- Unscoped: override global story-sections.css fullscreen-stack rules on mobile -->
<style>
@media (max-width: 767px) {
  .story-fullscreen-stack__layer .story-section--iif-annotations,
  .story-section-renderer.story-panel-opaque .story-section--iif-annotations,
  .story-section.story-section--iif-annotations {
    height: auto !important;
    min-height: auto !important;
  }

  .story-fullscreen-stack__layer .story-section--iif-annotations .story-fs-media {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    height: auto !important;
  }

  .story-fullscreen-stack__layer .story-iif-osd-viewer-wrap,
  .story-section--iif-annotations .story-iif-osd-viewer-wrap {
    width: 100% !important;
    height: auto !important;
    min-height: 50vh !important;
    max-height: 70vh !important;
    aspect-ratio: var(--iif-viewer-aspect-ratio, 4 / 3) !important;
  }

  .story-fullscreen-stack__layer .story-iif-osd-viewer-wrap .story-iif-osd-viewer,
  .story-section--iif-annotations .story-iif-osd-viewer-wrap .story-iif-osd-viewer {
    width: 100% !important;
    height: 100% !important;
    min-height: 100% !important;
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer,
  .story-iif-caption-layer {
    position: relative !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    bottom: auto !important;
    width: 100% !important;
    max-width: 619px !important;
  }

  .story-fullscreen-stack__layer .story-iif-annotation-side-btn,
  .story-section--iif-annotations .story-iif-annotation-side-btn {
    align-self: flex-start !important;
    justify-content: flex-start !important;
  }
}
</style>
