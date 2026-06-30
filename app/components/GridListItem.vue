<template>
  <li v-appear class="app-rounded">
    <UiIcon v-bind="useIconCollection(icon)" size="42px" />
    <slot />
  </li>
</template>

<script setup lang="ts">
import type { Icon } from '#layers/ui/app/components/Icon.vue'
import { useIconCollection } from '#layers/ui/app/components/Icon.vue'

defineProps<{
  icon: Icon | string
}>()
</script>

<style lang="postcss" scoped>
li {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border: 1px solid currentColor;
}
</style>
