<template>
  <div :class="[customOsdViewer || 'osdViewer']">
    <div class="osdViewer__main">
      <div class="osdCanvasArea">
        <div ref="viewerRef" class="osdContainer" :style="{ width, height }" />
        <div
          v-if="isGalleryShown"
          class="osdGalleryDrawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="osd-gallery-title"
        >
          <div class="osdGalleryDrawer__panelShell">
            <OsdGallery
              :thumb-urls="galleryThumbUrls"
              :selected-index="selectedPageIndex"
              @select-page="goToGalleryPage"
              @close="galleryVisible = false"
            />
          </div>
        </div>
      </div>
      <OsdGalleryNavigator
        v-if="showNavigator"
        :has-multiple-pages="(galleryThumbUrls?.length ?? 0) > 1"
        :selected-page-index="selectedPageIndex"
        :total-pages="galleryThumbUrls?.length ?? 0"
        :metadata-visible="metadataVisible"
        :gallery-visible="galleryVisible"
        @toggle-metadata="metadataVisible = !metadataVisible"
        @toggle-gallery="galleryVisible = !galleryVisible"
        @go-to-page="goToGalleryPage"
      />
      <div
        v-if="isMetadataShown"
        class="osdMetadataDrawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="osd-metadata-title"
        :style="{ bottom: showNavigator ? '50px' : '0' }"
      >
        <div class="osdMetadataDrawer__panelShell">
          <OsdGalleryManifestSalon
            :studenti="currentPageStudenti"
            @close="metadataVisible = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import OpenSeadragon from 'openseadragon'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import OsdGallery from './OsdGallery.vue'
import OsdGalleryManifestSalon from './OsdGalleryManifestSalon.vue'
import OsdGalleryNavigator from './OsdGalleryNavigator.vue'

const props = defineProps({
  tileSources: { type: [Object, String, Array], required: true },
  width: { type: String, default: '' },
  height: { type: String, default: '' },
  options: { type: Object, default: () => ({}) },
  showNavigator: { type: Boolean, default: false },
  customOsdViewer: { type: String, default: '' },
  currentPage: { type: Number, default: 0 },
  galleryThumbUrls: { type: Array, default: () => [] },
  salonPagine: { type: Object, default: () => ({ pagine: [] }) },
})

const { t, locale } = useI18n()

const viewer = ref(null)
const viewerRef = ref(null)
const isFullPage = ref(false)

const isCompactViewport = useMediaQuery('(max-width: 1024px)', { ssrWidth: 1280 })
let resizeObserver = null
const selectedPageIndex = ref(0)
const galleryVisible = ref(true)
const metadataVisible = ref(true)
const isGalleryShown = computed(() => props.galleryThumbUrls?.length > 1 && galleryVisible.value)
const isMetadataShown = computed(() => metadataVisible.value)
const isAnyOsdOverlayOpen = computed(() => isMetadataShown.value || isGalleryShown.value)

const currentPageStudenti = computed(() => {
  const pagine = props.salonPagine?.pagine
  if (!Array.isArray(pagine) || pagine.length === 0)
    return []

  const index = selectedPageIndex.value
  if (!Number.isInteger(index) || index < 0 || index >= pagine.length)
    return []

  const studenti = pagine[index]?.studenti
  return Array.isArray(studenti) && studenti.length > 0 ? studenti : []
})

const EXIT_FULLPAGE_CLASS = 'iartnet-osd-exit-fullpage'
const EXIT_FULLPAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden="true"><line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" vector-effect="non-scaling-stroke" stroke-width="1.6" /><line x1="22" y1="2" x2="2" y2="22" stroke="currentColor" vector-effect="non-scaling-stroke" stroke-width="1.6" /></svg>`

function goToGalleryPage(index) {
  selectedPageIndex.value = index
  if (viewer.value && Number.isInteger(index) && index >= 0) {
    viewer.value.goToPage(index)
  }
}

const initOSD = () => {
  viewer.value = OpenSeadragon({
    id: 'viewer-salon',
    element: viewerRef.value,
    prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
    tileSources: props.tileSources,
    zoomInButton: 'osdZoomIn',
    zoomOutButton: 'osdZoomOut',
    fullPageButton: 'osdFulls',
    crossOriginPolicy: 'Anonymous',
    loadTilesWithAjax: true,
    placeholderFillStyle: '#e8e8e8',

    gestureSettingsMouse: {
      scrollToZoom: true,
    },

    ...props.options,
  })

  viewer.value.addHandler('canvas-focus', () => {
    viewer.value.gestureSettingsMouse.scrollToZoom = true
  })
  viewer.value.addHandler('canvas-enter', () => {
    viewer.value.gestureSettingsMouse.scrollToZoom = false
  })
  viewer.value.addHandler('canvas-blur', () => {
    viewer.value.gestureSettingsMouse.scrollToZoom = false
  })
  viewer.value.addHandler('canvas-exit', () => {
    viewer.value.gestureSettingsMouse.scrollToZoom = false
    viewer.value.canvas.blur()
  })

  viewer.value.addHandler('full-page', () => {
    isFullPage.value = viewer.value.isFullPage()
    nextTick(() => syncFullPageExitButton())
  })
}

function exitFullPage() {
  const v = viewer.value
  if (!v)
    return
  if (v.isFullScreen()) {
    v.setFullScreen(false)
    return
  }
  if (v.isFullPage()) {
    v.setFullPage(false)
  }
}

function removeFullPageExitButton() {
  const host = viewerRef.value
  const existing = host?.querySelector?.(`.${EXIT_FULLPAGE_CLASS}`)
  if (existing) {
    existing.removeEventListener('click', onExitFullPageClick)
    existing.remove()
  }
}

function onExitFullPageClick() {
  exitFullPage()
}

function syncFullPageExitButton() {
  const host = viewerRef.value
  if (!host)
    return

  const need = isFullPage.value && isCompactViewport.value
  const existing = host.querySelector(`.${EXIT_FULLPAGE_CLASS}`)

  if (need && !existing) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = EXIT_FULLPAGE_CLASS
    btn.setAttribute('aria-label', t('OSD-ExitFullscreen'))
    btn.innerHTML = EXIT_FULLPAGE_SVG
    btn.addEventListener('click', onExitFullPageClick)
    host.appendChild(btn)
  }
  else if (!need && existing) {
    existing.removeEventListener('click', onExitFullPageClick)
    existing.remove()
  }
}

onMounted(() => {
  initOSD()

  if (viewerRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (viewer.value) {
        viewer.value.forceRedraw()
      }
    })
    resizeObserver.observe(viewerRef.value)
  }
})

watch(() => props.tileSources, (newSources) => {
  if (viewer.value) {
    viewer.value.open(newSources)
  }
})

watch(() => props.currentPage, (page) => {
  if (viewer.value && Number.isInteger(page) && page >= 0) {
    selectedPageIndex.value = page
    viewer.value.goToPage(page)
  }
})

watch([isFullPage, isCompactViewport], () => {
  nextTick(() => syncFullPageExitButton())
}, { flush: 'post' })

watch(locale, () => {
  nextTick(() => {
    const host = viewerRef.value
    const existing = host?.querySelector?.(`.${EXIT_FULLPAGE_CLASS}`)
    if (existing)
      existing.setAttribute('aria-label', t('OSD-ExitFullscreen'))
  })
})

function onOsdOverlayKeydown(e) {
  if (e.key !== 'Escape')
    return
  if (metadataVisible.value) {
    metadataVisible.value = false
    return
  }
  if (isGalleryShown.value)
    galleryVisible.value = false
}

watch(isAnyOsdOverlayOpen, (open) => {
  if (typeof window === 'undefined')
    return
  if (open)
    window.addEventListener('keydown', onOsdOverlayKeydown)
  else
    window.removeEventListener('keydown', onOsdOverlayKeydown)
}, { flush: 'post' })

onBeforeUnmount(() => {
  if (typeof window !== 'undefined')
    window.removeEventListener('keydown', onOsdOverlayKeydown)
  removeFullPageExitButton()
  isFullPage.value = false
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (viewer.value) {
    viewer.value.destroy()
    viewer.value = null
  }
})

defineExpose({ viewer })
</script>

<style lang="postcss" scoped>
.osdViewer {
  position: relative;
  width: calc(100% - 100px);
  min-height: min(744px, 60vh);
  height: 100%;
  margin: 0 auto;
  border: 1px solid #d8d8d8;
  border-radius: var(--ui-radius-large);
  background-color: var(--gray-2);
  overscroll-behavior: contain;
  overflow: hidden;
}

.osdViewer__main {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.osdCanvasArea {
  position: relative;
  width: 100%;
  min-width: 0;
  min-height: 0;
  height: calc(100% - 50px);
  flex-shrink: 0;
}

.osdMetadataDrawer {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 40;
  pointer-events: none;
}

.osdMetadataDrawer__panelShell {
  pointer-events: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: min(400px, 92vw);
  z-index: 1;
  display: flex;
  min-height: 0;
  background: rgba(255 255 255 / 0.76);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: 4px 0 24px rgba(0 0 0 / 0.1);
  border-right: 1px solid rgba(0 0 0 / 0.08);
  box-sizing: border-box;
}

.osdMetadataDrawer__panelShell :deep(.manifest) {
  width: 100%;
  min-height: 0;
  flex: 1 1 auto;
  border-left: none;
  box-sizing: border-box;
  background-color: transparent;
  background: transparent;
}

@media (prefers-reduced-motion: reduce) {
  .osdMetadataDrawer__panelShell {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: rgba(255 255 255 / 0.75);
  }
}

@media (max-width: 768px) {
  .osdMetadataDrawer__panelShell {
    width: 100%;
    max-width: 100%;
    left: 0;
    right: 0;
  }
}

.osdGalleryDrawer {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 41;
  pointer-events: none;
}

.osdGalleryDrawer__panelShell {
  pointer-events: auto;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(240px, 92vw);
  z-index: 1;
  display: flex;
  min-height: 0;
  background: rgba(255 255 255 / 0.76);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: -4px 0 24px rgba(0 0 0 / 0.1);
  border-left: 1px solid rgba(0 0 0 / 0.08);
  box-sizing: border-box;
}

.osdGalleryDrawer__panelShell :deep(.gallery) {
  width: 100%;
  min-height: 0;
  flex: 1 1 auto;
  border-left: none;
  box-sizing: border-box;
  background-color: transparent;
  background: transparent;
}

@media (max-width: 768px) {
  .osdGalleryDrawer__panelShell {
    top: auto;
    bottom: 0;
    width: 100%;
    max-width: 100%;
    max-height: 50px;
    height: auto;
    min-height: 0;
    left: 0;
    right: 0;
    background: transparent;
    box-shadow: none;
    border: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .osdGalleryDrawer__panelShell :deep(.gallery) {
    flex: 0 0 auto;
    min-height: 0;
    max-height: 50px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .osdGalleryDrawer__panelShell {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@media (prefers-reduced-motion: reduce) and (min-width: 769px) {
  .osdGalleryDrawer__panelShell {
    background: rgba(255 255 255 / 0.75);
  }
}

.osdViewer .osdContainer {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.osdViewer .osdContainer :deep(.openseadragon-container),
.osdViewer .osdContainer :deep(.openseadragon-canvas) {
  background-color: var(--gray-2);
}

@media (max-width: 768px) {
  .osdViewer {
    width: 100%;
    max-width: 100%;
    margin-inline: 0;
    box-sizing: border-box;
    padding-inline: env(safe-area-inset-left, 0px) env(safe-area-inset-right, 0px);
    border-radius: 0;
  }

  .osdViewer .osdContainer {
    margin-inline: 0;
  }
}
</style>

<style lang="postcss">
.iartnet-osd-exit-fullpage {
  position: absolute;
  top: max(12px, env(safe-area-inset-top, 0px));
  right: max(12px, env(safe-area-inset-right, 0px));
  z-index: 2147483646;
  pointer-events: auto;
  width: 44px;
  height: 44px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  -webkit-tap-highlight-color: transparent;
}

.iartnet-osd-exit-fullpage:active {
  background: rgba(0, 0, 0, 0.7);
}
</style>
