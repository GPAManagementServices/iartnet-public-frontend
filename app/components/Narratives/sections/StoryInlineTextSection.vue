<template>
  <section
    v-if="contentHtml"
    class="story-section story-section--inline-text"
  >
    <div
      class="story-inline-text__text story-prose story-prose--inline"
      v-html="contentHtml"
    />
  </section>
</template>

<script setup lang="ts">
import type { TStoryInlineTextType } from '#shared/types/api'
import { storyHtmlContent } from '#shared/utils/storyText'
import { computed } from 'vue'

const props = defineProps<TStoryInlineTextType>()

const contentHtml = computed(() => storyHtmlContent(props.Text))
</script>

<style scoped>
/* —— Mobile —— */
@media (max-width: 767px) {
  .story-section--inline-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    min-height: auto;
    margin-inline: auto;
    padding: 32px 16px;
    background-color: var(--story-color-background);
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
  .story-section--inline-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    max-width: var(--story-inline-text-max-width);
    min-height: auto;
    margin-inline: auto;
    padding-top: var(--story-inline-text-padding-y);
    padding-bottom: var(--story-inline-text-padding-y);
    background-color: var(--story-color-background);
  }
}
</style>
