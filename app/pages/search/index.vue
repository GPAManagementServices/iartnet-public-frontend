<template>
  <div
    class="search-page"
    :class="{ 'search-page--idle': !q }"
  >
    <HeaderMain
      style="padding-top: 96px;"
      :title="$t('Try the search bar below:')"
    />
    <main class="app-padding">
      <AppBlock class="main">
        <section class="app-content">
          <div ref="searchFieldRef" class="search-field">
            <div class="search-field__anchor">
              <div class="search-row">
                <input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  type="search"
                  class="search-input"
                  :class="{ 'search-input--dropdown-open': showSuggestionsPanel }"
                  :placeholder="$t('Search…')"
                  @input="onSearchInput"
                  @pointerdown="onSearchInputPointerDown"
                  @keydown.enter="runSearch"
                >
                <button
                  type="button"
                  class="search-icon"
                  :aria-label="$t('Search')"
                  :disabled="!canSubmit"
                  @click="runSearch"
                >
                  <img
                    :src="dbSearchIcon"
                    alt=""
                    class="search-icon__img"
                    aria-hidden="true"
                  >
                </button>
              </div>
              <ul
                v-if="showSuggestionsPanel"
                class="suggested-terms__list"
                role="listbox"
                :aria-label="$t('Suggested terms')"
              >
                <li
                  v-for="suggestion in suggestedTermsList"
                  :key="suggestion.term"
                  class="suggested-terms__item"
                  role="option"
                  @mousedown.prevent
                  @click="addToSearchQuery(suggestion.term)"
                >
                  {{ suggestion.term }}
                </li>
              </ul>
            </div>
          </div>

          <div v-if="q" class="search-results">
            <p v-if="pendingInitialSearch" class="search-results__state">
              {{ $t('Searching') }}
            </p>
            <p v-else-if="searchError" class="search-results__state search-results__state--error">
              {{ $t('SearchFailed') }}
            </p>

            <template v-else-if="searchData && searchData.count > 0">
              <ul class="search-results__list">
                <li v-for="item in searchData.results" :key="item.stable_id" class="search-results__item">
                  <SearchItem :item="item" />
                </li>
              </ul>

              <div
                v-if="hasMoreResults"
                ref="loadMoreSentinelRef"
                class="search-results__sentinel"
                aria-hidden="true"
              />
              <p v-if="loadingMoreResults" class="search-results__state">
                {{ $t('LoadingMoreResults') }}
              </p>
            </template>
            <p v-else-if="q && searchData && searchData.count === 0" class="search-results__state">
              *{{ q }}*
              {{ $t('NoResults') }}
            </p>
          </div>
        </section>
      </AppBlock>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { SearchResult, SuggestedTermsResult, SuggestedTermsResultItem } from '#shared/types/api'
import dbSearchIcon from '@/assets/icons/DBSearch.svg'
import SearchItem from '~/components/Search/SearchItem.vue'

const SEARCH_QUERY_TOKEN_SPLIT = /\s+/
const SEARCH_PAGE_SIZE = 8
const SEARCH_API_PATH = '/api/search' as string
const SUGGESTED_TERMS_API_PATH = '/api/suggested_terms' as string
const EMPTY_SEARCH_RESULT: SearchResult = {
  q: '',
  mode: 'AND',
  limit: SEARCH_PAGE_SIZE,
  offset: 0,
  count: 0,
  results: [],
}

const route = useRoute()
const localePath = useLocalePath()
const router = useRouter()
const { locale } = useI18n()
const suggestedTermsList = ref<SuggestedTermsResultItem[]>([])
const suggestionsVisible = ref(true)
/** Dopo una ricerca (invio/pulsante o scelta da lista), non richiamare /api/suggested_terms finché l'utente non modifica di nuovo il testo. */
const suppressSuggestedTermsFetch = ref(false)
const searchFieldRef = ref<HTMLElement | null>(null)

const searchInputRef = ref<HTMLInputElement | null>(null)
const loadMoreSentinelRef = ref<HTMLElement | null>(null)
const searchQuery = ref((route.query.q as string) ?? '')
const q = computed(() => (route.query.q as string)?.trim() ?? '')
const canSubmit = computed(() => Boolean(searchQuery.value?.trim()))
const showSuggestionsPanel = computed(
  () => suggestionsVisible.value && suggestedTermsList.value.length > 0,
)
const searchData = ref<SearchResult>(EMPTY_SEARCH_RESULT)
const loadingMoreResults = ref(false)
const pendingInitialSearch = ref(false)
const searchError = ref<unknown>(null)
const hasMoreResults = computed(() => searchData.value.results.length < searchData.value.count)

let loadMoreObserver: IntersectionObserver | null = null
let activeSearchRequestId = 0

function onSearchInput() {
  suppressSuggestedTermsFetch.value = false
  suggestionsVisible.value = true
}

function onSearchInputPointerDown() {
  if (suggestionsVisible.value && suggestedTermsList.value.length > 0)
    suggestionsVisible.value = false
}

function onDocumentPointerDown(e: PointerEvent) {
  const root = searchFieldRef.value
  if (!root || !suggestionsVisible.value || suggestedTermsList.value.length === 0)
    return
  const target = e.target as Node | null
  if (target && !root.contains(target))
    suggestionsVisible.value = false
}

onMounted(() => {
  searchInputRef.value?.focus()
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  loadMoreObserver?.disconnect()
  loadMoreObserver = null
})

const debouncedSearchQuery = useDebounce(searchQuery, 150)
const suggestedTermsQuery = computed(() => {
  if (suppressSuggestedTermsFetch.value)
    return ''
  const q = debouncedSearchQuery.value?.trim() ?? ''
  return q.length >= 3 ? q : ''
})

const { data: suggestedTerms } = await useAsyncData<SuggestedTermsResult | null>(
  computed(() => suggestedTermsQuery.value ? `suggested_terms-${suggestedTermsQuery.value}` : 'suggested_terms-disabled'),
  () => (suggestedTermsQuery.value ? $fetch<SuggestedTermsResult>(SUGGESTED_TERMS_API_PATH, { query: { q: suggestedTermsQuery.value } }) : Promise.resolve(null)),
  { watch: [suggestedTermsQuery] },
)

watch(suggestedTerms, () => {
  // prendo in considerazione solo i termini che hanno lang uguale a locale.value e che non sono già presenti nella query
  if (suggestedTerms.value && suggestedTerms.value.suggestions)
    suggestedTermsList.value = suggestedTerms.value.suggestions.filter((suggestion: any) => suggestion.lang === locale.value && !searchQuery.value?.includes(suggestion.term)) ?? []
  else
    suggestedTermsList.value = []
})

async function fetchSearchPage(offset: number): Promise<SearchResult> {
  if (!q.value)
    return { ...EMPTY_SEARCH_RESULT }

  return await $fetch<SearchResult>(SEARCH_API_PATH, {
    query: {
      q: q.value,
      locale: locale.value,
      limit: SEARCH_PAGE_SIZE,
      offset,
    },
  })
}

async function refreshSearchResults() {
  const currentRequestId = ++activeSearchRequestId
  loadingMoreResults.value = false
  searchError.value = null

  if (!q.value) {
    pendingInitialSearch.value = false
    searchData.value = { ...EMPTY_SEARCH_RESULT }
    return
  }

  pendingInitialSearch.value = true

  try {
    const nextPage = await fetchSearchPage(0)
    if (currentRequestId !== activeSearchRequestId)
      return
    searchData.value = nextPage
  }
  catch (error) {
    if (currentRequestId !== activeSearchRequestId)
      return
    searchData.value = { ...EMPTY_SEARCH_RESULT, q: q.value }
    searchError.value = error
  }
  finally {
    if (currentRequestId === activeSearchRequestId)
      pendingInitialSearch.value = false
  }
}

async function loadMoreResults() {
  if (!q.value || pendingInitialSearch.value || loadingMoreResults.value || !hasMoreResults.value)
    return

  const currentQuery = q.value
  const currentLocale = locale.value
  const nextOffset = searchData.value.results.length

  loadingMoreResults.value = true

  try {
    const nextPage = await $fetch<SearchResult>(SEARCH_API_PATH, {
      query: {
        q: currentQuery,
        locale: currentLocale,
        limit: SEARCH_PAGE_SIZE,
        offset: nextOffset,
      },
    })

    if (currentQuery !== q.value || currentLocale !== locale.value)
      return

    const knownIds = new Set(searchData.value.results.map(item => item.stable_id))
    const appendedResults = nextPage.results.filter(item => !knownIds.has(item.stable_id))
    searchData.value = {
      ...nextPage,
      results: [...searchData.value.results, ...appendedResults],
      offset: nextOffset,
    }
  }
  catch (error) {
    if (currentQuery === q.value && currentLocale === locale.value)
      searchError.value = error
  }
  finally {
    if (currentQuery === q.value && currentLocale === locale.value)
      loadingMoreResults.value = false
  }
}

function observeLoadMoreSentinel(target: HTMLElement | null) {
  loadMoreObserver?.disconnect()
  loadMoreObserver = null

  if (!target || !import.meta.client)
    return

  const rect = target.getBoundingClientRect()
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight
  const isAlreadyNearViewport = rect.top <= viewportHeight + 200

  if (isAlreadyNearViewport)
    loadMoreResults()

  loadMoreObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting)
        loadMoreResults()
    })
  }, { rootMargin: '200px 0px' })

  loadMoreObserver.observe(target)
}

await refreshSearchResults()

watch([q, locale], async () => {
  await refreshSearchResults()
})

watch(
  () => loadMoreSentinelRef.value,
  async (value) => {
    await nextTick()
    observeLoadMoreSentinel(value)
  },
  { flush: 'post' },
)

watch(q, (value) => {
  if (searchQuery.value !== value)
    searchQuery.value = value
})

watch(searchQuery, () => {
  // se searchQuery.value è vuota, svuoto la lista dei termini suggeriti e il risultato della ricerca
  if (!searchQuery.value) {
    suggestedTermsList.value = []
    searchData.value = { ...EMPTY_SEARCH_RESULT }
    searchError.value = null
    suppressSuggestedTermsFetch.value = false
    router.push({
      path: localePath('search'),
      query: { q: undefined },
    })
  }
})

/** Sostituisce l'ultimo token (parola) della query con il termine scelto; mantiene i token precedenti. */
function replaceLastSearchToken(query: string, chosen: string): string {
  const trimmed = query.trim()
  if (!trimmed)
    return chosen.trim()
  const tokens = trimmed.split(SEARCH_QUERY_TOKEN_SPLIT).filter(Boolean)
  tokens[tokens.length - 1] = chosen.trim()
  return tokens.join(' ')
}

function addToSearchQuery(term: string) {
  const next = replaceLastSearchToken(searchQuery.value ?? '', term)
  if (!next)
    return
  suppressSuggestedTermsFetch.value = true
  searchQuery.value = next
  suggestedTermsList.value = []
  searchInputRef.value?.focus()
  runSearch()
}

function runSearch() {
  const query = searchQuery.value?.trim()
  // if (!query) return
  suppressSuggestedTermsFetch.value = true
  suggestionsVisible.value = false
  if (query) {
    router.push({
      path: localePath('search'),
      query: { q: query },
    })
  }
  else {
    router.push({
      path: localePath('search'),
    })
  }
}
</script>

<style lang="postcss" scoped>
.search-page--idle {
  --search-idle-footer-gap: 50px;
  --search-idle-footer-margin: 48px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--search-idle-footer-gap) - var(--search-idle-footer-margin));
  min-height: calc(100dvh - var(--search-idle-footer-gap) - var(--search-idle-footer-margin));
}

.search-page--idle main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.search-page--idle main :deep(.ui-block.main) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.search-page--idle main :deep(.app-block__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;
  margin-block: 0 var(--app-padding);
  @supports not (margin-block: 0) {
    margin-top: 0;
    margin-bottom: var(--app-padding);
  }
}

.search-page--idle .app-content {
  width: 100%;
}

.search-field {
  display: flex;
  justify-content: center;
  width: min(calc(640px + 0.5em + 42px), 100%);
  max-width: 100%;
  margin-inline: auto;
}

.search-field__anchor {
  position: relative;
  width: 100%;
}

.search-row {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 0.5em;
  align-items: start;
}

.search-input {
  padding: 0.5em 0.75em;
  font-size: var(--text);
  border: 1px solid #aaa;
  border-radius: 4px;
  width: 100%;
  max-width: 640px;
  height: 49px;
  box-sizing: border-box;
}

.search-input--dropdown-open {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.suggested-terms__list {
  position: absolute;
  inset-inline-start: 0;
  inset-inline-end: calc(0.5em + 42px);
  top: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid #aaa;
  border-top: none;
  border-radius: 0 0 4px 4px;
  background: #fff;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  z-index: 2;
  --suggestion-line: 3rem;
  max-height: calc(5 * var(--suggestion-line));
  overflow-y: auto;
}

.suggested-terms__item {
  padding: 0.5em 0.75em;
  font-size: var(--text);
  cursor: pointer;
  line-height: 1.4;
  min-height: calc(var(--suggestion-line) - 1px);
  box-sizing: border-box;
}

.suggested-terms__item:hover {
  background: rgb(0 0 0 / 0.06);
}

.search-icon {
  padding: 0.25em;
  margin: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: 42px;
  width: 42px;
  box-sizing: border-box;
}

.search-icon:hover:not(:disabled) {
  background: rgba(0 0 0 / 0.06);
}

.search-icon:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.search-icon__img {
  display: block;
  width: 42px;
  height: 42px;
}

.app-content p {
  max-width: 60ch;
  margin-inline: auto;
  font-size: var(--text);
}

.search-results {
  width: 100%;
  margin-top: 1.5rem;
  font-size: var(--text);
}

.search-results__state {
  margin: 0;
  color: var(--color-text-muted, #666);
}

.search-results__state--error {
  color: var(--color-error, #c00);
}

.search-results__list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;
}

.search-results__item {
  flex: 1 1 280px;
  min-width: 0;
}

.search-results__item a {
  font-weight: var(--medium);
}

.search-results__sentinel {
  width: 100%;
  height: 24px;
  margin-top: 0.5rem;
  pointer-events: none;
}
</style>
