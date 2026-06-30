<template>
  <div>
    <HeaderMain :title="$t('Research projects')" />
    <main v-if="projects?.data.length" class="app-padding">
      <AppBlock>
        <div class="projects__grid">
          <article v-for="item in projects.data" :key="item.id">
            <div v-if="item.cover_image" class="project__cover app-rounded">
              <AppResponsiveImage
                v-if="getCmsMediaPath(item.cover_image)"
                :path="getCmsMediaPath(item.cover_image)"
                :alt="item.cover_image.alt ?? item.cover_image.title ?? ''"
                :fallback-src="item.cover_image.url"
                sizes="(max-width: 768px) 100vw, min(100%, 512px)"
                :widths="[480, 640, 960]"
                fit="max"
                img-class="app-rounded"
              />
              <img
                v-else-if="item.cover_image.url"
                :src="item.cover_image.url"
                :alt="item.cover_image.alt ?? item.cover_image.title"
              >
            </div>
            <div v-if="item.categories.length" class="project__meta">
              <ul>
                <li v-for="{ id, name } in item.categories" :key="id" class="uppercase">
                  <UiBadge rounded size="xs" variant="soft">
                    {{ name }}
                  </UiBadge>
                </li>
              </ul>
            </div>
            <h2 class="title">
              <NuxtLink class="stretched-link hover-line" :to="$localePath({ name: 'projects-slug', params: { slug: item.slug } })">
                {{ item.title }}
                <p v-if="subtitleLine(item)" class="projects-index__subtitle">
                  {{ subtitleLine(item) }}
                </p>
              </NuxtLink>
            </h2>
          </article>
        </div>
      </AppBlock>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '#shared/types/api'
import { getCmsMediaPath } from '#shared/utils/cmsMedia'

const { locale } = useI18n()

const { data: projects } = useFetch('/api/projects', {
  query: {
    locale: locale.value,
  },
})

function subtitleLine(item: Project) {
  const t = (item.subtitle ?? '').trim()
  return t.length ? t : null
}

// la description è la concatenazione di meta.title o title se è vuoto
const meta_description = computed(() => {
  if (!projects.value?.data)
    return ''
  const data = projects.value?.data
  const retVal = data.map((item) => {
    const cleanItem = item.meta_title.replace(/<[^>]*>?/g, '') || item.title.replace(/<[^>]*>?/g, '')
    return cleanItem || null
  })
  return retVal.filter(Boolean).join(' - ')
})

const keywords = computed(() => {
  if (!projects.value?.data)
    return ''
  const data = projects.value?.data
  const categories: Set<string> = new Set(data.map(item => item.categories.map(category => category.name)).flat().filter(Boolean))
  return [...categories].join(', ')
})

useCmsDetailSeo({ meta_title: $t('Projects'), meta_description: meta_description.value, keywords: keywords.value })
</script>

<style lang="postcss" scoped>
main {
  margin-bottom: 96px;
}

.projects__grid {
  --columns: 1;
  display: grid;
  column-gap: var(--app-padding);
  row-gap: 64px;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));

  @media (min-width: 768px) {
    --columns: 2;
  }

  @media (min-width: 1024px) {
    --columns: 3;
  }
}

article {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--app-gap);

  @media (hover) {
    &:hover {
      img {
        transform: scale(1.02);
      }

      /* Trigger hover-line underline when card is hovered (stretched-link ::after captures hover) */
      .hover-line {
        text-decoration-color: var(--gray-4);
      }
    }
  }

  .project__cover {
    overflow: hidden;

    img {
      width: 100%;
      height: auto;
      transition: transform 0.4s ease;
    }
  }

  .project__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;

    ul {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      font-size: 0;
    }

    time {
      font-size: var(--ui-text-extrasmall);
    }
  }

  .projects-index__subtitle {
    margin: 0;
    font-weight: 500;
    font-size: var(--title);
    line-height: 120%;
    letter-spacing: 0.5px;
    vertical-align: middle;
    color: #8d8d8d;
    leading-trim: none;
  }
}
</style>
