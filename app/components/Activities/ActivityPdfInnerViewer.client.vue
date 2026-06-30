<template>
  <div class="pdf-inner">
    <div class="pdf-inner__toolbar" role="toolbar" :aria-label="t('PDF viewer toolbar')">
      <a
        class="pdf-inner__download"
        :href="url"
        :download="downloadFilename"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="t('Download PDF document', { name: downloadFilename })"
      >
        {{ t('Download PDF') }}
      </a>
      <UiButton
        type="button"
        variant="outline"
        size="sm"
        rounded
        icon="chevron-left"
        :disabled="pageNum <= 1 || loading"
        :aria-label="t('PDF previous page')"
        @click="goPrev"
      />
      <span class="pdf-inner__page" aria-live="polite">
        {{ t('PDF page status', { current: pageNum, total: numPages || '—' }) }}
      </span>
      <UiButton
        type="button"
        variant="outline"
        size="sm"
        rounded
        icon="chevron-right"
        :disabled="pageNum >= numPages || loading || numPages === 0"
        :aria-label="t('PDF next page')"
        @click="goNext"
      />
      <div class="pdf-inner__zoom" role="group" :aria-label="t('PDF zoom controls')">
        <UiButton
          type="button"
          variant="outline"
          size="sm"
          rounded
          :aria-label="t('PDF zoom out')"
          :disabled="scale <= MIN_SCALE || loading"
          @click="zoomOut"
        >
          −
        </UiButton>
        <UiButton
          type="button"
          variant="outline"
          size="sm"
          rounded
          :aria-label="t('PDF zoom in')"
          :disabled="scale >= MAX_SCALE || loading"
          @click="zoomIn"
        >
          +
        </UiButton>
      </div>
    </div>
    <div
      ref="focusRegionRef"
      class="pdf-inner__viewport"
      tabindex="0"
      role="region"
      :aria-label="t('PDF document viewport')"
      @keydown.stop="onViewportKeydown"
    >
      <p v-if="loadError" class="pdf-inner__err">
        {{ loadError }}
      </p>
      <canvas v-show="!loadError" ref="canvasRef" class="pdf-inner__canvas" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { activityPdfFetchUrl } from '#shared/utils/activityPdfProxyUrl'
import { configurePdfJsWorker } from '#shared/utils/pdfjsClient'

const props = withDefaults(
  defineProps<{
    url: string
    /** Nome file suggerito per l'attributo `download` (es. da `activityAttachmentDownloadFilename`). */
    downloadFilename?: string
  }>(),
  { downloadFilename: '' },
)

const downloadFilename = computed(() => {
  const f = props.downloadFilename?.trim()
  if (f)
    return f.endsWith('.pdf') ? f : `${f}.pdf`
  try {
    const seg = new URL(props.url).pathname.split('/').filter(Boolean).pop()
    if (seg)
      return decodeURIComponent(seg)
  }
  catch {
    /* ignore */
  }
  return 'document.pdf'
})

const { t } = useI18n()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const focusRegionRef = ref<HTMLElement | null>(null)
const loading = ref(true)
const loadError = ref<string | null>(null)
const pageNum = ref(1)
const numPages = ref(0)
const scale = ref(1.2)

const MIN_SCALE = 0.6
const MAX_SCALE = 2.5
const SCALE_STEP = 0.2

let pdfDoc: PDFDocumentProxy | null = null
let renderTask: { cancel: () => void } | null = null
let loadGeneration = 0

async function loadDoc(): Promise<void> {
  const gen = ++loadGeneration
  loadError.value = null
  loading.value = true
  pageNum.value = 1
  numPages.value = 0
  if (pdfDoc) {
    await pdfDoc.destroy().catch(() => {})
    pdfDoc = null
  }
  try {
    await configurePdfJsWorker()
    if (gen !== loadGeneration)
      return
    const pdfjs = await import('pdfjs-dist')
    const task = pdfjs.getDocument({
      url: activityPdfFetchUrl(props.url),
      withCredentials: false,
    })
    pdfDoc = await task.promise
    if (gen !== loadGeneration) {
      await pdfDoc.destroy().catch(() => {})
      pdfDoc = null
      return
    }
    numPages.value = pdfDoc.numPages
    await nextTick()
    if (!canvasRef.value)
      await nextTick()
    if (gen !== loadGeneration)
      return
    await renderPage()
  }
  catch (e) {
    if (gen === loadGeneration) {
      loadError.value = typeof e === 'object' && e && 'message' in e
        ? String((e as Error).message)
        : 'PDF'
    }
  }
  finally {
    if (gen === loadGeneration) {
      loading.value = false
      if (!loadError.value) {
        nextTick(() => focusRegionRef.value?.focus())
      }
    }
  }
}

async function renderPage(): Promise<void> {
  if (!pdfDoc || !canvasRef.value)
    return
  renderTask?.cancel()
  renderTask = null
  const page = await pdfDoc.getPage(pageNum.value)
  const viewport = page.getViewport({ scale: scale.value })
  const canvas = canvasRef.value
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return
  const task = page.render({ canvasContext: ctx, viewport, canvas })
  renderTask = task
  await task.promise
}

function goPrev(): void {
  if (pageNum.value > 1) {
    pageNum.value--
    void renderPage()
  }
}

function goNext(): void {
  if (numPages.value && pageNum.value < numPages.value) {
    pageNum.value++
    void renderPage()
  }
}

function zoomIn(): void {
  if (scale.value < MAX_SCALE) {
    scale.value = Math.min(MAX_SCALE, Math.round((scale.value + SCALE_STEP) * 10) / 10)
    void renderPage()
  }
}

function zoomOut(): void {
  if (scale.value > MIN_SCALE) {
    scale.value = Math.max(MIN_SCALE, Math.round((scale.value - SCALE_STEP) * 10) / 10)
    void renderPage()
  }
}

function onViewportKeydown(e: KeyboardEvent): void {
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault()
    goPrev()
  }
  else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
    e.preventDefault()
    goNext()
  }
  else if (e.key === '+' || e.key === '=') {
    e.preventDefault()
    zoomIn()
  }
  else if (e.key === '-' || e.key === '_') {
    e.preventDefault()
    zoomOut()
  }
}

watch(() => props.url, () => void loadDoc(), { flush: 'post', immediate: true })

onBeforeUnmount(async () => {
  loadGeneration++
  renderTask?.cancel()
  if (pdfDoc) {
    await pdfDoc.destroy().catch(() => {})
    pdfDoc = null
  }
})
</script>

<style lang="postcss" scoped>
.pdf-inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 50vh;
  max-height: min(85vh, 900px);
}

.pdf-inner__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.pdf-inner__download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 6px 12px;
  margin-inline-end: 4px;
  font-size: var(--ui-text-small, 14px);
  font-weight: var(--medium, 500);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-text, inherit);
  background-color: var(--color-background, #fff);
  border: 1px solid var(--ui-neutral-border, #e0e0e0);
  border-radius: var(--ui-radius, 8px);
  transition:
    color 200ms ease-out,
    background-color 200ms ease-out,
    border-color 200ms ease-out;
}

.pdf-inner__download:hover {
  opacity: 0.92;
}

.pdf-inner__download:focus-visible {
  outline: 2px solid var(--ui-focus, #0066cc);
  outline-offset: 2px;
}

.pdf-inner__page {
  font-size: var(--ui-text-small, 14px);
  min-width: 5em;
  text-align: center;
}

.pdf-inner__zoom {
  display: flex;
  gap: 4px;
  margin-inline-start: auto;
}

.pdf-inner__viewport {
  flex: 1;
  overflow: auto;
  outline: none;
  border: 1px solid var(--ui-neutral-border, #e0e0e0);
  border-radius: var(--ui-radius, 8px);
  background: var(--gray-1, #f5f5f5);
}

.pdf-inner__viewport:focus-visible {
  outline: 2px solid var(--ui-focus, #0066cc);
  outline-offset: 2px;
}

.pdf-inner__canvas {
  display: block;
  margin: 0 auto;
}

.pdf-inner__err {
  margin: 0;
  padding: 24px;
  color: var(--gray-6, #666);
}
</style>
