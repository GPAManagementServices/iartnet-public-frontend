<template>
  <div
    v-if="hasDomandeRisposte"
    class="interview-meta-flow"
  >
    <template v-for="(block, index) in flowBlocks" :key="`block-${index}`">
      <div
        v-if="block.kind === 'text'"
        class="interview-meta-flow__text"
      >
        <OsdMetaField
          do-not-show-label
          :label="block.item.label"
          :value="block.item.displayValue"
        />
      </div>
      <div
        v-else
        class="interview-inline-image-box"
      >
        <figure
          v-for="(image, imageIndex) in block.images"
          :key="`${index}-${imageIndex}`"
          class="interview-inline-image"
        >
          <img
            :src="image.url"
            :alt="image.caption"
            class="interview-inline-image__img"
          >
          <figcaption
            v-if="image.caption"
            class="interview-inline-image__caption"
          >
            {{ image.caption }}
          </figcaption>
        </figure>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { INTERVIEW_DomandeRisposteTarget, INTERVIEW_InlineImagePlacement } from '~/utils/InterviewArray'
import OsdMetaField from '../OsdMetaField/OsdMetaField.vue'

interface OsdMetaProps {
  dataInterview?: INTERVIEW_DomandeRisposteTarget
  inlineImages?: INTERVIEW_InlineImagePlacement[]
}

const props = defineProps<OsdMetaProps>()

const interviewData = computed(() => props.dataInterview ?? { domande: [], risposte: [] })

function asDisplayText(value: unknown): string {
  if (value == null)
    return ''
  return String(value)
}

function hasDisplayText(value: unknown): boolean {
  return asDisplayText(value).trim().length > 0
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function formatInterviewQaDisplay(value: string): string {
  const text = value.replace(/\r\n/g, '\n').trim()
  if (!text.length)
    return ''

  const blockMatch = text.match(/^([^\n]+)\n+([\s\S]*)$/)
  if (blockMatch) {
    const speaker = blockMatch[1]!.trim()
    const body = blockMatch[2]!.replace(/^\s*\n+/, '').trim()
    const speakerHtml = `<strong>${escapeHtml(speaker)}</strong>`
    if (!body.length)
      return speakerHtml
    return `${speakerHtml} ${escapeHtml(body).replaceAll('\n', '<br />')}`
  }

  return escapeHtml(text).replaceAll('\n', '<br />')
}

function rispostaNumber(label: string): number | null {
  const match = /^risposta_(\d+)$/.exec(label)
  if (!match)
    return null
  const n = Number.parseInt(match[1]!, 10)
  return Number.isFinite(n) ? n : null
}

const imagesAfterDomanda = computed(() => {
  const map = new Map<number, INTERVIEW_InlineImagePlacement[]>()
  for (const image of props.inlineImages ?? []) {
    const list = map.get(image.dopoDomanda) ?? []
    list.push(image)
    map.set(image.dopoDomanda, list)
  }
  return map
})

const hasDomandeRisposte = computed(() => {
  const { domande, risposte } = interviewData.value
  return (domande?.length ?? 0) > 0 || (risposte?.length ?? 0) > 0
})

type DomandeRisposteItem =
  | { tipo: 'domanda' | 'risposta', label: string, value: string, displayValue: string }
  | { tipo: 'immagine', label: string, value: string, displayValue: string, url: string, caption: string }

const domandeRisposteAlternati = computed(() => {
  const domande = interviewData.value.domande ?? []
  const risposte = interviewData.value.risposte ?? []
  const len = Math.max(domande.length, risposte.length)
  const items: DomandeRisposteItem[] = []

  for (let i = 0; i < len; i++) {
    const domanda = domande[i]
    const risposta = risposte[i]
    if (domanda && hasDisplayText(domanda.value)) {
      const value = asDisplayText(domanda.value)
      items.push({
        tipo: 'domanda',
        label: domanda.label,
        value,
        displayValue: formatInterviewQaDisplay(value),
      })
    }
    if (risposta && hasDisplayText(risposta.value)) {
      const value = asDisplayText(risposta.value)
      items.push({
        tipo: 'risposta',
        label: risposta.label,
        value,
        displayValue: formatInterviewQaDisplay(value),
      })
      const dopoDomanda = rispostaNumber(risposta.label)
      if (dopoDomanda != null) {
        for (const image of imagesAfterDomanda.value.get(dopoDomanda) ?? []) {
          items.push({
            tipo: 'immagine',
            label: '',
            value: '',
            displayValue: '',
            url: image.url,
            caption: image.caption,
          })
        }
      }
    }
  }

  return items
})

type FlowBlock =
  | { kind: 'text', item: Extract<DomandeRisposteItem, { tipo: 'domanda' | 'risposta' }> }
  | { kind: 'images', images: Array<{ url: string, caption: string }> }

const flowBlocks = computed(() => {
  const blocks: FlowBlock[] = []
  let pendingImages: Array<{ url: string, caption: string }> = []

  const flushImages = () => {
    if (pendingImages.length === 0)
      return
    blocks.push({ kind: 'images', images: [...pendingImages] })
    pendingImages = []
  }

  for (const item of domandeRisposteAlternati.value) {
    if (item.tipo === 'immagine') {
      pendingImages.push({ url: item.url, caption: item.caption })
      continue
    }
    flushImages()
    blocks.push({ kind: 'text', item })
  }
  flushImages()

  return blocks
})
</script>

<style lang="postcss" scoped>
.interview-meta-flow {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.interview-meta-flow__text {
  display: flex;
  flex-direction: column;
  width: calc(100% - 500px);
  margin-left: auto;
  margin-right: 50px;
  box-sizing: border-box;
}

.interview-inline-image-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  max-width: 1440px;
  margin-top: 2.5rem;
  margin-bottom: 2.5rem;
  margin-left: auto;
  margin-right: auto;
  padding: 3rem 7rem 2.5rem 3rem;
  box-sizing: border-box;
}

.interview-inline-image {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: fit-content;
  max-width: 100%;
  margin: 0;
}

.interview-inline-image + .interview-inline-image {
  margin-top: 2.5rem;
}

.interview-inline-image__img {
  display: block;
  max-width: 100%;
  max-height: 800px;
  width: auto;
  height: auto;
  object-fit: contain;
}

.interview-inline-image__caption {
  margin: 0.5rem 0 0;
  max-width: 100%;
  font-size: var(--ui-text-small, 0.875rem);
  line-height: 1.4;
  text-align: left;
  color: var(--gray-7, #7b7b7b);
}

/* tablet and below: align text to OsdAbout */
@media (max-width: 1024px) {
  .interview-meta-flow__text {
    width: calc(100% - 100px);
    margin-left: 50px;
    margin-right: 50px;
  }

  .interview-inline-image-box {
    padding: 2.5rem 4rem 2rem 2rem;
  }
}

@media (max-width: 768px) {
  .interview-meta-flow__text {
    width: 100%;
    max-width: 100%;
    margin-left: 10px;
    margin-right: 0;
    padding: 0 1rem;
    box-sizing: border-box;
  }

  .interview-meta-flow__text :deep(.field) {
    --osd-meta-value-fs: 18px;
  }

  .interview-inline-image-box {
    width: 100%;
    max-width: 100%;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    margin-left: auto;
    margin-right: auto;
    padding: 1.5rem 2rem 1.5rem 0.75rem;
  }

  .interview-inline-image + .interview-inline-image {
    margin-top: 1.5rem;
  }
}

.interview-meta-flow :deep(.field) {
  border-top: none;
}

.interview-meta-flow :deep(.value strong) {
  font-weight: 700;
}
</style>
