<template>
  <div>
    <HeaderMain :title="$t('Narratives')" />
    <main v-if="narratives?.success" class="app-padding">
      <AppBlock>
        <div class="narratives__grid">
          <CardForNarratives
            v-for="(item, index) in narratives.data"
            :id="item.id"
            :key="item.id"
            :slug="item.ext_json.Header.SEO?.slug || item.id"
            :title="item.name"
            :subtitle="item.ext_json.Header.SubTitle || ''"
            :tags="narrativeTags(item)"
            :cover-image="item.ext_json.Header.IndexImage?.URL || item.ext_json.Header.Image?.URL"
            :title-box-position="titleBoxPositionForIndex(index)"
          />
        </div>
      </AppBlock>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { TStoriesTypeData, TStoriesTypeList } from '#shared/types/api'
import type { NarrativeCardTitleBoxPosition } from '~/components/Narratives/CardForNarratives.vue'
import CardForNarratives from '~/components/Narratives/CardForNarratives.vue'

/** Posizione del box titolo per indice `i` nella lista narratives dev. */
const TITLE_BOX_BY_INDEX: NarrativeCardTitleBoxPosition[] = [
  'bottom-right',
  'bottom-right',
  'bottom-right',
  'bottom-right',
]

function titleBoxPositionForIndex(index: number): NarrativeCardTitleBoxPosition {
  return TITLE_BOX_BY_INDEX[index] ?? 'bottom-left'
}

function narrativeTags(item: TStoriesTypeData): string[] {
  const chip = item.ext_json?.Header?.Chip?.trim()
  return chip ? [chip] : []
}

const { locale } = useI18n()

const { data: narratives, refresh } = await useFetch<TStoriesTypeList>('/api/narratives', {
  key: 'narratives-index',
  query: { locale },
  getCachedData(key, nuxtApp) {
    return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
  },
})

onMounted(() => {
  if (!narratives.value?.success)
    void refresh()
})
</script>

<style lang="postcss" scoped>
main {
  margin-bottom: 96px;
}
.narratives__grid {
  --columns: 1;
  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  column-gap: var(--app-padding);

  @media (min-width: 768px) {
    /*--columns: 2;*/
  }

  @media (min-width: 1024px) {
    /*--columns: 3;*/
  }
}
</style>
