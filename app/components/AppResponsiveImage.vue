<script setup lang="ts">
import type { SignedMediaFm, SignedMediaFit } from '#shared/types/signedMedia'
import type { SignedMediaFetch } from '#shared/utils/signedMediaUrl'
import { fetchSignedMediaUrl } from '#shared/utils/signedMediaUrl'

/**
 * Immagine responsive: `srcset` via `/api/media/sign` + `path` Curator.
 * Senza `fm` prop: prova webp → senza fm → jpg su `@error` dell’`<img>`.
 * Open Graph: usare `useSignedMediaUrl` con una sola larghezza, non questo componente.
 */
const props = withDefaults(
  defineProps<{
    path: string | null | undefined
    alt: string
    sizes?: string
    widths?: number[]
    fit?: SignedMediaFit
    /** Se impostato, gli errori img passano subito a `fallbackSrc` (se presente). */
    fm?: SignedMediaFm
    /** Altezza massima (px) alla larghezza di riferimento del srcset; scalata per ogni `widths`. */
    h?: number | null
    priority?: boolean
    fallbackSrc?: string | null
    imgClass?: string
  }>(),
  {
    sizes: '(max-width: 768px) 100vw, min(100vw, 1400px)',
    widths: () => [480, 768, 1200, 1600],
    fit: 'max',
    priority: false,
    fallbackSrc: null,
    imgClass: '',
  },
)

const requestFetch = useRequestFetch() as SignedMediaFetch

const explicitFm = computed(() => props.fm)
const autoFormatPhase = ref<'webp' | 'none' | 'jpg'>('webp')

watch(
  () => props.fm,
  (fm) => {
    if (!fm)
      autoFormatPhase.value = 'webp'
  },
)

function resolveFm(): SignedMediaFm | undefined {
  if (explicitFm.value)
    return explicitFm.value
  if (autoFormatPhase.value === 'webp')
    return 'webp'
  if (autoFormatPhase.value === 'jpg')
    return 'jpg'
  return undefined
}

const entries = ref<Array<{ w: number, url: string }>>([])
const pending = ref(false)
const signFailed = ref(false)
const useUrlFallback = ref(false)

async function resolveSrcset(): Promise<void> {
  const p = (props.path ?? '').trim()
  if (!p) {
    entries.value = []
    signFailed.value = false
    useUrlFallback.value = false
    return
  }

  if (useUrlFallback.value && props.fallbackSrc) {
    entries.value = []
    return
  }

  pending.value = true
  signFailed.value = false
  try {
    const fm = resolveFm()
    const referenceWidth = Math.max(...props.widths)
    const results = await Promise.all(
      props.widths.map(async (w) => {
        const h = props.h != null && referenceWidth > 0
          ? Math.round(props.h * w / referenceWidth)
          : undefined
        return {
          w,
          url: await fetchSignedMediaUrl(requestFetch, { path: p, w, h, fit: props.fit, fm }),
        }
      }),
    )
    entries.value = results
  }
  catch {
    signFailed.value = true
    entries.value = []
    if (props.fallbackSrc)
      useUrlFallback.value = true
  }
  finally {
    pending.value = false
  }
}

watch(
  () => [(props.path ?? '').trim(), props.fit, props.fm, props.h, autoFormatPhase.value, props.widths.join(',')],
  () => {
    void resolveSrcset()
  },
  { immediate: true },
)

const srcset = computed(() =>
  entries.value.map(e => `${e.url} ${e.w}w`).join(', '),
)

const src = computed(() => {
  if (useUrlFallback.value && props.fallbackSrc)
    return props.fallbackSrc
  if (!entries.value.length)
    return props.fallbackSrc ?? ''
  return entries.value[entries.value.length - 1]?.url ?? ''
})

function onImgError(): void {
  if (explicitFm.value) {
    if (props.fallbackSrc && !useUrlFallback.value)
      useUrlFallback.value = true
    return
  }
  if (autoFormatPhase.value === 'webp') {
    autoFormatPhase.value = 'none'
    return
  }
  if (autoFormatPhase.value === 'none') {
    autoFormatPhase.value = 'jpg'
    return
  }
  if (props.fallbackSrc)
    useUrlFallback.value = true
}

const showImg = computed(() => Boolean(src.value))
const showBrokenPlaceholder = computed(() =>
  signFailed.value && !props.fallbackSrc && !src.value && !pending.value,
)

defineExpose({ refresh: resolveSrcset })
</script>

<template>
  <span
    v-if="pending && !entries.length && !useUrlFallback"
    class="app-responsive-image app-responsive-image--pending"
    aria-hidden="true"
  />
  <img
    v-else-if="showImg"
    :src="src"
    :srcset="useUrlFallback || !srcset ? undefined : srcset"
    :sizes="useUrlFallback || !srcset ? undefined : sizes"
    :alt="alt"
    :loading="priority ? 'eager' : 'lazy'"
    :fetchpriority="priority ? 'high' : undefined"
    decoding="async"
    :class="imgClass"
    @error="onImgError"
  >
  <span
    v-else-if="showBrokenPlaceholder"
    class="app-responsive-image app-responsive-image--broken"
    role="img"
    :aria-label="alt"
  />
</template>

<style scoped>
.app-responsive-image--pending,
.app-responsive-image--broken {
  display: block;
  width: 100%;
  min-height: 120px;
  background: color-mix(in srgb, var(--ui-neutral-border, #ccc) 35%, transparent);
  border-radius: inherit;
}
</style>
