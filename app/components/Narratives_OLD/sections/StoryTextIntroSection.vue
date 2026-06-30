<template>
  <section
    v-if="contentHtml"
    class="story-section story-section--text-intro"
  >
    <div
      class="story-text-intro__text story-prose story-prose--intro"
      v-html="contentHtml"
    />
  </section>
</template>

<script setup lang="ts">
import type { TStoryTextIntroType } from '#shared/types/api'
import { storyHtmlContent } from '#shared/utils/storyText'

const props = defineProps<TStoryTextIntroType>()

const contentHtml = computed(() => storyHtmlContent(props.Text))
</script>

<style scoped>
/* —— Mobile —— */
@media (max-width: 767px) {
  .story-section--text-intro {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--story-text-intro-gap-mobile);
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
  .story-section--text-intro {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--story-text-intro-gap-mobile);
    box-sizing: border-box;
    width: 100%;
    max-width: var(--story-text-intro-max-width);
    min-height: var(--story-section-min-height);
    margin-inline: auto;
    padding-inline: var(--story-text-intro-padding-inline-mobile);
    background-color: var(--story-color-background);
  }
}

@media (min-width: 1024px) {
  .story-section--text-intro {
    gap: var(--story-text-intro-gap-desktop);
    padding-inline: 0;
  }
}
</style>
