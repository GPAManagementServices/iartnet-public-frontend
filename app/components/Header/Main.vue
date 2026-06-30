<template>
  <header
    class="app-padding"
    :class="{
      divider,
      'hero-variant-activity': heroVariant === 'activity',
      'hero-variant-project': heroVariant === 'project',
    }"
  >
    <slot name="breadcrumb-items">
      <UiBreadcrumb v-if="breadcrumb" :items="breadcrumb" />
    </slot>
    <h1 v-if="title" class="title-large" v-html="title" />
    <slot />
  </header>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '#layers/ui/app/components/Breadcrumb.vue'

withDefaults(defineProps<{
  title?: string
  breadcrumb?: BreadcrumbItem[]
  divider?: boolean
  /** `activity` / `project`: padding hero compatto (128px / 40px), allineato ai frame Figma detail. */
  heroVariant?: 'default' | 'activity' | 'project'
}>(), {
  divider: true,
  heroVariant: 'default',
})
</script>

<style lang="postcss" scoped>
header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  padding-block: 256px 48px;
  @supports not (padding-block: 0) {
    padding-top: 256px;
    padding-bottom: 48px;
  }
  background-color: var(--gray-1);

  &.divider {
    border-bottom: 1px solid var(--ui-neutral-border);
  }

  &.hero-variant-activity,
  &.hero-variant-project {
    padding-block: 128px 40px;
    @supports not (padding-block: 0) {
      padding-top: 128px;
      padding-bottom: 40px;
    }
  }
}
</style>
