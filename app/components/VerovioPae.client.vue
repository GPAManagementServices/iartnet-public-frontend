<template>
  <div class="verovio-pae">
    <div class="verovio-pae__controls" role="group" aria-label="Verovio playback controls">
      <button
        type="button"
        :disabled="!canPlay || isPlaying"
        :aria-label="isPaused ? 'Resume score playback' : 'Play score'"
        @click="onPlay"
      >
        {{ isPaused ? 'Resume' : 'Play' }}
      </button>
      <button
        type="button"
        :disabled="!canPlay || !isPlaying"
        aria-label="Pause score playback"
        @click="onPause"
      >
        Pause
      </button>
      <button
        type="button"
        :disabled="!canPlay || (!isPlaying && !isPaused)"
        aria-label="Stop score playback"
        @click="onStop"
      >
        Stop
      </button>
    </div>

    <p v-if="audioError" class="verovio-pae__error" role="alert">
      {{ audioError }}
    </p>

    <p v-if="renderError" class="verovio-pae__error" role="alert">
      {{ renderError }}
    </p>

    <div
      v-else-if="svgMarkup"
      ref="svgHostRef"
      class="verovio-pae__svg"
      v-html="svgMarkup"
    />
  </div>
</template>

<script setup lang="ts">
import type { PaeIncipit } from '~/utils/PaeIncipit'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  disposeTonePlayback,
  ensureTonePlayback,
  toneNoteOff,
  toneNoteOn,
  toneReleaseAll,
} from '~/utils/scorePlayback/tonePolyAdapter'

const props = withDefaults(
  defineProps<{
    /** Incipit Plaine & Easie (solo questo formato). */
    pae: PaeIncipit
    /** Pagina SVG (1-based). */
    page?: number
    /** Opzioni aggiuntive Verovio (`inputFrom: 'pae'` è sempre applicato). */
    verovioOptions?: Record<string, unknown>
    /** Se true, esegue `validatePAE` prima di `loadData` e blocca in caso di errori. */
    validatePae?: boolean
  }>(),
  {
    page: 1,
    verovioOptions: () => ({}),
    validatePae: true,
  },
)

const config = useRuntimeConfig()

const svgMarkup = ref('')
const renderError = ref('')
const audioError = ref('')
const canPlay = ref(false)
const isPlaying = ref(false)
const isPaused = ref(false)
const svgHostRef = ref<HTMLElement | null>(null)

interface WasmModule {}

interface ElementsAtTimePayload {
  page?: number
  notes?: string[]
}

interface MidiValuesPayload {
  midi?: number
  midiPitch?: number
  pitch?: number
  [key: string]: unknown
}

interface VerovioToolkitInstance {
  setOptions: (options: Record<string, unknown>) => void
  validatePAE: (data: PaeIncipit | string) => unknown
  loadData: (data: string) => boolean
  getPageCount: () => number
  getElementsAtTime: (millisec: number) => ElementsAtTimePayload
  getMIDIValuesForElement: (xmlId: string) => MidiValuesPayload
  renderToMIDI: () => string
  renderToSVG: (pageNo?: number, xmlDeclaration?: boolean) => string
  destroy: () => void
}

const HIGHLIGHT_CLASS = 'playing'
const FALLBACK_MIDI_PITCH = 69

let wasmModule: WasmModule | null = null
let toolkit: VerovioToolkitInstance | null = null
let rafId: number | null = null
let playStartedAtMs = 0
let pausedAtMs = 0
let currentPage = 1
let activeNoteIds = new Set<string>()
/** Note IDs per cui è stato avviato un Synth Tone (allineato a syncVoices). */
const activeVoiceIds = new Set<string>()

function collectPaeValidationErrors(node: unknown, out: string[]): void {
  if (node === null || node === undefined)
    return
  if (typeof node !== 'object')
    return
  if (Array.isArray(node)) {
    for (const item of node)
      collectPaeValidationErrors(item, out)
    return
  }
  const n = node as Record<string, unknown>
  if (n.type === 'error' && typeof n.text === 'string')
    out.push(n.text)
  for (const v of Object.values(n))
    collectPaeValidationErrors(v, out)
}

function collectNumericCandidates(node: unknown, out: number[]): void {
  if (typeof node === 'number' && Number.isFinite(node)) {
    out.push(node)
    return
  }
  if (Array.isArray(node)) {
    for (const item of node)
      collectNumericCandidates(item, out)
    return
  }
  if (!node || typeof node !== 'object')
    return
  for (const value of Object.values(node))
    collectNumericCandidates(value, out)
}

function extractMidiPitch(midiValues: MidiValuesPayload): number {
  const direct = [midiValues.midi, midiValues.midiPitch, midiValues.pitch]
    .find(v => typeof v === 'number' && v >= 0 && v <= 127)
  if (typeof direct === 'number')
    return direct

  const candidates: number[] = []
  collectNumericCandidates(midiValues, candidates)
  const firstMidiLike = candidates.find(v => v >= 0 && v <= 127)
  return firstMidiLike ?? FALLBACK_MIDI_PITCH
}

function clearHighlight(): void {
  if (!svgHostRef.value)
    return
  for (const node of svgHostRef.value.querySelectorAll(`g.note.${HIGHLIGHT_CLASS}`))
    node.classList.remove(HIGHLIGHT_CLASS)
}

function applyHighlight(noteIds: Set<string>): void {
  if (!svgHostRef.value)
    return
  clearHighlight()
  for (const id of noteIds) {
    const el = svgHostRef.value.querySelector<SVGGElement>(`#${CSS.escape(id)}`)
    if (el)
      el.classList.add(HIGHLIGHT_CLASS)
  }
}

async function ensureWasm(): Promise<WasmModule> {
  if (wasmModule)
    return wasmModule
  const { default: createVerovioModule } = await import('verovio/wasm')
  const mod = await createVerovioModule() as WasmModule
  wasmModule = mod
  return mod
}

function stopVoice(noteId: string): void {
  toneNoteOff(noteId)
  activeVoiceIds.delete(noteId)
}

function stopAllVoices(): void {
  toneReleaseAll()
  activeVoiceIds.clear()
}

function stopAnimationLoop(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function startVoice(noteId: string): void {
  if (!toolkit || activeVoiceIds.has(noteId))
    return
  const midiValues = toolkit.getMIDIValuesForElement(noteId)
  const midiPitch = extractMidiPitch(midiValues)
  toneNoteOn(noteId, midiPitch)
  activeVoiceIds.add(noteId)
}

async function setRenderPage(page: number): Promise<void> {
  if (!toolkit)
    return
  if (page <= 0 || page === currentPage)
    return
  currentPage = page
  svgMarkup.value = toolkit.renderToSVG(page, false)
  await nextTick()
}

function syncVoices(nextNotes: Set<string>): void {
  for (const id of activeNoteIds) {
    if (!nextNotes.has(id))
      stopVoice(id)
  }
  for (const id of nextNotes) {
    if (!activeNoteIds.has(id))
      startVoice(id)
  }
}

function normalizeElementsAtTime(payload: ElementsAtTimePayload | unknown): {
  notes: Set<string>
  page: number
} {
  const notes = new Set<string>()
  const page = (
    payload
    && typeof payload === 'object'
    && typeof (payload as ElementsAtTimePayload).page === 'number'
  )
    ? Math.trunc((payload as ElementsAtTimePayload).page as number)
    : 0
  const arr = (
    payload
    && typeof payload === 'object'
    && Array.isArray((payload as ElementsAtTimePayload).notes)
  )
    ? (payload as ElementsAtTimePayload).notes as unknown[]
    : []
  for (const note of arr) {
    if (typeof note === 'string' && note.length)
      notes.add(note)
  }
  return { notes, page }
}

async function playbackTick(): Promise<void> {
  if (!toolkit || !isPlaying.value)
    return
  const elapsedMs = Math.max(0, Math.trunc(performance.now() - playStartedAtMs))
  const current = normalizeElementsAtTime(toolkit.getElementsAtTime(elapsedMs))
  if (current.page > 0 && current.page !== currentPage)
    await setRenderPage(current.page)

  syncVoices(current.notes)
  applyHighlight(current.notes)
  activeNoteIds = current.notes
  rafId = requestAnimationFrame(() => {
    void playbackTick()
  })
}

async function onPlay(): Promise<void> {
  if (!toolkit || !canPlay.value || isPlaying.value)
    return
  audioError.value = ''
  try {
    await ensureTonePlayback(String(config.public.pianoSampleBaseUrl ?? ''))
  }
  catch {
    audioError.value = 'Impossibile caricare i campioni del pianoforte. Verifica la connessione.'
    return
  }
  if (!isPaused.value)
    pausedAtMs = 0
  playStartedAtMs = performance.now() - pausedAtMs
  isPaused.value = false
  isPlaying.value = true
  stopAnimationLoop()
  rafId = requestAnimationFrame(() => {
    void playbackTick()
  })
}

function onPause(): void {
  if (!isPlaying.value)
    return
  pausedAtMs = Math.max(0, Math.trunc(performance.now() - playStartedAtMs))
  isPlaying.value = false
  isPaused.value = true
  stopAnimationLoop()
  stopAllVoices()
  clearHighlight()
}

function onStop(): void {
  isPlaying.value = false
  isPaused.value = false
  pausedAtMs = 0
  stopAnimationLoop()
  stopAllVoices()
  clearHighlight()
  activeNoteIds.clear()
}

function disposeToolkit(): void {
  if (toolkit) {
    toolkit.destroy()
    toolkit = null
  }
}

function paePayloadString(): string {
  return JSON.stringify(props.pae)
}

async function renderScore(): Promise<void> {
  onStop()
  renderError.value = ''
  svgMarkup.value = ''
  canPlay.value = false

  if (!props.pae?.clef || props.pae.data === undefined || props.pae.data === null) {
    renderError.value = 'Oggetto PAE non valido: servono almeno `clef` e `data`.'
    return
  }

  try {
    const mod = await ensureWasm()
    const { VerovioToolkit } = await import('verovio/esm')

    disposeToolkit()
    toolkit = new VerovioToolkit(mod) as VerovioToolkitInstance

    toolkit.setOptions({
      ...props.verovioOptions,
      inputFrom: 'pae',
    })

    if (props.validatePae) {
      const validation = toolkit.validatePAE(props.pae) as unknown
      const errors: string[] = []
      collectPaeValidationErrors(validation, errors)
      if (errors.length > 0) {
        disposeToolkit()
        renderError.value = errors.join(' ')
        return
      }
    }

    const payload = paePayloadString()
    const ok = toolkit.loadData(payload)
    if (!ok) {
      disposeToolkit()
      renderError.value = 'Caricamento PAE non riuscito (loadData).'
      return
    }

    const pages = toolkit.getPageCount()
    currentPage = Math.min(Math.max(1, props.page), Math.max(1, pages))
    svgMarkup.value = toolkit.renderToSVG(currentPage, false)
    toolkit.renderToMIDI()
    canPlay.value = true
  }
  catch (e) {
    disposeToolkit()
    renderError.value = e instanceof Error ? e.message : 'Errore durante il rendering Verovio.'
  }
}

watch(
  () => [props.pae, props.page, props.verovioOptions, props.validatePae] as const,
  () => {
    void renderScore()
  },
  { deep: true, immediate: true },
)

onBeforeUnmount(() => {
  onStop()
  disposeToolkit()
  disposeTonePlayback()
  wasmModule = null
})
</script>

<style scoped>
.verovio-pae {
  width: calc(100% - 500px);
  gap: 12px;
  margin-left: auto;
  margin-right: 50px;
  display: grid;  
  min-height: 4rem;
}

.verovio-pae__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.verovio-pae__controls button {
  border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
  border-radius: 0.4rem;
  padding: 0.35rem 0.75rem;
  font: inherit;
  color: inherit;
  background: transparent;
  cursor: pointer;
}

.verovio-pae__controls button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.verovio-pae__error {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  background: color-mix(in srgb, firebrick 12%, transparent);
  color: inherit;
  font-size: 0.9rem;
}

.verovio-pae__svg {
  width: 100%;
  overflow: auto;
  line-height: 0;
}

.verovio-pae__svg :deep(svg) {
  max-width: 100%;
  height: auto;
}

.verovio-pae__svg :deep(g.note.playing) {
  fill: crimson;
  stroke: crimson;
}

@media (max-width: 768px) {
  .verovio-pae {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  }

  .verovio-pae__controls {
    justify-content: flex-start;
  }
}
</style>
