<template>
  <span v-if="view.kind === 'plain' && view.text" class="card-title-text">
    {{ view.text }}
  </span>
  <span
    v-else-if="view.kind === 'parts1' && (view.autore || view.titolo || view.location)"
    class="card-title-stack"
  >
    <span
      v-if="view.autore"
      class="card-title-line card-title-line--meta"
    >{{ view.autore }}</span>
    <span
      v-if="view.titolo"
      class="card-title-line card-title-line--main"
    >{{ view.titolo }}</span>
    <span
      v-if="view.location"
      class="card-title-line card-title-line--meta"
    >{{ view.location }}</span>
  </span>
  <span
    v-else-if="view.kind === 'parts2' && (view.titolo || view.sottotitolo1 || view.sottotitolo2)"
    class="card-title-stack"
  >
    <span
      v-if="view.titolo"
      class="card-title-line card-title-line--main"
    >{{ view.titolo }}</span>
    <span
      v-if="view.sottotitolo1"
      class="card-title-line card-title-line--meta"
    >{{ view.sottotitolo1 }}</span>
    <span
      v-if="view.sottotitolo2"
      class="card-title-line card-title-line--meta"
    >{{ view.sottotitolo2 }}</span>
  </span>
</template>

<script setup lang="ts">
import type { CulturalHeritageItem } from '~~/server/utils/culturalHeritages'
import { computed } from 'vue'
import { culturalHeritageTitleView } from '~~/server/utils/culturalHeritages'

const props = defineProps<{
  title: CulturalHeritageItem['title']
}>()

const view = computed(() => culturalHeritageTitleView(props.title))
</script>
