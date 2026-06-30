<template>
  <ul class="numbers-grid">
    <li v-for="item in items" :key="item.key">
      <NumberCard
        :label="item.label"
        :value="item.value"
        :description="item.description"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import NumberCard from '~/components/Numbers/NumberCard.vue'

export interface NumberStatItem {
  key: string
  label: string
  value: number | string
  description?: string
}

defineProps<{
  items: NumberStatItem[]
}>()
</script>

<style lang="postcss" scoped>
.numbers-grid {
  display: grid;
  gap: var(--app-gap);
  grid-template-columns: 1fr;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  & > li {
    min-width: 0;
    width: 100%;
  }
}
</style>
