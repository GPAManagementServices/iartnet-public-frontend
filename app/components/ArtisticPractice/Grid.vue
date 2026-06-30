<template>
  <div class="artistic-practice-grid">
    <!-- Desktop View -->
    <div class="grid--desktop">
      <ArtisticPracticeCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        variant="default"
      />
    </div>

    <!-- Mobile View -->
    <UiCarousel
      class="mobile-view"
      :items="items"
      :slides-per-view="{ 0: 1, 640: 2 }"
      spacing="8px"
      arrows
    >
      <template #default="{ item }">
        <ArtisticPracticeCard
          :item="item"
          variant="compact"
          size="sm"
        />
      </template>
    </UiCarousel>
  </div>
</template>

<script setup lang="ts">
import type { ArtisticPracticeItem } from './Card.vue'

defineProps<{
  items: ArtisticPracticeItem[]
}>()
</script>

<style lang="postcss" scoped>
/* Desktop Grid */
.grid--desktop {
  display: none;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    align-items: start;
  }

  @media (min-width: 1440px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1920px) {
    grid-template-columns: repeat(5, 1fr);
  }
}

/* Mobile View */
.mobile-view {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>
