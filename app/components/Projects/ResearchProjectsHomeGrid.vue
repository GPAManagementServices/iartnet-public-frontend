<template>
  <div class="research-projects-home-grid">
    <ResearchProjectHomeCard
      v-for="item in items"
      :key="item.id"
      :item="item"
    />
  </div>
</template>

<script setup lang="ts">
import type { Project } from '#shared/types/api'
import ResearchProjectHomeCard from '~/components/Projects/ResearchProjectHomeCard.vue'

defineProps<{
  items: Project[]
}>()
</script>

<style lang="postcss" scoped>
.research-projects-home-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  align-items: start;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
