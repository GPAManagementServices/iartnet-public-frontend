<template>
  <section
    v-if="hasContent"
    class="story-section story-section--bibliography story-panel-opaque"
  >
    <h2 class="story-bibliography__title">
      {{ title }}
    </h2>
    <div class="story-bibliography__content">
      <ul class="story-bibliography__list">
        <li
          v-for="(item, index) in items"
          :key="index"
          class="story-bibliography__item"
        >
          <p class="story-bibliography__item-text">
            {{ bibliographyItemText(item) }}
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TStoryBibliographyType } from '#shared/types/api'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    items?: TStoryBibliographyType[] | null
    title?: string
  }>(),
  { title: 'Bibliografia' },
)

const hasContent = computed(() => (props.items?.length ?? 0) > 0)

function bibliographyItemText(item: TStoryBibliographyType): string {
  return [item.Title, item.Description].filter(Boolean).join(' ')
}
</script>

<style scoped>
/* —— Mobile —— */
@media (max-width: 767px) {
  .story-section--bibliography {
    display: flex;
    flex-direction: column;
    min-height: auto;
    margin-block: 32px;
  }

  .story-bibliography__title {
    font-weight: 700;
    font-style: normal;
    font-size: 24px;
    line-height: 1.2;
    letter-spacing: 0.45px;
    margin-top: 32px;
    margin-bottom: 24px;
    margin-left: 16px;
    margin-right: 16px;
  }

  .story-bibliography__content {
    box-sizing: border-box;
    width: 100%;
    margin-left: auto;
    margin-right: 0;
    padding-inline: 16px;
  }

  .story-bibliography__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .story-bibliography__item {
    padding: 0.5rem 0;
  }

  .story-bibliography__item-text {
    margin: 0;
    font-weight: var(--story-bibliography-font-weight);
    font-style: normal;
    font-size: var(--story-bibliography-font-size);
    line-height: var(--story-bibliography-line-height);
    letter-spacing: var(--story-bibliography-letter-spacing);
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
  .story-section--bibliography {
    display: flex;
    flex-direction: column;
    min-height: auto;
    margin-block: var(--story-footer-section-margin-block);
  }

  .story-bibliography__title {
    font-weight: 700;
    font-style: normal;
    font-size: 30px;
    line-height: 38.4px;
    letter-spacing: 0.45px;
    margin-top: var(--story-footer-section-margin-block);
    margin-bottom: 80px;
    margin-left: 42px;
  }

  .story-bibliography__content {
    box-sizing: border-box;
    width: 100%;
    margin-left: auto;
    margin-right: var(--story-bibliography-margin-right);
    padding-inline: var(--story-bibliography-padding-inline-mobile);
  }

  .story-bibliography__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .story-bibliography__item {
    padding: 0.5rem 0;
  }

  .story-bibliography__item-text {
    margin: 0;
    font-weight: var(--story-bibliography-font-weight);
    font-style: normal;
    font-size: var(--story-bibliography-font-size);
    line-height: var(--story-bibliography-line-height);
    letter-spacing: var(--story-bibliography-letter-spacing);
  }
}

@media (min-width: 1024px) {
  .story-bibliography__content {
    width: max(50%, var(--story-bibliography-max-width));
    padding-inline: 0;
  }
}
</style>
