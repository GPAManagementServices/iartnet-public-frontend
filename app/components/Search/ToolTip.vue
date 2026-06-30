<template>
  <div class="tooltip-wrapper" @mouseenter="isVisible = true" @mouseleave="isVisible = false">
    <slot />
    <div v-if="isVisible" class="tooltip">
      <div class="tooltip-text" v-html="props.snippet" />
      <div class="tooltip-tipoScheda" v-html="props.tipoScheda" />
      <div class="tooltip-info" v-html="props.info" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  snippet: {
    type: String,
    required: true,
  },
  tipoScheda: {
    type: String,
    required: true,
  },
  info: {
    type: String,
    required: true,
  },
})

const isVisible = ref(false)
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  white-space: nowrap;
  margin-bottom: 0.5rem;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #333;
}

.tooltip-text {
  white-space: pre-wrap;
  width: 400px;
  height: 400px;
}
</style>
