<template>
  <div>
    <HeaderMain title="Institutions" />
    <main class="app-padding">
      <AppBlock>
        <template #header>
          <h2 class="title">
            {{ $t('Project Partners') }}
          </h2>
        </template>
        <template #default>
          <ul class="institutions__grid-partner">
            <li v-for="item, key in institutions?.partner" :key>
              <article>
                <UiAspectRatio :ratio="3 / 2" class="cover-image app-rounded">
                  <ul>
                    <li v-for="category in item.categories" :key="category.id">
                      <UiBadge size="xs" rounded class="uppercase">
                        {{ category.name }}
                      </UiBadge>
                    </li>
                  </ul>
                  <img v-if="item.media.cover_image" :src="item.media.cover_image.url" :alt="item.media.cover_image.alt ?? undefined">
                </UiAspectRatio>
                <NuxtLink class="stretched-link" :to="$localePath({ name: 'institutions-slug', params: { slug: item.slug } })">
                  <h3 class="text-large">
                    {{ item.name }}
                  </h3>
                </NuxtLink>
              </article>
            </li>
          </ul>
        </template>
      </AppBlock>
      <AppBlock divider>
        <template #header>
          <h2 class="title">
            {{ $t('Associate Members') }}
          </h2>
        </template>
        <template #default>
          <ul class="institutions__grid-member">
            <li v-for="item, key in institutions?.member" :key>
              <AspectRatio as="article">
                <h3 class="text-large">
                  {{ item.name }}
                </h3>
                <UiButton
                  v-if="item.website"
                  :to="item.website"
                  :aria-label="item.name"
                  size="lg"
                  variant="outline"
                  rounded
                  icon="arrow-right"
                  style="margin-left: auto;"
                />
              </AspectRatio>
            </li>
          </ul>
        </template>
      </AppBlock>

      <AppBlock divider>
        <UiMarquee style="--duration: 30s;" feather-edges>
          <template v-for="institution in institutions?.partner" :key="institution.id">
            <div class="institutions-marquee-slide">
              <img
                v-if="institution.media.logo?.url"
                :src="institution.media.logo.url"
                :alt="institution.media.logo?.alt ?? undefined"
                :style="marqueeLogoInlineStyle(institution.media.logo.url)"
              >
            </div>
          </template>
        </UiMarquee>
      </AppBlock>
    </main>
  </div>
</template>

<script setup lang="ts">
import { marqueeLogoInlineStyle } from '~/utils/institutionMarqueeLogoSizes'

const { locale } = useI18n()

const { data: institutions } = useFetch('/api/institutions', {
  query: {
    locale: locale.value,
  },
})

// la description è la concatenazione di meta.title o name se è vuoto
const meta_description = computed(() => {
  if (!institutions.value?.member?.length && !institutions.value?.partner?.length)
    return ''

  const data = [...(institutions.value?.member ?? []), ...(institutions.value?.partner ?? [])]
  const retVal = data.map((item) => {
    const cleanItem = item.meta.title || item.name
    return cleanItem || null
  })

  const unique = retVal.filter((item, index, self) => self.indexOf(item) === index)
  return unique.filter(Boolean).join(' - ')
})

const keywords = computed(() => {
  if (!institutions.value?.member?.length && !institutions.value?.partner?.length)
    return ''

  const data = [...(institutions.value?.member ?? []), ...(institutions.value?.partner ?? [])]

  const categories = data.map(item => item.categories.map(category => category.name)).flat().filter(Boolean)
  const uniqueCategories = [...new Set(categories)]

  return uniqueCategories.join(', ')
})

useCmsDetailSeo({ meta_title: $t('Institutions'), meta_description: meta_description.value, keywords: keywords.value })
</script>

<style lang="postcss" scoped>
main {
  display: flex;
  flex-direction: column;
  gap: 128px;
}

article {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 7px;

  @media (hover) {
    &:hover:deep(.cover-image) img {
      transform: scale(1.02);
    }
  }

  :deep(.cover-image) {
    background-color: var(--gray-2);
    overflow: hidden;

    ul {
      position: absolute;
      top: 7px;
      left: 7px;
      z-index: 5;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
  }
}

.institutions__grid-lead {
  display: grid;

  @media (min-width: 1024px) {
    margin-left: calc((100% + var(--app-gap)) / 3);
  }
}

.institutions__grid-partner {
  --min: 512px;
  display: grid;
  column-gap: var(--app-padding);
  row-gap: 64px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--min)), 1fr));
}

.institutions__grid-member {
  --min: 256px;
  display: grid;
  grid-gap: var(--app-gap);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--min)), 1fr));

  :deep(article) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: var(--app-gap);
    border: 1px solid var(--ui-neutral-border);
    border-radius: var(--ui-radius);

    .ui-icon {
      transform: rotate(-45deg);
      transition: transform 0.4s ease;
    }
    @media (hover) {
      a:hover .ui-icon {
        transform: rotate(0);
      }
    }
  }
}

.MarqueeWrapper {
  margin-inline: calc(var(--app-padding) * -1);
  @supports not (margin-inline: 0) {
    margin-left: calc(var(--app-padding) * -1);
    margin-right: calc(var(--app-padding) * -1);
  }
}

.institutions-marquee-slide {
  flex-shrink: 0;
  width: 480px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.institutions-marquee-slide img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}
</style>
