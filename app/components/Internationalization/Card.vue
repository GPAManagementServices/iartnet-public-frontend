<template>
  <article class="internationalization-card">
    <figure v-if="item.coverImage" class="card-cover app-rounded">
      <img :src="item.coverImage" :alt="culturalHeritageTitleString(item.title)">
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
import { culturalHeritageTitleString } from '~~/server/utils/culturalHeritages'

defineProps<{
  item: CulturalHeritageItem
  variant?: 'featured' | 'default' | 'compact'
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<style lang="postcss" scoped>
@import '../CulturalHeritage/cardTitleBlock.postcss';

.internationalization-card {
  position: relative;
  display: flex;
  flex-direction: column;

  @media (hover) {
    /* Trigger hover-line underline when card is hovered (stretched-link ::after captures hover) */
    &:hover .hover-line {
      text-decoration-color: var(--gray-4);
    }
  }
}

.card-cover {
  display: flex;
  align-items: flex-end;
  margin: 0;
  height: 280px;

  img {
    display: block;
    border: 1px solid #000;
    border-radius: var(--ui-radius);
    max-width: 100%;
    max-height: 100%;
    width: 66.66%;
    height: auto;
    object-fit: contain;
  }
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
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
