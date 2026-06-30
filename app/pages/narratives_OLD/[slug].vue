<template>
  <ClientOnly>
    <div class="narrative-page">
      <header v-if="validHeaderData" class="story-header story-header--fullpage">
        <StoryHeader v-bind="validHeaderData" />
      </header>
      <main v-if="sectionsList?.length" class="main-content">
        <div
          ref="panelsRoot"
          class="narrative-panels"
        >
          <template
            v-for="block in sectionBlocks"
            :key="blockListKey(block)"
          >
            <StoryFullscreenStack
              v-if="block.type === 'fullscreen-stack'"
              :sections="block.sections"
              :indices="block.indices"
              :narrative-slug="String(route.params.slug)"
            />
            <StorySectionRenderer
              v-else
              :key="`section-${block.index}-${block.section.Kind}`"
              :section="block.section"
              :index="block.index"
              :narrative-slug="String(route.params.slug)"
            />
          </template>
        </div>
        <div class="narrative-footer">
          <StoryBibliographySection :items="bibliographyList" :title="$t('Bibliografia')" />
          <StorySitographySection :items="sitographyList" :title="$t('Sitografia')" />
          <StoryCreditsSection :items="creditsList" :title="$t('Credits')" />
          <StoryCatalogoOpereCitateSection :items="catalogoOpereCitateList" :title="$t('Catalogo')" />
        </div>
      </main>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { TStoryBibliographyType, TStoryCatalogoOpereCitateType, TStoryCreditsType, TStoryHeaderType, TStorySection, TStorySitographyType } from '#shared/types/api'
import { useFetch } from '#app'
import { isAbsoluteHttpUrl } from '#shared/utils/narrativeHeroImage'
import { blockListKey, buildStorySectionBlocks } from '#shared/utils/storySectionBlocks'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import StoryBibliographySection from '~/components/Narratives_OLD/sections/StoryBibliographySection.vue'
import StoryCatalogoOpereCitateSection from '~/components/Narratives_OLD/sections/StoryCatalogoOpereCitateSection.vue'
import StoryCreditsSection from '~/components/Narratives_OLD/sections/StoryCreditsSection.vue'
import StorySitographySection from '~/components/Narratives_OLD/sections/StorySitographySection.vue'
import StoryFullscreenStack from '~/components/Narratives_OLD/StoryFullscreenStack.vue'
import StoryHeader from '~/components/Narratives_OLD/StoryHeader.vue'
import StorySectionRenderer from '~/components/Narratives_OLD/StorySectionRenderer.vue'
import { resetAppHeaderTheme, syncAppHeaderThemeFromStoryHeader } from '~/composables/useAppHeaderTheme'
import { useResolvedNarrativeCardImage } from '~/composables/useResolvedNarrativeCardImage'
import { useStoryPanelScroll } from '~/composables/useStoryPanelScroll'
import { useStoryScrollTeardownOnLeave } from '~/composables/useStoryScrollTeardownOnLeave'

definePageMeta({
  pageTransition: false,
})

const { locale } = useI18n()
const route = useRoute('narratives-slug___en')

const panelsRoot = ref<HTMLElement | null>(null)
const sectionsList = ref<TStorySection[] | null>(null)
const bibliographyList = ref<TStoryBibliographyType[] | null>(null)
const sitographyList = ref<TStorySitographyType[] | null>(null)
const creditsList = ref<TStoryCreditsType[] | null>(null)
const catalogoOpereCitateList = ref<TStoryCatalogoOpereCitateType[] | null>(null)
const headerData = ref<TStoryHeaderType | null>(null)

const sectionBlocks = computed(() => {
  const sections = sectionsList.value
  if (!sections?.length)
    return []
  return buildStorySectionBlocks(sections)
})

const headerCardId = computed(() => {
  const img = headerData.value?.Image?.URL
  if (typeof img !== 'string')
    return null
  if (isAbsoluteHttpUrl(img))
    return null
  return img.trim() || null
})

const { resolvedImageUrl: resolvedHeaderImageUrl, pending: headerImagePending } = useResolvedNarrativeCardImage(headerCardId, computed(() => `narrative-header-img-${String(route.params.slug)}-${headerCardId.value ?? 'empty'}`))

const validHeaderData = computed<TStoryHeaderType | null>(() => {
  const d = headerData.value

  if (!d || typeof d.Title !== 'string')
    return null

  const imageUrl = d.Image?.URL
  const needsImage = d.Layout !== 'None'

  if (needsImage) {
    if (typeof imageUrl !== 'string' || !imageUrl)
      return null

    if (isAbsoluteHttpUrl(imageUrl))
      return d

    const url = resolvedHeaderImageUrl.value
    if (typeof url === 'string') {
      return {
        ...d,
        Image: { ...d.Image, URL: url },
      }
    }

    if (headerImagePending.value) {
      return {
        ...d,
        Image: { ...d.Image!, URL: '' },
      }
    }

    return null
  }

  return d
})

const { data: Narration } = useFetch(`/api/narratives/${route.params.slug}`, {
  query: {
    locale: locale.value,
  },
})

watch(Narration, (newVal) => {
  headerData.value = newVal?.ext_json.Header as TStoryHeaderType | null
  sectionsList.value = (newVal?.ext_json.sections ?? null) as TStorySection[] | null
  bibliographyList.value = newVal?.ext_json.bibliography ?? []
  sitographyList.value = newVal?.ext_json.sitography ?? []
  creditsList.value = newVal?.ext_json.credits ?? []
  catalogoOpereCitateList.value = newVal?.ext_json.catalogoOpereCitate ?? []
  syncAppHeaderThemeFromStoryHeader(headerData.value, {
    slug: String(route.params.slug),
  })
}, { immediate: true })

onBeforeRouteLeave((to) => {
  const nextName = typeof to.name === 'string' ? to.name : ''
  if (!nextName.startsWith('narratives-slug'))
    resetAppHeaderTheme()
})

useStoryPanelScroll(panelsRoot, sectionsList)
useStoryScrollTeardownOnLeave()
</script>

<style lang="postcss" scoped>
.narrative-page {
  position: relative;
}

.story-header--fullpage {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  margin-left: calc(-50vw + 50%);
  left: 0;
  top: 0;
}

.main-content {
  width: 100%;
}

.narrative-panels {
  width: 100%;
}

.narrative-footer {
  position: relative;
  z-index: 1000;
  width: 100%;
}
</style>
