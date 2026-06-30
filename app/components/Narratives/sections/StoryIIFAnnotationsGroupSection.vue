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
        >
          <ClientOnly>
            <StoryIIFAnnotationsOsdViewer
              v-if="ready"
              v-model:explore-active="exploreActive"
              :align-image-top="isMobileCaption && isCaptionSlide"
              :mobile-viewport-layout="isMobileCaption"
              :tile-source="tileSource"
              :image-width="imageWidth!"
              :image-height="imageHeight!"
              :annotation="zoomAnnotation"
              :show-annotation-overlay="showAnnotationOverlay"
            />
          </ClientOnly>
        </div>
        <div
          v-if="showCaptionPanel"
          class="story-iif-caption-layer story-iif-caption-layer--with-toolbar"
          :class="{ 'story-iif-caption-layer--compact': isCaptionCompact }"
        >
          <div
            ref="captionBodyRef"
            class="story-iif-caption-layer__body"
          >
            <template v-if="isCaptionSlide">
              <div
                v-if="displayCaptionHtml"
                class="story-iif-caption-layer__caption"
                :class="{ 'story-iif-caption-layer__content--compact-title': compactPreviewHasTitle }"
                v-html="displayCaptionHtml"
              />
            </template>
            <template v-else>
              <div
                v-if="displayAnnotationHtml"
                class="story-iif-caption-layer__text"
                :class="{ 'story-iif-caption-layer__content--compact-title': compactPreviewHasTitle }"
                v-html="displayAnnotationHtml"
              />
            </template>
          </div>
          <div class="story-iif-caption-layer__nav">
            <button
              type="button"
              class="story-iif-caption-layer__nav-btn"
              :aria-label="captionToggleAriaLabel"
              :aria-expanded="captionLayerOpen"
              @click="toggleCaptionLayer"
            >
              <img
                :src="captionLayerOpen ? closeAnnotationsIcon : openAnnotationsIconSrc"
                alt=""
                width="40"
                height="40"
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
                :disabled="!canGoPrev"
                :aria-label="$t('Previous annotation')"
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
                :disabled="!canGoNext"
                :aria-label="$t('Next annotation')"
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
          ref="exploreBtnRef"
          type="button"
          class="story-iif-explore-btn"
          :aria-label="exploreActive ? $t('Close exploration') : $t('Explore image')"
          :aria-pressed="exploreActive"
          @click.stop="toggleExplore"
        >
          <img
            :src="exploreActive ? closeExploreImageIcon : openExploreImageIcon"
            alt=""
            class="story-iif-explore-btn__icon"
            aria-hidden="true"
          >
        </button>
        <button
          v-if="showFloatingOpenBtn"
          type="button"
          class="story-iif-annotation-side-btn story-iif-annotation-side-btn--open"
          aria-label="Apri annotazioni"
          @click="openCaptionLayer"
        >
          <img
            :src="openAnnotationsIconSrc"
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
import { storyCaptionCompactPreview, storyCaptionCompactPreviewHasTitle, storyHtmlContent } from '#shared/utils/storyText'
import { onClickOutside, useMediaQuery } from '@vueuse/core'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import closeAnnotationsIcon from '~/assets/icons/close-annotations.svg'
import closeExploreImageIcon from '~/assets/icons/close-explore.svg'
import goToNextAnnotationIcon from '~/assets/icons/go-to-next-annotation.svg'
import goToPrevAnnotationIcon from '~/assets/icons/go-to-prev-annotation.svg'
import openAnnotationsMobileIcon from '~/assets/icons/open-annotations-mobile.svg'
import openAnnotationsIcon from '~/assets/icons/open-annotations.svg'
import openExploreImageIcon from '~/assets/icons/open-explore.svg'
import StoryIIFAnnotationsOsdViewer from '~/components/Narratives/sections/StoryIIFAnnotationsOsdViewer.vue'
import { useStorySectionLegacyImageBackground } from '~/composables/useStorySectionBackground'

const props = defineProps<TStoryIIFAnnotationsGroupType & { sectionKey: string }>()

const pending = ref(false)
const imageWidth = ref<number | null>(props.Image.Width)
const imageHeight = ref<number | null>(props.Image.Height)
const activeSlideIndex = ref(0)
const exploreActive = ref(false)
const viewerWrapRef = ref<HTMLElement | null>(null)
const exploreBtnRef = ref<HTMLElement | null>(null)
const captionBodyRef = ref<HTMLElement | null>(null)

let captionImageResizeObserver: ResizeObserver | null = null
let mobileCaptionMediaQuery: MediaQueryList | null = null

const MOBILE_CAPTION_MQ = '(max-width: 767px)'
const isMobileCaption = useMediaQuery(MOBILE_CAPTION_MQ, { ssrWidth: 375 })

function readMobileViewport(): boolean {
  if (!import.meta.client)
    return true
  return window.matchMedia(MOBILE_CAPTION_MQ).matches
}

/** Mobile: compatto. Desktop: esteso. Valutato in modo sincrono per il primo paint. */
function defaultCaptionExpanded(): boolean {
  return !readMobileViewport()
}

const captionLayerOpen = ref(defaultCaptionExpanded())

function isMobileCaptionLayout(): boolean {
  return isMobileCaption.value
}

function getCaptionBodyBudget(layer: HTMLElement): number {
  const layerStyle = getComputedStyle(layer)
  const paddingBlock = Number.parseFloat(layerStyle.paddingTop) + Number.parseFloat(layerStyle.paddingBottom)
  const nav = layer.querySelector('.story-iif-caption-layer__nav')
  const navHeight = nav instanceof HTMLElement ? nav.offsetHeight : 0

  const maxHeightPx = Number.parseFloat(layerStyle.maxHeight)
  if (Number.isFinite(maxHeightPx) && maxHeightPx > 0)
    return maxHeightPx - navHeight - paddingBlock

  const media = layer.closest('.story-fs-media')
  const stackHeight = media instanceof HTMLElement ? media.clientHeight : 0
  if (stackHeight > 0)
    return stackHeight - 16 - navHeight - paddingBlock

  return 0
}

function measureCaptionTextHeight(body: HTMLElement, images: HTMLImageElement[]): number {
  const savedDisplay = images.map(img => img.style.display)
  images.forEach((img) => {
    img.style.display = 'none'
  })
  const textHeight = body.scrollHeight
  images.forEach((img, index) => {
    img.style.display = savedDisplay[index] || ''
  })
  return textHeight
}

function constrainCaptionImages() {
  if (!isMobileCaptionLayout() || !captionLayerOpen.value)
    return

  const body = captionBodyRef.value
  if (!body?.isConnected)
    return

  const layer = body.closest('.story-iif-caption-layer')
  if (!(layer instanceof HTMLElement))
    return

  const images = [...body.querySelectorAll<HTMLImageElement>('img')]

  images.forEach((img) => {
    img.style.removeProperty('max-height')
    img.style.removeProperty('width')
    img.style.removeProperty('height')
  })

  const bodyBudget = getCaptionBodyBudget(layer)
  if (bodyBudget <= 0)
    return

  if (images.length === 0 || body.scrollHeight <= bodyBudget)
    return

  const textHeight = measureCaptionTextHeight(body, images)
  const contentGap = 8
  let imageBudget = Math.floor((bodyBudget - textHeight - contentGap) / images.length)

  if (!Number.isFinite(imageBudget) || imageBudget < 48)
    imageBudget = 48

  const applyImageBudget = (budget: number) => {
    images.forEach((img) => {
      img.style.maxWidth = '100%'
      img.style.width = 'auto'
      img.style.height = 'auto'
      img.style.objectFit = 'contain'
      img.style.maxHeight = `${budget}px`
    })
  }

  applyImageBudget(imageBudget)

  while (body.scrollHeight > bodyBudget && imageBudget > 48) {
    imageBudget -= 8
    applyImageBudget(imageBudget)
  }
}

function scheduleConstrainCaptionImages() {
  void nextTick(() => {
    constrainCaptionImages()
    requestAnimationFrame(constrainCaptionImages)
  })
}

function setupCaptionImageObserver() {
  captionImageResizeObserver?.disconnect()
  captionImageResizeObserver = null

  const body = captionBodyRef.value
  if (!body?.isConnected || !isMobileCaptionLayout() || !captionLayerOpen.value)
    return

  captionImageResizeObserver = new ResizeObserver(() => constrainCaptionImages())
  captionImageResizeObserver.observe(body)

  const layer = body.closest('.story-iif-caption-layer')
  if (layer instanceof HTMLElement)
    captionImageResizeObserver.observe(layer)

  const media = body.closest('.story-fs-media')
  if (media instanceof HTMLElement)
    captionImageResizeObserver.observe(media)

  body.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
    if (!img.complete)
      img.addEventListener('load', scheduleConstrainCaptionImages, { once: true })
  })
}

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

const isCaptionCompact = computed(() =>
  isMobileCaption.value && showCaptionLayer.value && !captionLayerOpen.value,
)

const compactCaptionHtml = computed(() => storyCaptionCompactPreview(props.Caption))

const compactAnnotationHtml = computed(() =>
  storyCaptionCompactPreview(currentAnnotation.value?.Text ?? null),
)

const displayCaptionHtml = computed(() =>
  isCaptionCompact.value ? compactCaptionHtml.value : captionHtml.value,
)

const displayAnnotationHtml = computed(() =>
  isCaptionCompact.value ? compactAnnotationHtml.value : annotationHtml.value,
)

const compactPreviewHasTitle = computed(() => {
  if (!isCaptionCompact.value)
    return false

  const html = isCaptionSlide.value
    ? compactCaptionHtml.value
    : compactAnnotationHtml.value

  return storyCaptionCompactPreviewHasTitle(html)
})

/** Mobile: layer sempre visibile (compatto o esteso). Desktop: solo se aperto. */
const showCaptionPanel = computed(() =>
  showCaptionLayer.value && (isMobileCaption.value || captionLayerOpen.value),
)

const showFloatingOpenBtn = computed(() =>
  showCaptionLayer.value && !isMobileCaption.value && !captionLayerOpen.value,
)

const openAnnotationsIconSrc = computed(() =>
  isMobileCaption.value ? openAnnotationsMobileIcon : openAnnotationsIcon,
)

const captionToggleAriaLabel = computed(() => {
  if (captionLayerOpen.value)
    return isMobileCaption.value ? 'Comprimi annotazioni' : 'Chiudi annotazioni'
  return 'Apri annotazioni'
})

const showNav = computed(() => slideCount.value > 1)

const canGoPrev = computed(() => activeSlideIndex.value > 0)

const canGoNext = computed(() => activeSlideIndex.value < slideCount.value - 1)

function goPrev() {
  if (!canGoPrev.value)
    return

  exploreActive.value = false
  activeSlideIndex.value -= 1
}

function goNext() {
  if (!canGoNext.value)
    return

  exploreActive.value = false
  activeSlideIndex.value += 1
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
}, { ignore: [exploreBtnRef] })

function closeCaptionLayer() {
  captionLayerOpen.value = false
  captionImageResizeObserver?.disconnect()
  captionImageResizeObserver = null
  void nextTick(() => requestStoryScrollLayoutRefresh())
}

function openCaptionLayer() {
  captionLayerOpen.value = true
  void nextTick(() => {
    requestStoryScrollLayoutRefresh()
    setupCaptionImageObserver()
    scheduleConstrainCaptionImages()
  })
}

function toggleCaptionLayer() {
  if (captionLayerOpen.value)
    closeCaptionLayer()
  else
    openCaptionLayer()
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
  captionLayerOpen.value = defaultCaptionExpanded()
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
  if (readMobileViewport())
    captionLayerOpen.value = false
  void nextTick(() => requestStoryScrollLayoutRefresh())
})

watch(captionBodyRef, () => setupCaptionImageObserver())

watch(
  [activeSlideIndex, captionLayerOpen, captionHtml, annotationHtml],
  scheduleConstrainCaptionImages,
)

watch(captionLayerOpen, (isOpen) => {
  if (isOpen)
    void nextTick(() => setupCaptionImageObserver())
})

watch(isMobileCaption, () => {
  void nextTick(() => requestStoryScrollLayoutRefresh())
})

onMounted(() => {
  if (!import.meta.client)
    return

  captionLayerOpen.value = defaultCaptionExpanded()

  mobileCaptionMediaQuery = window.matchMedia(MOBILE_CAPTION_MQ)
  mobileCaptionMediaQuery.addEventListener('change', scheduleConstrainCaptionImages)
  scheduleConstrainCaptionImages()
})

onBeforeUnmount(() => {
  captionImageResizeObserver?.disconnect()
  mobileCaptionMediaQuery?.removeEventListener('change', scheduleConstrainCaptionImages)
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
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.story-iif-caption-layer__nav-icon {
  display: block;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  transition:
    opacity 0.15s ease,
    filter 0.15s ease;
}

.story-iif-caption-layer__nav-btn:disabled {
  cursor: not-allowed;
}

.story-iif-caption-layer__nav-btn:disabled .story-iif-caption-layer__nav-icon {
  opacity: 0.3 !important;
  filter: brightness(0.5);
}

@media (hover: hover) {
  .story-iif-caption-layer__nav-btn:not(:disabled):hover .story-iif-caption-layer__nav-icon {
    filter: brightness(1.15);
  }
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
  right: 16px;
  bottom: 16px;
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  cursor: pointer;
  line-height: 0;
  background: transparent;
  pointer-events: auto;
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
    padding: 0;
    overflow: visible;
  }

  .story-section--iif-annotations .story-fs-figure {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    height: auto;
    margin: 0;
    overflow: visible;
  }

  .story-section--iif-annotations .story-fs-media {
    position: relative;
    display: grid !important;
    grid-template-areas: 'media-stack';
    align-items: stretch;
    justify-items: stretch;
    width: 100%;
    height: auto !important;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }

  .story-section--iif-annotations .story-iif-osd-viewer-wrap {
    grid-area: media-stack;
    width: 100%;
    max-width: 100%;
    height: var(--story-iif-viewer-mobile-height, 70vh);
    min-height: 0;
    max-height: var(--story-iif-viewer-mobile-height, 70vh);
  }

  .story-section--iif-annotations .story-iif-osd-viewer-wrap :deep(.story-iif-osd-viewer) {
    width: 100%;
    height: 100%;
    min-height: 100%;
  }

  .story-section--iif-annotations .story-iif-caption-layer {
    position: absolute !important;
    z-index: 2;
    left: 0;
    right: 0;
    bottom: 16px;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    height: auto;
    min-height: 0;
    max-height: var(--story-iif-caption-mobile-max-height);
    margin: 0 !important;
    overflow: hidden;
  }

  .story-section--iif-annotations .story-iif-caption-layer__body {
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
    min-width: 0;
    overflow-x: clip;
    overflow-y: auto;
  }

  .story-section--iif-annotations .story-iif-caption-layer__caption,
  .story-section--iif-annotations .story-iif-caption-layer__text {
    display: block;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .story-section--iif-annotations .story-iif-caption-layer__caption :deep(p),
  .story-section--iif-annotations .story-iif-caption-layer__text :deep(p),
  .story-section--iif-annotations .story-iif-caption-layer__caption :deep(figure),
  .story-section--iif-annotations .story-iif-caption-layer__text :deep(figure),
  .story-section--iif-annotations .story-iif-caption-layer__caption :deep(div),
  .story-section--iif-annotations .story-iif-caption-layer__text :deep(div) {
    min-width: 0;
    max-width: 100%;
  }

  .story-section--iif-annotations .story-iif-caption-layer__caption :deep(img),
  .story-section--iif-annotations .story-iif-caption-layer__text :deep(img) {
    display: block;
    width: auto;
    max-width: 100% !important;
    height: auto !important;
    max-height: var(--story-iif-caption-mobile-image-max-height);
    object-fit: contain;
    object-position: left top;
  }

  .story-section--iif-annotations .story-iif-caption-layer__caption :deep(table),
  .story-section--iif-annotations .story-iif-caption-layer__text :deep(table) {
    display: block;
    width: 100%;
    overflow-x: auto;
  }

  .story-section--iif-annotations .story-iif-caption-layer--compact {
    max-height: none;
  }

  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__body {
    flex: 0 0 auto;
    overflow: hidden;
    overflow-y: hidden;
  }

  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__caption,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }

  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }

  .story-section--iif-annotations
    .story-iif-caption-layer--compact
    .story-iif-caption-layer__content--compact-title
    :deep(h1),
  .story-section--iif-annotations
    .story-iif-caption-layer--compact
    .story-iif-caption-layer__content--compact-title
    :deep(h2),
  .story-section--iif-annotations
    .story-iif-caption-layer--compact
    .story-iif-caption-layer__content--compact-title
    :deep(h3),
  .story-section--iif-annotations
    .story-iif-caption-layer--compact
    .story-iif-caption-layer__content--compact-title
    :deep(h4),
  .story-section--iif-annotations
    .story-iif-caption-layer--compact
    .story-iif-caption-layer__content--compact-title
    :deep(h5),
  .story-section--iif-annotations
    .story-iif-caption-layer--compact
    .story-iif-caption-layer__content--compact-title
    :deep(h6) {
    margin: 0 0 0.35rem;
  }

  .story-section--iif-annotations
    .story-iif-caption-layer--compact
    .story-iif-caption-layer__content--compact-title
    :deep(p),
  .story-section--iif-annotations
    .story-iif-caption-layer--compact
    .story-iif-caption-layer__content--compact-title
    :deep(li),
  .story-section--iif-annotations
    .story-iif-caption-layer--compact
    .story-iif-caption-layer__content--compact-title
    :deep(blockquote) {
    margin: 0;
  }

  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__caption :deep(br),
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__text :deep(br) {
    display: block;
    content: '';
  }

  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__caption :deep(img),
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__text :deep(img),
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__caption :deep(figure),
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__text :deep(figure),
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__caption :deep(video),
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__text :deep(video),
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__caption :deep(table),
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__text :deep(table) {
    display: none !important;
  }

  .story-section--iif-annotations .story-iif-annotation-side-btn {
    position: absolute !important;
    z-index: 3;
    left: 0;
    bottom: 16px;
    width: auto !important;
    max-width: none;
    margin: 0 !important;
    justify-content: flex-start;
  }

  .story-section--iif-annotations .story-iif-explore-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    bottom: auto;
    z-index: 3;
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
    padding: 0 !important;
  }

  .story-fullscreen-stack__layer .story-section--iif-annotations .story-fs-media,
  .story-section--iif-annotations .story-fs-media {
    display: grid !important;
    grid-template-areas: 'media-stack' !important;
    align-items: stretch !important;
    justify-items: stretch !important;
    height: auto !important;
    min-width: 0;
    overflow: hidden;
  }

  .story-fullscreen-stack__layer .story-iif-osd-viewer-wrap,
  .story-section--iif-annotations .story-iif-osd-viewer-wrap {
    grid-area: media-stack;
    width: 100% !important;
    max-width: 100% !important;
    height: var(--story-iif-viewer-mobile-height, 70vh) !important;
    min-height: 0 !important;
    max-height: var(--story-iif-viewer-mobile-height, 70vh) !important;
  }

  .story-fullscreen-stack__layer .story-iif-osd-viewer-wrap .story-iif-osd-viewer,
  .story-section--iif-annotations .story-iif-osd-viewer-wrap .story-iif-osd-viewer {
    width: 100% !important;
    height: 100% !important;
    min-height: 100% !important;
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer,
  .story-section--iif-annotations .story-iif-caption-layer {
    position: absolute !important;
    z-index: 2;
    left: 0;
    right: 0;
    bottom: 16px;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    min-height: 0;
    max-height: var(--story-iif-caption-mobile-max-height);
    margin: 0 !important;
    overflow: hidden;
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer__body,
  .story-section--iif-annotations .story-iif-caption-layer__body {
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
    min-width: 0;
    overflow-x: clip;
    overflow-y: auto;
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer__caption,
  .story-fullscreen-stack__layer .story-iif-caption-layer__text,
  .story-section--iif-annotations .story-iif-caption-layer__caption,
  .story-section--iif-annotations .story-iif-caption-layer__text {
    display: block;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer__caption p,
  .story-fullscreen-stack__layer .story-iif-caption-layer__text p,
  .story-fullscreen-stack__layer .story-iif-caption-layer__caption figure,
  .story-fullscreen-stack__layer .story-iif-caption-layer__text figure,
  .story-fullscreen-stack__layer .story-iif-caption-layer__caption div,
  .story-fullscreen-stack__layer .story-iif-caption-layer__text div,
  .story-section--iif-annotations .story-iif-caption-layer__caption p,
  .story-section--iif-annotations .story-iif-caption-layer__text p,
  .story-section--iif-annotations .story-iif-caption-layer__caption figure,
  .story-section--iif-annotations .story-iif-caption-layer__text figure,
  .story-section--iif-annotations .story-iif-caption-layer__caption div,
  .story-section--iif-annotations .story-iif-caption-layer__text div {
    min-width: 0;
    max-width: 100%;
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer__caption img,
  .story-fullscreen-stack__layer .story-iif-caption-layer__text img,
  .story-section--iif-annotations .story-iif-caption-layer__caption img,
  .story-section--iif-annotations .story-iif-caption-layer__text img {
    display: block;
    width: auto;
    max-width: 100% !important;
    height: auto !important;
    max-height: var(--story-iif-caption-mobile-image-max-height);
    object-fit: contain;
    object-position: left top;
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer__caption table,
  .story-fullscreen-stack__layer .story-iif-caption-layer__text table,
  .story-section--iif-annotations .story-iif-caption-layer__caption table,
  .story-section--iif-annotations .story-iif-caption-layer__text table {
    display: block;
    width: 100%;
    overflow-x: auto;
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer--compact,
  .story-section--iif-annotations .story-iif-caption-layer--compact {
    max-height: none;
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__body,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__body {
    flex: 0 0 auto;
    overflow: hidden;
    overflow-y: hidden;
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__caption,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__text,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__caption,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title h1,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title h2,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title h3,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title h4,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title h5,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title h6,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title h1,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title h2,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title h3,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title h4,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title h5,
  .story-section--iif-annotations
    .story-iif-caption-layer--compact
    .story-iif-caption-layer__content--compact-title
    h6 {
    margin: 0 0 0.35rem;
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title p,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title li,
  .story-fullscreen-stack__layer
    .story-iif-caption-layer--compact
    .story-iif-caption-layer__content--compact-title
    blockquote,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title p,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__content--compact-title li,
  .story-section--iif-annotations
    .story-iif-caption-layer--compact
    .story-iif-caption-layer__content--compact-title
    blockquote {
    margin: 0;
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__caption br,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__text br,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__caption br,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__text br {
    display: block;
    content: '';
  }

  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__caption img,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__text img,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__caption figure,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__text figure,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__caption video,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__text video,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__caption table,
  .story-fullscreen-stack__layer .story-iif-caption-layer--compact .story-iif-caption-layer__text table,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__caption img,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__text img,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__caption figure,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__text figure,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__caption video,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__text video,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__caption table,
  .story-section--iif-annotations .story-iif-caption-layer--compact .story-iif-caption-layer__text table {
    display: none !important;
  }

  .story-fullscreen-stack__layer .story-iif-explore-btn,
  .story-section--iif-annotations .story-iif-explore-btn {
    position: absolute !important;
    top: 16px !important;
    right: 16px !important;
    bottom: auto !important;
    z-index: 3;
  }

  .story-fullscreen-stack__layer .story-iif-annotation-side-btn,
  .story-section--iif-annotations .story-iif-annotation-side-btn {
    position: absolute !important;
    z-index: 3;
    left: 0;
    bottom: 16px;
    width: auto !important;
    max-width: none !important;
    margin: 0 !important;
    justify-content: flex-start !important;
  }
}
</style>
