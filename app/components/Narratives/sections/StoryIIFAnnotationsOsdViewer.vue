<template>
  <div
    ref="viewerRef"
    class="story-iif-osd-viewer"
    :class="{ 'story-iif-osd-viewer--explore': exploreActive }"
  />
</template>

<script setup lang="ts">
import type { TStoryIIFAnnotationType } from '#shared/types/api'
import { iiifPixelRectToViewport, isValidIiifAnnotationRect } from '#shared/utils/iiif'
import { requestStoryScrollLayoutRefresh, STORY_SCROLL_LAYOUT_REFRESH_EVENT } from '#shared/utils/storyPanelScroll'
import OpenSeadragon from 'openseadragon'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  tileSource: string
  imageWidth: number
  imageHeight: number
  /** Area da inquadrare; null = immagine intera. */
  annotation: TStoryIIFAnnotationType | null
  /** Rettangolo visivo sull'annotazione (es. false sulla slide caption). */
  showAnnotationOverlay?: boolean
  /** Pan/zoom libero attivo: non interferisce con lo scroll pagina quando false. */
  exploreActive?: boolean
  /** Mobile: dopo fit immagine intera, allinea il bordo superiore al contenitore (niente letterbox sopra). */
  alignImageTop?: boolean
  /** Mobile: layout viewer alto; limita lo zoom eccessivo sulle annotazioni. */
  mobileViewportLayout?: boolean
}>(), {
  showAnnotationOverlay: true,
  exploreActive: false,
  alignImageTop: false,
  mobileViewportLayout: false,
})

const emit = defineEmits<{
  'update:exploreActive': [value: boolean]
}>()

const ANNOTATION_OVERLAY_ID = `custom-annotation-overlay-${useId()}`

const VIEWPORT_TRANSITION_SECONDS = 0.85
/** Margine attorno all'annotazione per fitBounds (zoom out + contesto). */
const ANNOTATION_VIEWPORT_MARGIN_RATIO = 0.15

const viewer = ref<OpenSeadragon.Viewer | null>(null)
const viewerRef = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null
let layoutRefreshHandler: (() => void) | null = null

function getViewerContainerSize(): { width: number, height: number } | null {
  const el = viewerRef.value
  if (!el?.isConnected)
    return null

  const { width, height } = el.getBoundingClientRect()
  if (width <= 0 || height <= 0)
    return null

  return { width, height }
}

function safeViewportResize(v: OpenSeadragon.Viewer): boolean {
  if (!getViewerContainerSize())
    return false

  try {
    v.viewport.resize()
    return true
  }
  catch (err) {
    console.warn('[StoryIIFAnnotationsOsdViewer] viewport.resize skipped', err)
    return false
  }
}

function getViewportRect(annotation: TStoryIIFAnnotationType | null) {
  const rect = annotation?.Rect
  if (!rect || !isValidIiifAnnotationRect(rect))
    return null

  const item = viewer.value?.world.getItemAt(0)
  if (item) {
    return item.imageToViewportRectangle(
      rect.x,
      rect.y,
      rect.width,
      rect.height,
    )
  }

  if (props.imageWidth <= 0 || props.imageHeight <= 0)
    return null

  const normalized = iiifPixelRectToViewport(
    rect,
    props.imageWidth,
    props.imageHeight,
  )

  return new OpenSeadragon.Rect(
    normalized.x,
    normalized.y,
    normalized.width,
    normalized.height,
  )
}

function ensureAnnotationOverlay(viewportRect: OpenSeadragon.Rect) {
  const v = viewer.value
  if (!v)
    return

  const existing = v.getOverlayById(ANNOTATION_OVERLAY_ID)
  if (existing) {
    existing.update(viewportRect, OpenSeadragon.Placement.TOP_LEFT)
    return
  }

  const overlayDiv = document.createElement('div')
  overlayDiv.id = ANNOTATION_OVERLAY_ID
  overlayDiv.className = 'custom-annotation-overlay'

  v.addOverlay({
    id: ANNOTATION_OVERLAY_ID,
    element: overlayDiv,
    location: viewportRect,
    placement: OpenSeadragon.Placement.TOP_LEFT,
  })
}

function removeAnnotationOverlay() {
  const v = viewer.value
  if (!v)
    return

  v.removeOverlay(ANNOTATION_OVERLAY_ID)
}

function fitViewportToBounds(bounds: OpenSeadragon.Rect | null | undefined, immediately: boolean) {
  const v = viewer.value
  if (!v || !bounds)
    return

  v.viewport.fitBounds(bounds, immediately)
}

function zoomToFullImage(immediately = true) {
  const v = viewer.value
  if (!v)
    return

  const item = v.world.getItemAt(0)
  if (!item)
    return

  fitViewportToBounds(item.getBounds(), immediately)
}

/** Cover (riempie il viewer) + pan: bordo superiore flush, zoom minimo per riempire l'area. */
function zoomToCoverTopAligned(immediately = true) {
  const v = viewer.value
  const item = v?.world.getItemAt(0)
  if (!v || !item)
    return

  const bounds = item.getBounds()
  if (!bounds)
    return

  const container = v.viewport.getContainerSize()
  if (container.x <= 0 || container.y <= 0 || bounds.width <= 0 || bounds.height <= 0)
    return

  const scaleX = container.x / bounds.width
  const scaleY = container.y / bounds.height
  const containScale = Math.min(scaleX, scaleY)
  const coverScale = Math.max(scaleX, scaleY)

  if (containScale <= 0)
    return

  fitViewportToBounds(bounds, immediately)
  const containZoom = v.viewport.getZoom(true)
  const coverZoom = containZoom * (coverScale / containScale)

  const center = bounds.getCenter()
  if (!center)
    return

  v.viewport.zoomTo(coverZoom, center, immediately)

  const viewportBounds = v.viewport.getBounds()
  if (!viewportBounds)
    return

  const centerX = bounds.x + bounds.width / 2
  const centerY = bounds.y + viewportBounds.height / 2
  v.viewport.panTo(new OpenSeadragon.Point(centerX, centerY), immediately)
}

function buildAnnotationFitBounds(
  annotationRect: OpenSeadragon.Rect,
  marginRatio: number,
  imageBounds: OpenSeadragon.Rect,
): OpenSeadragon.Rect | null {
  const center = annotationRect.getCenter()
  if (!center)
    return null

  let halfW = (annotationRect.width * (1 + marginRatio)) / 2
  let halfH = (annotationRect.height * (1 + marginRatio)) / 2

  const maxHalfW = Math.min(
    center.x - imageBounds.x,
    imageBounds.x + imageBounds.width - center.x,
  )
  const maxHalfH = Math.min(
    center.y - imageBounds.y,
    imageBounds.y + imageBounds.height - center.y,
  )

  if (!Number.isFinite(maxHalfW) || !Number.isFinite(maxHalfH))
    return null

  halfW = Math.min(halfW, maxHalfW)
  halfH = Math.min(halfH, maxHalfH)

  // L'annotazione intera deve restare visibile.
  halfW = Math.max(halfW, annotationRect.width / 2)
  halfH = Math.max(halfH, annotationRect.height / 2)

  halfW = Math.min(halfW, maxHalfW)
  halfH = Math.min(halfH, maxHalfH)

  return new OpenSeadragon.Rect(
    center.x - halfW,
    center.y - halfH,
    halfW * 2,
    halfH * 2,
  )
}

function zoomToViewportRect(viewportRect: OpenSeadragon.Rect, immediately = true) {
  const v = viewer.value
  if (!v)
    return

  const item = v.world.getItemAt(0)
  if (!item)
    return

  const imageBounds = item.getBounds()
  if (!imageBounds)
    return

  const fitBounds = buildAnnotationFitBounds(
    viewportRect,
    ANNOTATION_VIEWPORT_MARGIN_RATIO,
    imageBounds,
  )

  if (!fitBounds)
    return

  const fitCenter = fitBounds.getCenter()
  if (!fitCenter)
    return

  v.viewport.fitBounds(fitBounds, immediately)

  if (!props.mobileViewportLayout)
    return

  // Viewer mobile molto alto: fitBounds sull'annotazione può zoomare eccessivamente.
  v.viewport.fitBounds(imageBounds, immediately)
  const containZoom = v.viewport.getZoom(true)
  v.viewport.fitBounds(fitBounds, immediately)
  const annotationZoom = v.viewport.getZoom(true)
  const maxZoom = containZoom * 1.35

  if (annotationZoom > maxZoom)
    v.viewport.zoomTo(maxZoom, fitCenter, immediately)
}

function annotationSyncKey(
  annotation: TStoryIIFAnnotationType | null,
  showOverlay: boolean,
): string {
  const rect = annotation?.Rect
  if (!rect || !isValidIiifAnnotationRect(rect))
    return `full:${showOverlay}`

  const { x, y, width, height } = rect
  return `${showOverlay}:${x},${y},${width},${height}`
}

function syncView({ resize = false, animate = false }: { resize?: boolean, animate?: boolean } = {}) {
  const v = viewer.value
  if (!v?.world.getItemCount())
    return

  if (props.exploreActive)
    return

  if (!getViewerContainerSize())
    return

  if (resize) {
    if (safeViewportResize(v))
      v.forceRedraw()
  }

  const immediately = !animate
  const viewportRect = getViewportRect(props.annotation)

  if (!viewportRect) {
    removeAnnotationOverlay()
    if (props.alignImageTop)
      zoomToCoverTopAligned(immediately)
    else
      zoomToFullImage(immediately)
    return
  }

  if (props.showAnnotationOverlay)
    ensureAnnotationOverlay(viewportRect)
  else
    removeAnnotationOverlay()

  zoomToViewportRect(viewportRect, immediately)
}

function scheduleSyncView(options?: { resize?: boolean, animate?: boolean }) {
  void nextTick(() => {
    requestAnimationFrame(() => {
      syncView(options)
    })
  })
}

const STATIC_GESTURE_SETTINGS = {
  scrollToZoom: false,
  clickToZoom: false,
  dblClickToZoom: false,
  dblClickDragToZoom: false,
  pinchToZoom: false,
  flickEnabled: false,
  dragToPan: false,
} as const

const EXPLORE_GESTURE_SETTINGS = {
  scrollToZoom: true,
  clickToZoom: false,
  dblClickToZoom: true,
  dblClickDragToZoom: false,
  pinchToZoom: true,
  flickEnabled: false,
  dragToPan: true,
} as const

type ViewerWithGestures = OpenSeadragon.Viewer & {
  gestureSettingsMouse: Record<string, boolean>
  gestureSettingsTouch: Record<string, boolean>
  gestureSettingsPen: Record<string, boolean>
}

function applyExploreGestures(active: boolean) {
  const v = viewer.value as ViewerWithGestures | null
  if (!v)
    return

  v.setMouseNavEnabled(active)

  const settings = active ? EXPLORE_GESTURE_SETTINGS : STATIC_GESTURE_SETTINGS
  Object.assign(v.gestureSettingsMouse, settings)
  Object.assign(v.gestureSettingsTouch, settings)
  Object.assign(v.gestureSettingsPen, settings)
}

function onExploreActiveChange(active: boolean, wasActive?: boolean) {
  applyExploreGestures(active)

  if (wasActive && !active)
    syncView({ animate: false })
}

const initOSD = () => {
  if (!viewerRef.value)
    return

  viewer.value = OpenSeadragon({
    element: viewerRef.value,
    prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
    showNavigationControl: false,
    showZoomControl: false,
    showHomeControl: false,
    showFullPageControl: false,
    mouseNavEnabled: false,
    crossOriginPolicy: 'Anonymous',
    loadTilesWithAjax: true,
    placeholderFillStyle: '#e8e8e8',
    homeFillsViewer: false,
    maxZoomPixelRatio: 2,
    animationTime: VIEWPORT_TRANSITION_SECONDS,
    gestureSettingsMouse: { ...STATIC_GESTURE_SETTINGS },
    gestureSettingsTouch: { ...STATIC_GESTURE_SETTINGS },
    gestureSettingsPen: { ...STATIC_GESTURE_SETTINGS },
  })

  viewer.value.addHandler('open', () => {
    applyExploreGestures(props.exploreActive)
    scheduleSyncView({ resize: true })
    requestStoryScrollLayoutRefresh()
  })

  viewer.value.addHandler('resize', () => {
    // Evita loop: syncView(resize) → viewport.resize() → handler resize.
    scheduleSyncView({ resize: false })
  })

  viewer.value.open(props.tileSource)
}

function onExploreEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !props.exploreActive)
    return

  emit('update:exploreActive', false)
}

onMounted(() => {
  initOSD()

  if (viewerRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      scheduleSyncView({ resize: true })
    })
    resizeObserver.observe(viewerRef.value)
  }

  layoutRefreshHandler = () => scheduleSyncView({ resize: true })
  window.addEventListener(STORY_SCROLL_LAYOUT_REFRESH_EVENT, layoutRefreshHandler)
  document.addEventListener('keydown', onExploreEscape)
})

watch(() => props.tileSource, (newSource) => {
  if (viewer.value) {
    emit('update:exploreActive', false)
    viewer.value.open(newSource)
  }
})

watch(
  () => props.exploreActive,
  (active, wasActive) => {
    onExploreActiveChange(active, wasActive)
  },
)

watch(
  () => [props.alignImageTop, props.mobileViewportLayout] as const,
  () => {
    if (!props.exploreActive)
      syncView({ resize: true, animate: false })
  },
)

watch(
  () => annotationSyncKey(props.annotation, props.showAnnotationOverlay),
  () => {
    syncView({ animate: true })
  },
  { flush: 'post' },
)

watch(
  () => [props.imageWidth, props.imageHeight] as const,
  () => {
    scheduleSyncView({ resize: true })
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onExploreEscape)

  if (layoutRefreshHandler) {
    window.removeEventListener(STORY_SCROLL_LAYOUT_REFRESH_EVENT, layoutRefreshHandler)
    layoutRefreshHandler = null
  }

  resizeObserver?.disconnect()
  resizeObserver = null

  if (viewer.value) {
    viewer.value.destroy()
    viewer.value = null
  }
})

defineExpose({ viewer })
</script>

<style scoped>
.story-iif-osd-viewer {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.story-iif-osd-viewer--explore {
  pointer-events: auto;
  touch-action: none;
  overscroll-behavior: contain;
}

.story-iif-osd-viewer :deep(.openseadragon-container) {
  width: 100% !important;
  height: 100% !important;
  background-color: transparent;
  pointer-events: none;
}

.story-iif-osd-viewer--explore :deep(.openseadragon-container) {
  pointer-events: auto;
}

.story-iif-osd-viewer :deep(.openseadragon-canvas) {
  background-color: transparent;
  pointer-events: none;
}

.story-iif-osd-viewer--explore :deep(.openseadragon-canvas) {
  pointer-events: auto;
}

.story-iif-osd-viewer :deep(.openseadragon-overlay .custom-annotation-overlay),
.story-iif-osd-viewer :deep(.openseadragon-overlay.custom-annotation-overlay) {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  width: auto;
  height: auto;
  margin: 0;
  padding: 0;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.08);
  border: 0;
  opacity: 1;
  transition: opacity 0.35s ease;
}

.story-iif-osd-viewer :deep(.openseadragon-overlay .custom-annotation-overlay::after),
.story-iif-osd-viewer :deep(.openseadragon-overlay.custom-annotation-overlay::after) {
  content: '';
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  pointer-events: none;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.65);
}
</style>
