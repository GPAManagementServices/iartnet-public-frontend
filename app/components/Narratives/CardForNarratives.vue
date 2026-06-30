<template>
  <article class="narratives-card">
    <figure v-if="resolvedCoverSrc" class="card-cover app-rounded">
      <img class="app-rounded" :src="resolvedCoverSrc" :alt="title">
      <div
        class="card-cover__overlay"
        :class="`card-cover__overlay--${titleBoxPosition}`"
      >
        <div class="card-cover__title-box app-rounded">
          <div class="card-cover__box-inner">
            <div class="card-cover__head">
              <span v-if="chipLabel" class="card-chip">{{ chipLabel }}</span>
              <h3 class="card-title card-title--in-box">
                <NuxtLink :to="$localePath({ name: 'narratives-slug', params: { slug } })" class="card-link card-link--in-box stretched-link">
                  {{ title }}
                </NuxtLink>
              </h3>
            </div>

            <p v-if="description" class="card-description">
              {{ description }}
            </p>

            <p v-if="subtitle" class="card-subtitle">
              {{ subtitle }}
            </p>
          </div>
        </div>
      </div>
    </figure>
    <div v-else class="card-content--fallback">
      <div class="card-cover__box-inner card-cover__box-inner--fallback">
        <h3 class="card-title">
          <NuxtLink :to="$localePath({ name: 'narratives-slug', params: { slug: id } })" class="card-link stretched-link">
            {{ title }}
          </NuxtLink>
        </h3>
        <p v-if="description" class="card-description">
          {{ description }}
        </p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  isAbsoluteHttpUrl,
  isCuratorStoragePathLike,
  toCuratorImageProxyUrl,
} from '#shared/utils/narrativeHeroImage'

export type NarrativeCardTitleBoxPosition
  = | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'

export interface NarrativesItem {
  id: number | string
  title: string
  subtitle?: string
  description?: string
  coverImage?: string
  tags?: string[]
  slug: string
  titleBoxPosition?: NarrativeCardTitleBoxPosition
}

const props = withDefaults(defineProps<NarrativesItem>(), {
  coverImage: '',
  tags: () => [],
  titleBoxPosition: 'bottom-left',
})

const chipLabel = computed(() => {
  const list = props.tags?.map(tag => tag.trim()).filter(Boolean) ?? []
  return list.join(', ')
})

const rawCover = computed(() => (typeof props.coverImage === 'string' ? props.coverImage.trim() : ''))

const syncCoverSrc = computed(() => {
  const r = rawCover.value
  if (!r)
    return ''
  if (isAbsoluteHttpUrl(r))
    return r
  if (isCuratorStoragePathLike(r))
    return toCuratorImageProxyUrl(r)
  return ''
})

const coverCardId = computed(() => {
  const r = rawCover.value
  if (!r || isAbsoluteHttpUrl(r) || isCuratorStoragePathLike(r))
    return null
  return r
})

const { resolvedImageUrl: coverFromCard } = useResolvedNarrativeCardImage(
  coverCardId,
  computed(() => `narrative-list-cover-${props.id}`),
)

const resolvedCoverSrc = computed(() => {
  const sync = syncCoverSrc.value
  if (sync)
    return sync
  const fromCard = coverFromCard.value
  if (typeof fromCard === 'string' && fromCard.length)
    return fromCard
  return ''
})
</script>

<style lang="postcss" scoped>
/* —— Mobile —— */
@media (max-width: 767px) {
  .narratives-card {
    position: relative;
    display: flex;
    flex-direction: column;

    & + .narratives-card {
      margin-top: 32px;
    }
  }

  .card-cover__head {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
  }

  .card-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    height: 24px;
    padding: 4px 6px;
    border-radius: var(--ui-radius-full);
    background: var(--gray-2);
    font-size: var(--text-mini);
    font-weight: var(--medium);
    font-style: normal;
    line-height: 120%;
    letter-spacing: 0.5px;
    vertical-align: middle;
    text-transform: uppercase;
    color: var(--gray-12);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-cover {
    position: relative;
    overflow: hidden;
    display: block;
    margin: 0;
    height: 320px;

    img {
      display: block;
      width: 100%;
      height: 100%;
      margin-inline: auto;
      object-fit: cover;
      object-position: center;
    }
  }

  .card-cover__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    pointer-events: none;
  }

  .card-cover__overlay--top-left,
  .card-cover__overlay--top-right,
  .card-cover__overlay--bottom-left,
  .card-cover__overlay--bottom-right {
    align-items: flex-end;
    justify-content: center;
  }

  .card-cover__title-box {
    width: calc(100% - 32px);
    max-width: none;
    min-height: auto;
    height: auto;
    max-height: calc(100% - 32px);
    box-sizing: border-box;
    margin: 16px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 16px 16px 24px;
    background: #fff;
    pointer-events: auto;
    position: relative;
    z-index: 1;
  }

  .card-cover__box-inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 12px;
    width: 100%;
    overflow: visible;
    text-align: left;

    &--fallback {
      align-items: flex-start;
      text-align: left;
      overflow: visible;
      width: 100%;
      padding: 0 16px;
    }
  }

  .card-content--fallback {
    margin-top: 0;
    margin-bottom: 8px;
    padding: 16px;
  }

  .card-title {
    font-size: var(--text);
    font-weight: var(--bold);
    line-height: 1.25;
    margin: 0;
    max-width: 100%;

    &--in-box {
      width: 100%;
      text-align: left;
      font-size: var(--text);
      line-height: 1.25;
    }
  }

  .card-link {
    color: inherit;
  }

  .card-link--in-box {
    display: block;
    width: 100%;
    text-align: left;
    text-decoration: none;
    color: inherit;
  }

  .card-subtitle {
    width: 100%;
    margin: auto 0 0;
    font-size: var(--text-mini);
    font-weight: var(--medium);
    font-style: normal;
    line-height: 140%;
    letter-spacing: 0.5%;
    vertical-align: middle;
    text-transform: uppercase;
    color: var(--gray-12);
  }

  .card-description {
    font-size: var(--text-small);
    font-weight: var(--regular);
    line-height: 1.5;
    color: var(--gray-8);
    margin: 0;
    width: 100%;
    text-align: left;
    display: -webkit-box;
    -webkit-line-clamp: 6;
    line-clamp: 6;
    -webkit-box-orient: vertical;
    overflow: hidden;

    .card-cover__box-inner--fallback & {
      text-align: left;
    }
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
  .narratives-card {
    position: relative;
    display: flex;
    flex-direction: column;

    & + .narratives-card {
      margin-top: 48px;
    }
  }

  .card-cover__head {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
  }

  .card-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    /*width: 82px;*/
    height: 24px;
    padding: 4px 6px;
    /*border: 1px solid var(--gray-12);*/
    border-radius: var(--ui-radius-full);
    background: var(--gray-2);
    font-size: var(--text-mini);
    font-weight: var(--medium);
    font-style: normal;
    line-height: 120%;
    letter-spacing: 0.5px;
    vertical-align: middle;
    text-transform: uppercase;
    color: var(--gray-12);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-cover {
    position: relative;
    overflow: hidden;
    display: block;
    margin: 0;
    height: 620px;

    @media (max-width: 1023px) {
      height: 330px;
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
  }

  .card-cover__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    pointer-events: none;
  }

  .card-cover__overlay--top-left {
    align-items: flex-start;
    justify-content: flex-start;
  }

  .card-cover__overlay--top-right {
    align-items: flex-start;
    justify-content: flex-end;
  }

  .card-cover__overlay--bottom-left {
    align-items: flex-end;
    justify-content: flex-start;
  }

  .card-cover__overlay--bottom-right {
    align-items: flex-end;
    justify-content: flex-end;
  }

  .card-cover__title-box {
    width: 600px;
    max-width: calc(100% - 32px);
    min-height: calc(30% - 32px);
    height: auto;
    max-height: calc(100% - 32px);
    box-sizing: border-box;
    margin: 16px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 24px;
    background: #fff;
    pointer-events: auto;
    position: relative;
    z-index: 1;
  }

  .card-cover__box-inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 12px;
    width: 100%;
    overflow: visible;
    text-align: left;

    &--fallback {
      align-items: flex-start;
      text-align: left;
      overflow: visible;
      width: 100%;
    }
  }

  .card-content--fallback {
    margin-top: 0;
    margin-bottom: 8px;
  }

  .card-title {
    font-size: var(--title);
    font-weight: var(--bold);
    line-height: 1.2;
    margin: 0;
    max-width: 100%;

    &--in-box {
      width: 100%;
      text-align: left;
    }
  }

  .card-link {
    color: inherit;
  }

  .card-link--in-box {
    display: block;
    width: 100%;
    text-align: left;
    text-decoration: none;
    color: inherit;
  }

  .card-subtitle {
    width: 100%;
    margin: auto 0 0;
    font-size: var(--text-mini);
    font-weight: var(--medium);
    font-style: normal;
    line-height: 140%;
    letter-spacing: 0.5%;
    /* text-align: center; */
    vertical-align: middle;
    text-transform: uppercase;
    color: var(--gray-12);
  }

  .card-description {
    font-size: var(--text-small);
    font-weight: var(--regular);
    line-height: 1.5;
    color: var(--gray-8);
    margin: 0;
    width: 100%;
    text-align: left;
    display: -webkit-box;
    -webkit-line-clamp: 8;
    line-clamp: 8;
    -webkit-box-orient: vertical;
    overflow: hidden;

    .card-cover__box-inner--fallback & {
      text-align: left;
    }
  }
}
</style>
