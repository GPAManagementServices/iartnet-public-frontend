<template>
  <div>
    <HeaderMain title="Activities" />
    <main v-if="activities?.data.length" class="app-padding">
      <AppBlock>
        <template v-if="upcoming?.length" #header />
        <div v-if="upcoming?.length" class="activities__grid">
          <article v-for="item in upcoming" :key="item.id">
            <div v-if="item.media.cover_image" class="activity__cover app-rounded">
              <AppResponsiveImage
                v-if="getCmsMediaPath(item.media.cover_image)"
                :path="getCmsMediaPath(item.media.cover_image)"
                :alt="item.media.cover_image.alt ?? item.media.cover_image.title ?? ''"
                :fallback-src="item.media.cover_image.url"
                sizes="(max-width: 768px) 100vw, min(100%, 512px)"
                :widths="[480, 640, 960]"
                fit="max"
                img-class="app-rounded"
              />
              <img
                v-else-if="item.media.cover_image.url"
                :src="item.media.cover_image.url"
                :alt="item.media.cover_image.alt ?? item.media.cover_image.title"
              >
            </div>
            <div class="activity__meta">
              <ul>
                <li v-for="{ id, name } in item.categories" :key="id" class="uppercase">
                  <UiBadge rounded size="xs" variant="soft">
                    {{ name }}
                  </UiBadge>
                </li>
              </ul>
              <UiTime
                v-if="item.start_date"
                :datetimestart="computeDate(item.start_date, item.start_hour)!"
                :datetimeend="computeDate(item.end_date, item.end_hour)"
                date-style="long"
                :locale
                class="uppercase"
              />
            </div>
            <h2 class="title">
              <NuxtLink class="stretched-link hover-line" :to="$localePath({ name: 'activities-slug', params: { slug: item.slug } })">
                {{ item.title }}
              </NuxtLink>
              <p v-if="subtitleLine(item)" class="activities-index__subtitle">
                {{ subtitleLine(item) }}
              </p>
            </h2>
          </article>
        </div>
        <div v-if="past?.length" class="activities__grid">
          <article v-for="item in past" :key="item.id">
            <div v-if="item.media.cover_image" class="activity__cover app-rounded">
              <AppResponsiveImage
                v-if="getCmsMediaPath(item.media.cover_image)"
                :path="getCmsMediaPath(item.media.cover_image)"
                :alt="item.media.cover_image.alt ?? item.media.cover_image.title ?? ''"
                :fallback-src="item.media.cover_image.url"
                sizes="(max-width: 768px) 100vw, min(100%, 512px)"
                :widths="[480, 640, 960]"
                fit="max"
                img-class="app-rounded"
              />
              <img
                v-else-if="item.media.cover_image.url"
                :src="item.media.cover_image.url"
                :alt="item.media.cover_image.alt ?? item.media.cover_image.title"
              >
            </div>
            <div class="activity__meta">
              <ul>
                <li v-for="{ id, name } in item.categories" :key="id" class="uppercase">
                  <UiBadge rounded size="xs" variant="soft">
                    {{ name }}
                  </UiBadge>
                </li>
              </ul>
              <UiTime
                v-if="item.start_date"
                :datetimestart="computeDate(item.start_date, item.start_hour)!"
                :datetimeend="computeDate(item.end_date, item.end_hour)"
                date-style="long"
                :locale
                class="uppercase"
              />
            </div>
            <h2 class="title">
              <NuxtLink class="stretched-link hover-line" :to="$localePath({ name: 'activities-slug', params: { slug: item.slug } })">
                {{ item.title }}
              </NuxtLink>
              <p v-if="subtitleLine(item)" class="activities-index__subtitle">
                {{ subtitleLine(item) }}
              </p>
            </h2>
          </article>
        </div>
      </AppBlock>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Activity } from '#shared/types/api'
import { getCmsMediaPath } from '#shared/utils/cmsMedia'

const { locale } = useI18n()

const { data: activities } = await useFetch('/api/activities', {
  query: {
    locale: locale.value,
  },
})

const upcoming = computed(() =>
  activities.value?.data.filter(activity => new Date(activity.start_date) >= new Date()) ?? [],
)

const past = computed(() =>
  activities.value?.data.filter(activity => new Date(activity.start_date) <= new Date()) ?? [],
)

function subtitleLine(item: Activity) {
  const t = (item.subtitle ?? '').trim()
  return t.length ? t : null
}

// la description è la concatenazione di meta.title o title se è vuoto
const meta_description = computed(() => {
  const data = [...upcoming.value, ...past.value]
  const retVal = data.map((item) => {
    const cleanItem = item.meta.title.replace(/<[^>]*>?/g, '') || item.title.replace(/<[^>]*>?/g, '')
    return cleanItem || null
  })
  return retVal.filter(Boolean).join(' - ')
})

const keywords = computed(() => {
  if (!upcoming.value.length && !past.value.length)
    return ''
  const data = [...upcoming.value, ...past.value]
  const categories: Set<string> = new Set(data.map(item => item.categories.map(category => category.name)).flat().filter(Boolean))
  return [...categories].join(', ')
})

useCmsDetailSeo({ meta_title: $t('Activities'), meta_description: meta_description.value, keywords: keywords.value })
</script>

<style lang="postcss" scoped>
main {
  margin-bottom: 96px;
}

.activities__grid {
  --min: 512px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--min)), 1fr));
  column-gap: var(--app-padding);
  row-gap: 64px;
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

  .activity__cover {
    overflow: hidden;

    img {
      width: 100%;
      height: auto;
      transition: transform 0.4s ease;
    }
  }

  .activity__meta {
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

  .activities-index__subtitle {
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
