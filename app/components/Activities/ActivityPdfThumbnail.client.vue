<template>
  <div class="activity-pdf-thumb" role="img" :aria-label="ariaLabel">
    <canvas v-show="!error" ref="canvasRef" class="activity-pdf-thumb__canvas" />
    <p v-if="error" class="activity-pdf-thumb__error">
      {{ error }}
    </p>
    <span v-else-if="loading" class="activity-pdf-thumb__loading">{{ loadingText }}</span>
  </div>
</template>

<script setup lang="ts">
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { activityPdfFetchUrl } from '#shared/utils/activityPdfProxyUrl'
import { configurePdfJsWorker } from '#shared/utils/pdfjsClient'

const props = defineProps<{
  url: string
  ariaLabel: string
  loadingText: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const THUMB_SCALE = 0.28

let doc: PDFDocumentProxy | null = null
/** Evita che un `draw` obsoleto azzeri `loading` o disegni dopo cambio `url` / unmount. */
let drawGeneration = 0

async function draw(): Promise<void> {
  const gen = ++drawGeneration
  loading.value = true
  error.value = null
  if (doc) {
    await doc.destroy().catch(() => {})
    doc = null
  }
  try {
    await nextTick()
    let canvas = canvasRef.value
    if (!canvas) {
      await nextTick()
      canvas = canvasRef.value
    }
    if (!canvas || gen !== drawGeneration)
      return
    await configurePdfJsWorker()
    if (gen !== drawGeneration)
      return
    const pdfjs = await import('pdfjs-dist')
    const task = pdfjs.getDocument({
      url: activityPdfFetchUrl(props.url),
      withCredentials: false,
    })
    doc = await task.promise
    if (gen !== drawGeneration) {
      await doc.destroy().catch(() => {})
      doc = null
      return
    }
    const page = await doc.getPage(1)
    if (gen !== drawGeneration) {
      await doc.destroy().catch(() => {})
      doc = null
      return
    }
    const viewport = page.getViewport({ scale: THUMB_SCALE })
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      error.value = '—'
      await doc.destroy().catch(() => {})
      doc = null
      return
    }
    await page.render({ canvasContext: ctx, viewport, canvas }).promise
    await doc.destroy().catch(() => {})
    doc = null
  }
  catch (e) {
    if (doc) {
      await doc.destroy().catch(() => {})
      doc = null
    }
    if (gen === drawGeneration) {
      error.value = typeof e === 'object' && e && 'message' in e
        ? String((e as Error).message)
        : 'PDF'
    }
  }
  finally {
    if (gen === drawGeneration)
      loading.value = false
  }
}

/**
 * `flush: 'post'` + `immediate`: prima esecuzione dopo l’aggiornamento DOM (ref canvas valorizzato).
 * Senza `immediate` serviva `onMounted`; così un solo flusso per mount e per cambio `url`.
 */
watch(() => props.url, () => void draw(), { flush: 'post', immediate: true })

onBeforeUnmount(async () => {
  drawGeneration++
  if (doc) {
    await doc.destroy().catch(() => {})
    doc = null
  }
})
</script>

<style lang="postcss" scoped>
.activity-pdf-thumb {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: var(--gray-1, #f5f5f5);
  border-radius: 8px;
  border: 1px solid var(--ui-neutral-border, #e0e0e0);
  overflow: hidden;
}

.activity-pdf-thumb__canvas {
  display: block;
  max-width: 100%;
  height: auto;
}

.activity-pdf-thumb__loading,
.activity-pdf-thumb__error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 8px;
  font-size: var(--ui-text-small, 14px);
  color: var(--gray-6, #666);
  text-align: center;
}
</style>
