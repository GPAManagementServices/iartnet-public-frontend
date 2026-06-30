<template>
  <Icon :name="`${collection}:${name}`" />
</template>

<script setup lang="ts">
withDefaults(defineProps<Icon>(), {
  collection: 'ui',
})
</script>

<script lang="ts">
export interface Icon {
  collection?: string
  name: string
}

export function useIconCollection(icon: Icon | string) {
  return typeof icon === 'string' ? { name: icon } : icon
}
</script>
