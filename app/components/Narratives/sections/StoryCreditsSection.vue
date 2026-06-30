<template>
  <section
    v-if="hasContent"
    class="story-section story-section--credits story-panel-opaque"
  >
    <h2 class="story-credits__title">
      {{ title }}
    </h2>
    <div class="story-credits__table">
      <ul class="story-credits__list">
        <li
          v-for="(item, index) in items"
          :key="index"
          class="story-credits__item"
        >
          <span
            v-if="item.Title"
            class="story-credits__item-title"
          >
            {{ item.Title }}
          </span>
          <span
            v-if="item.Description"
            class="story-credits__item-description"
          >
            {{ item.Description }}
          </span>
        </li>
      </ul>
      <!-- <footer class="story-credits__footer">
        <p class="story-credits__footer-text">
          Lorem ipsum dolor sit amet consectetur. Viverra commodo fringilla vehicula lectus. Ullamcorper bibendum vitae
          cursus eu eleifend vivamus. Sit velit mauris scelerisque est eget arcu sem. Amet volutpat elit tellus lectus
          tincidunt integer.
        </p>
      </footer> -->
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TStoryCreditsType } from '#shared/types/api'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    items?: TStoryCreditsType[] | null
    title?: string
  }>(),
  { title: 'Credits' },
)

const hasContent = computed(() => (props.items?.length ?? 0) > 0)
</script>

<style scoped>
/* —— Mobile —— */
@media (max-width: 767px) {
  .story-section--credits {
    display: flex;
    flex-direction: column;
    min-height: auto;
    margin-block: 32px;
  }

  .story-credits__title {
    font-weight: 700;
    font-style: Bold;
    font-size: 24px;
    line-height: 1.2;
    letter-spacing: 0.45px;
    margin-top: 32px;
    margin-bottom: 24px;
    margin-left: 16px;
    margin-right: 16px;
  }

  .story-credits__table {
    box-sizing: border-box;
    width: 100%;
    margin-left: auto;
    margin-right: 0;
    padding-inline: 16px;
  }

  .story-credits__list {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.9rem;
  }

  .story-credits__footer {
    margin: 0;
    padding: 0.5rem 0 0;
    border-top: 1px solid rgba(0, 0, 0, 0.15);
  }

  .story-credits__footer-text {
    margin: 0;
    font-weight: 400;
    font-style: normal;
    font-size: 16px;
    line-height: 140%;
    letter-spacing: 0;
    max-width: 100%;
  }

  .story-credits__item {
    display: flex;
    flex-flow: column nowrap;
    gap: 0.25rem;
    align-items: flex-start;
    padding: 0.75rem 0;
    border-top: 1px solid rgba(0, 0, 0, 0.15);
  }

  .story-credits__item-title {
    font-weight: 400;
    font-style: normal;
    font-size: 16px;
    line-height: 1.4;
    letter-spacing: 0.45px;
    text-transform: uppercase;
    flex: none;
    max-width: 100%;
    min-width: 0;
  }

  .story-credits__item-description {
    font-weight: 700;
    font-style: normal;
    font-size: 16px;
    line-height: 1.4;
    letter-spacing: 0.45px;
    flex: none;
    max-width: 100%;
    min-width: 0;
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
  .story-section--credits {
    display: flex;
    flex-direction: column;
    min-height: auto;
    margin-block: var(--story-footer-section-margin-block);
  }

  .story-credits__title {
    font-weight: 700;
    font-style: Bold;
    font-size: 30px;
    line-height: 38.4px;
    letter-spacing: 0.45px;
    margin-top: var(--story-footer-section-margin-block);
    margin-bottom: 80px;
    margin-left: 42px;
  }

  .story-credits__table {
    box-sizing: border-box;
    width: 100%;
    margin-left: auto;
    margin-right: var(--story-bibliography-margin-right);
    padding-inline: var(--story-bibliography-padding-inline-mobile);
  }

  .story-credits__list {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.9rem;
  }

  .story-credits__footer {
    margin: 0;
    padding: 0.5rem 0 0;
    border-top: 1px solid rgba(0, 0, 0, 0.15);
  }

  .story-credits__footer-text {
    margin: 0;
    font-weight: 400;
    font-style: normal;
    font-size: 16px;
    line-height: 140%;
    letter-spacing: 0;
    max-width: 100%;
  }

  .story-credits__item {
    display: flex;
    flex-flow: row nowrap;
    gap: 0.5rem;
    align-items: flex-start;
    padding: 0.5rem 0;
    border-top: 1px solid rgba(0, 0, 0, 0.15);
  }

  .story-credits__item-title {
    font-weight: 400;
    font-style: normal;
    font-size: 21px;
    line-height: 36px;
    letter-spacing: 0.45px;
    text-transform: uppercase;
    flex: 0 0 calc((100% - 0.5rem) / 2);
    max-width: calc((100% - 0.5rem) / 2);
    min-width: 0;
  }

  .story-credits__item-description {
    font-weight: 700;
    font-style: normal;
    font-size: 21px;
    line-height: 36px;
    letter-spacing: 0.45px;
    flex: 0 0 calc((100% - 0.5rem) / 2);
    max-width: calc((100% - 0.5rem) / 2);
    min-width: 0;
  }
}

@media (min-width: 1024px) {
  .story-credits__table {
    width: max(50%, var(--story-bibliography-max-width));
    padding-inline: 0;
  }
}
</style>
