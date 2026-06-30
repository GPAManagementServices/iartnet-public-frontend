<template>
  <canvas
    :id="canvasId"
    ref="canvasRef"
  />
</template>

<script setup lang="ts">
import type { HeaderPatchManifestRow, HeroCarouselItem } from '~/utils/headerPatchManifest'
import { useCables } from '~/composables/useCables'
import {
  compareCarouselSlugSequences,
  normalizeManifestRow,
  readPatchVar,
  slugForComparison,
  syncHeroCarouselPatchVars,
} from '~/utils/headerPatchManifest'

const props = withDefaults(defineProps<{
  patchDir?: string
}>(), {
  patchDir: '/header-patch',
})

const emit = defineEmits<{
  clicked: [href: string]
}>()

const config = useRuntimeConfig()
const { onLoaded } = useCables()

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')
// shallowRef is required here: cables.gl uses ES2022 private class fields (#listeners)
// which fail through Vue's reactive Proxy. shallowRef stores the object as-is.
const patchInstance = shallowRef<any>(null)

/** Stesso JSON servito al patch (`list` URL) prima della normalizzazione href. */
const apiListRows = ref<HeaderPatchManifestRow[]>([])
/** Indici allineati a `apiListRows`; usato per `items.value[index].href` al click. */
const items = ref<HeroCarouselItem[]>([])
const carouselListUrl = ref<string | null>(null)
const canvasId = ref('')
let disposed = false
let manifestReady = false
let cablesApi: { Patch: new (options: object) => any, exportedPatch: unknown, patch: unknown } | null = null

type CablesVarListener = (val: number) => void
let clickedVar: { off: (event: string, fn: CablesVarListener) => void } | null = null
let onClickedChange: CablesVarListener | null = null

const CAROUSEL_ITEMS_API = '/api/header-patch/carousel-items'

function getCarouselListUrl(): string {
  return new URL(CAROUSEL_ITEMS_API, window.location.origin).href
}

function readCablesSlugArray(patch: any): string[] | null {
  const raw = readPatchVar(patch, 'slugArray')
  if (!Array.isArray(raw))
    return null
  return raw.map(v => (typeof v === 'string' ? v : String(v)))
}

function syncCarouselDataToPatch(patch: any): void {
  syncHeroCarouselPatchVars(patch, carouselListUrl.value, items.value)

  if (import.meta.dev) {
    console.log('[HomepageHero] Cables count=%d', items.value.length)
    console.log('[HomepageHero] Vue count=%d', items.value.length)
  }
}

function logCarouselArraysComparison(patch: any, context: string) {
  const navigationSlugs = items.value.map(item => item.slug)
  const apiSlugs = apiListRows.value.map(row => row.slug)
  const cablesSlugs = readCablesSlugArray(patch)

  const vueVsApi = compareCarouselSlugSequences(
    navigationSlugs,
    apiSlugs,
    'vueNavigationItems',
    'apiListRows (/api/header-patch/carousel-items)',
  )
  const vueVsCables = cablesSlugs
    ? compareCarouselSlugSequences(
        navigationSlugs,
        cablesSlugs,
        'vueNavigationItems',
        'cablesPatch.slugArray',
      )
    : null

  console.log(`[CablesCanvas] arrays ${context}`, {
    listUrl: carouselListUrl.value,
    vueVsApi,
    vueVsCables,
    cablesSlugArrayReadable: cablesSlugs !== null,
    cablesTotalItems: readPatchVar(patch, 'totalItems'),
    note: vueVsApi.arraysEqual
      ? 'Vue e API hanno la stessa sequenza slug: items.value[i] corrisponde alla riga i del JSON del patch.'
      : 'ATTENZIONE: Vue e API differiscono (normalizzazione o fetch non allineati).',
    cablesNote: vueVsCables
      ? (vueVsCables.arraysEqual
          ? 'Vue e slugArray Cables coincidono: l’indice `clicked` dovrebbe puntare allo stesso oggetto.'
          : 'ATTENZIONE: l’indice `clicked` del patch può non corrispondere a items.value[index] per la navigazione.')
      : 'Impossibile leggere slugArray dal patch (getVar).',
  })
}

function logNavigationResolution(
  patch: any,
  rawIndex: number,
  index: number,
  item: HeroCarouselItem | undefined,
  href: string | undefined,
) {
  const indexInRange = Number.isInteger(index) && index >= 0 && index < items.value.length
  const hrefValid = Boolean(href?.startsWith('/digital-object/'))
  const cablesSlugAtIndex = readCablesSlugArray(patch)?.[index]
  const apiRowAtIndex = apiListRows.value[index]

  console.log('[CablesCanvas] navigation resolution', {
    logic: [
      '1) Il patch Cables imposta la variabile `clicked` con un indice numerico (slot visivo / interno al patch).',
      '2) Vue legge items.value[clickedIndex], popolato da GET /api/header-patch/carousel-items → normalizeManifestRow (href = buildHref(slug)).',
      '3) La navigazione parte solo se href inizia con /digital-object/ (stesso filtro di buildFilteredItems lato server).',
    ],
    clickedIndexFromPatch: index,
    rawIndexFromPatch: rawIndex,
    indexInRange,
    chosenItem: item ?? null,
    apiRowAtSameIndex: apiRowAtIndex ?? null,
    resolvedHref: href ?? '(empty)',
    hrefFromSlug: item ? `buildHref("${item.slug}")` : 'n/a',
    cablesSlugAtSameIndex: cablesSlugAtIndex ?? '(unreadable)',
    slugMatchesCablesAtIndex: item && cablesSlugAtIndex != null
      ? slugForComparison(item.slug) === slugForComparison(cablesSlugAtIndex)
      : null,
    willEmitNavigation: indexInRange && hrefValid,
    rejectReason: !indexInRange
      ? 'indice fuori da items.value'
      : !hrefValid
          ? 'href assente o non /digital-object/'
          : null,
  })
}

function detachClickedListener() {
  if (clickedVar && onClickedChange) {
    try {
      clickedVar.off('change', onClickedChange)
    }
    catch {
      // ignore
    }
  }
  clickedVar = null
  onClickedChange = null
}

function disposePatch() {
  detachClickedListener()
  const patch = patchInstance.value
  if (!patch)
    return

  try {
    patch.pause?.()
    if (typeof patch.destroy === 'function')
      patch.destroy()
    else if (typeof patch.dispose === 'function')
      patch.dispose()
  }
  catch {
    // ignore cleanup errors
  }

  patchInstance.value = null
  if ((window as any).CABLES)
    (window as any).CABLES.patch = null
}

function attachClickedListener(patch: any) {
  detachClickedListener()
  const cablesVar = patch.getVar('clicked')
  if (!cablesVar)
    return

  onClickedChange = (rawIndex: number) => {
    if (disposed)
      return
    const index = typeof rawIndex === 'number' ? rawIndex : Number(rawIndex)
    const item = items.value[index]
    const href = item?.href

    logCarouselArraysComparison(patch, 'on-click')
    logNavigationResolution(patch, rawIndex, index, item, href)

    console.log('[CablesCanvas] click', {
      clickedIndex: index,
      rawIndex,
      resolvedHref: href ?? '(empty)',
      resolvedSlug: item?.slug ?? '(empty)',
      title: item?.title,
      itemsLength: items.value.length,
      apiListLength: apiListRows.value.length,
      showHiddenData: String(config.public.showHiddenData) === 'true',
    }, { item })

    if (!Number.isInteger(index) || index < 0 || index >= items.value.length)
      return
    if (href?.startsWith('/digital-object/'))
      emit('clicked', href)
  }

  cablesVar.on('change', onClickedChange)
  clickedVar = cablesVar
}

const initPatch = (CABLES: typeof cablesApi) => {
  if (!CABLES || disposed || !carouselListUrl.value || items.value.length === 0)
    return

  nextTick(() => {
    if (disposed || !canvasRef.value)
      return

    // onPatchLoaded fires synchronously during the CABLES.Patch constructor,
    // before the assignment to patchInstance.value completes. We use a Promise
    // so .then() defers to a microtask, guaranteeing patchInstance.value is set.
    let onPatchReady: () => void
    const patchReady = new Promise<void>(resolve => onPatchReady = resolve)

    patchInstance.value = new CABLES.Patch({
      prefixAssetPath: `${props.patchDir}/`,
      assetPath: `${props.patchDir}/assets/`,
      jsPath: `${props.patchDir}/js`,
      glCanvasId: canvasId.value,
      glCanvasResizeToWindow: true,
      canvas: { alpha: true, premultipliedAlpha: true },
      variables: {
        globalState: 'home',
        SidebarVisible: 0,
        // Absolute URL: cables prepends prefixAssetPath to relative paths only.
        list: carouselListUrl.value,
      },
      // Deep clone so the constructor can mutate without corrupting the original (needed for remounts)
      patch: JSON.parse(JSON.stringify(CABLES.exportedPatch)),
      onPatchLoaded: () => onPatchReady(),
    })
    CABLES.patch = patchInstance.value

    patchReady.then(() => {
      if (disposed || !patchInstance.value)
        return
      syncCarouselDataToPatch(patchInstance.value)
      logCarouselArraysComparison(patchInstance.value, 'on-patch-ready')
      attachClickedListener(patchInstance.value)
    })
  })
}

function tryInitPatch() {
  if (disposed || !manifestReady || !cablesApi)
    return
  initPatch(cablesApi)
}

// Register while setup scope is active (avoids onScopeDispose warning).
onLoaded(({ CABLES }) => {
  cablesApi = CABLES
  tryInitPatch()
})

onMounted(async () => {
  canvasId.value = `glcanvas-${Date.now()}`

  try {
    carouselListUrl.value = getCarouselListUrl()
    const payload = await $fetch<HeaderPatchManifestRow[]>(carouselListUrl.value)
    if (disposed)
      return

    apiListRows.value = payload
    items.value = payload.map(normalizeManifestRow)
    if (items.value.length === 0) {
      console.warn('[CablesCanvas] no valid carousel items after filter')
      return
    }

    if (import.meta.dev) {
      console.log('[HomepageHero] Vue count=%d', items.value.length)
      console.log('[HomepageHero] API rows', apiListRows.value.map((row, index) => ({
        index,
        id: row.slug,
        status: 'published',
        hasImageUrl: Boolean(row.cover || row.coverLocal),
      })))
    }

    manifestReady = true
    tryInitPatch()
  }
  catch (err) {
    console.error('[CablesCanvas] failed to load manifest', err)
  }
})

onBeforeUnmount(() => {
  disposed = true
  manifestReady = false
  cablesApi = null
  disposePatch()
  carouselListUrl.value = null
  apiListRows.value = []
  items.value = []
})
</script>
