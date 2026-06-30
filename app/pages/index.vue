<template>
  <article class="homepage">
    <HeaderHomepage title="" />

    <!-- Our mission -->
    <AppBlock
      divider
      class="app-padding"
      style="margin-bottom: 64px;"
      :cta="{ to: $localePath('about'), size: 'sm', variant: 'outline', rounded: true, label: $t('About'), icon: 'arrow-right', class: 'uppercase' }"
    >
      <template #header>
        <h2 class="temp-title">
          An international platform for artistic research and cultural heritage at Italian higher arts education institutions
        </h2>
      </template>

      <TempMissionSection />
    </AppBlock>

    <!-- Artistic Practice -->
    <AppBlock
      v-if="data?.artisticResearch"
      divider
      class="app-padding"
      style="overflow-x: hidden;"
      :cta="{ to: $localePath('projects'), size: 'sm', variant: 'outline', rounded: true, label: $t('Learn more'), icon: 'arrow-right', class: 'uppercase' }"
    >
      <template #header>
        <h2 class="title">
          {{ $t('Artistic Research') }}
        </h2>
      </template>
      <ArtisticPracticeGrid :items="data.artisticResearch" />
    </AppBlock>

    <!-- Cultural Heritage -->
    <AppBlock
      v-if="data?.culturalHeritageItems"
      divider
      class="app-padding"
      style="overflow-x: hidden;"
      :cta="{ size: 'sm', variant: 'outline', rounded: true, label: $t('Discover the Heritage'), icon: 'arrow-right' }"
    >
      <template #header>
        <h2 class="title">
          {{ $t('Cultural Heritage') }}
        </h2>
      </template>
      <ClientOnly>
        <UiCarousel
          class="homepage-highlights-carousel"
          :items="data.culturalHeritageItems"
          :slides-per-view="{ 0: 1, 640: 2, 1024: 3, 1440: 4, 1920: 5 }"
          spacing="8px"
          arrows
        >
          <template #default="{ item }">
            <CulturalHeritageCard
              :item="item"
              variant="compact"
              size="sm"
            />
          </template>
        </UiCarousel>
      </ClientOnly>
    </AppBlock>

    <AppBlock
      v-if="false && data?.narratives"
      divider
      class="app-padding"
      :cta="{ size: 'sm', variant: 'outline', rounded: true, label: $t('Explore all narratives'), icon: 'arrow-right', class: 'uppercase' }"
    >
      <template #header>
        <h2 class="title">
          {{ $t('Narratives') }}
        </h2>
      </template>
      <div class="narratives">
        <NarrativesCard v-for="narrative in data.narratives" v-bind="narrative" :key="narrative.id" />
      </div>
    </AppBlock>

    <AppBlock
      v-if="false && data?.internationalizationItems"
      divider
      class="app-padding"
      style="overflow-x: hidden;"
      :cta="{ size: 'sm', variant: 'outline', rounded: true, label: $t('Explore internationalization'), icon: 'arrow-right', class: 'uppercase' }"
    >
      <template #header>
        <h2 class="title">
          {{ $t('Internationalization tools') }}
        </h2>
      </template>
      <ClientOnly>
        <UiCarousel
          class="mobile-view"
          :items="data.internationalizationItems"
          :slides-per-view="{ 0: 1, 640: 2, 1024: 4, 1440: 5, 1920: 6 }"
          spacing="8px"
          arrows
        >
          <template #default="{ item }">
            <InternationalizationCard :item variant="compact" size="sm" />
          </template>
        </UiCarousel>
      </ClientOnly>
    </AppBlock>

    <!-- Activities (future events, if any) -->
    <AppBlock
      v-if="data?.activities"
      divider
      class="app-padding"
      :cta="{ to: $localePath('activities'), size: 'sm', variant: 'outline', rounded: true, label: $t('Check the agenda'), icon: 'arrow-right' }"
    >
      <template #header>
        <h2 class="title">
          {{ $t('Activities') }}
        </h2>
      </template>
      <ActivitiesGrid :items="data.activities" :limit="8" include-past />
    </AppBlock>

    <AppBlock divider class="app-padding" :cta="{ to: 'https://www.researchcatalogue.net/', size: 'sm', variant: 'outline', rounded: true, label: $t('Browse Catalogue'), icon: 'arrow-right', class: 'uppercase' }">
      <template #header>
        <h2 class="title">
          {{ $t('Research Catalogue') }}
        </h2>
      </template>
      <ResearchCatalogueTable :catalogue="data?.catalogue" />
    </AppBlock>
  </article>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const { width } = useWindowSize()

const { data } = await useFetch('/api/pages/homepage', {
  query: {
    locale: locale.value,
  },
})

const homepageHighlightVisibleSlides = computed(() => {
  if (width.value > 1920)
    return 5
  if (width.value > 1440)
    return 4
  if (width.value > 1024)
    return 3
  if (width.value > 640)
    return 2
  return 1
})

if (import.meta.dev && import.meta.client) {
  watchEffect(() => {
    const items = data.value?.culturalHeritageItems ?? []
    console.log('[HomepageHighlights] rendered slides=%d', items.length)
    console.log('[HomepageHighlights] visible slides=%d', homepageHighlightVisibleSlides.value)
  })
}
</script>

<style lang="postcss">
.homepage {
  background-color: #fff;
}

.temp-title {
  max-width: 32ch;
  font-size: var(--title-large);
  font-weight: var(--bold);
  font-size: clamp(24px, 4vw, 48px);
  line-height: 1.2;
}

.narratives {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  row-gap: var(--app-padding);

  .narratives-card {
    grid-column: 2 / 5;
  }

  @media (max-width: 1023px) {
    display: block;
  }
}

/* Highlights carousel: frecce a destra su mobile e desktop (override grid default UiCarousel) */
.homepage .homepage-highlights-carousel .CarouselControls {
  display: flex;
  grid-template-columns: unset;
  justify-content: flex-end;
  width: 100%;
  gap: 10px;
  margin-top: var(--app-padding);
}
</style>
