<template>
  <section
    v-if="hasContent"
    class="story-section story-section--split-content"
  >
    <div class="story-split-content__grid">
      <div
        v-if="leftHtml"
        class="story-split-content__col story-split-content__col--left"
      >
        <div
          class="story-split-content__text story-prose story-prose--split-left"
          v-html="leftHtml"
        />
      </div>
      <div
        v-if="rightHtml"
        class="story-split-content__col story-split-content__col--right"
      >
        <div
          class="story-split-content__text story-prose story-prose--split-right"
          v-html="rightHtml"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TStorySplitContentType } from '#shared/types/api'
import { storyHtmlContent } from '#shared/utils/storyText'
import { computed } from 'vue'

const props = defineProps<TStorySplitContentType>()

const leftHtml = computed(() => storyHtmlContent(props.LeftText))
const rightHtml = computed(() => storyHtmlContent(props.RightText))

const hasContent = computed(
  () => leftHtml.value != null || rightHtml.value != null,
)
</script>

<style scoped>
/* —— Mobile —— */
@media (max-width: 767px) {
  .story-section--split-content {
    box-sizing: border-box;
    width: 100%;
    min-height: auto;
    background-color: var(--story-color-background);
    padding: 32px 16px;
  }

  .story-split-content__grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    margin-inline: auto;
  }

  .story-split-content__col {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
  .story-section--split-content {
    box-sizing: border-box;
    width: 100%;
    min-height: auto;
    background-color: var(--story-color-background);
    padding-inline: var(--story-split-content-padding-inline-mobile);
  }

  .story-split-content__grid {
    display: flex;
    flex-direction: column;
    gap: var(--story-split-content-column-gap);
    box-sizing: border-box;
    width: 100%;
    max-width: calc(2 * var(--story-split-content-column-width) + var(--story-split-content-column-gap));
    margin-inline: auto;
  }

  .story-split-content__col {
    display: flex;
    flex-direction: column;
    gap: var(--story-split-content-block-gap);
    box-sizing: border-box;
    width: 100%;
    max-width: var(--story-split-content-column-width);
  }
}

@media (min-width: 1024px) {
  .story-section--split-content {
    padding-inline: 0;
  }

  .story-split-content__grid {
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
  }

  .story-split-content__col {
    flex: 0 0 var(--story-split-content-column-width);
    width: var(--story-split-content-column-width);
    max-width: var(--story-split-content-column-width);
  }
}
</style>
