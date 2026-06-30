<template>
  <article class="cultural-heritage-card">
    <figure v-if="item.coverImage" class="card-cover app-rounded" :data-heritage-id="item.id">
      <AppResponsiveImage
        v-if="coverMediaPath"
        :path="coverMediaPath"
        :alt="coverAlt"
        :fallback-src="item.coverImage"
        sizes="(max-width: 768px) 100vw, min(100%, 400px)"
        :widths="[400, 640, 960]"
        fit="max"
      />
      <img
        v-else
        :src="item.coverImage"
        :alt="coverAlt"
      >
    </figure>

    <div class="card-content">
      <UiBadge
        v-if="item.tags?.length"
        :label="item.tags[0]"
        size="xs"
        variant="primary"
        rounded
        class="card-tag"
      />

      <h3 class="card-title">
        <NuxtLink :to="item.link" class="card-link stretched-link hover-line">
          <CulturalHeritageTitleBlock :title="item.title" />
        </NuxtLink>
      </h3>

      <p v-if="item.description" class="card-description">
        {{ item.description }}
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { CulturalHeritageItem } from '~~/server/utils/culturalHeritages'
import { normalizeCmsMediaPath } from '#shared/utils/cmsMedia'
import { culturalHeritageTitleString } from '~~/server/utils/culturalHeritages'

const props = defineProps<{
  item: CulturalHeritageItem
  variant?: 'featured' | 'default' | 'compact'
  size?: 'sm' | 'md' | 'lg'
}>()

const coverMediaPath = computed(() =>
  normalizeCmsMediaPath(props.item.coverImage),
)

const coverAlt = computed(() =>
  culturalHeritageTitleString(props.item.title),
)
</script>

<style lang="postcss" scoped>
@import './cardTitleBlock.postcss';

.cultural-heritage-card {
  position: relative;
  display: flex;
  flex-direction: column;

  @media (hover) {
    /* Trigger hover-line underline when card is hovered (stretched-link ::after captures hover) */
    &:hover {
      .card-cover {
        border-radius: 50%;
      }

      .hover-line {
        text-decoration-color: var(--gray-4);
      }
    }
  }
}

.card-cover {
  margin: 0;
  aspect-ratio: 1;
  overflow: hidden;
  transition: border-radius 0.4s ease;
  border: 1px solid #000;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.card-cover[data-heritage-id='4'] img {
  object-fit: cover;
  object-position: center bottom;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
}

.card-tag {
  align-self: flex-start;
}

.card-title {
  font-size: var(--text-large);
  font-weight: var(--medium);
  line-height: 1.3;
  margin: 0;
}

.card-link {
  color: inherit;
}

.card-description {
  font-size: var(--text-small);
  color: var(--gray-8);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  line-clamp: 4;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
