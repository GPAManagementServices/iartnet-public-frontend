<template>
  <img
    class="previewCover"
    :src="cover"
    alt=""
    role="presentation"
    :style="{ transform: translatePosition }"
    loading="lazy"
  >
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  cover: string
  offset?: number
  xPos?: number
  yPos?: number
}>(), {
  xPos: 0,
  yPos: 0,
})

const translatePosition = computed(() => `translate(${props.xPos + 40}px, ${props.yPos}px) translateY(-50%)`)
</script>

<style lang="postcss">
.previewCover {
  position: absolute !important;
  top: 50%;
  left: 0;
  display: block;
  width: auto;
  height: auto;
  z-index: 100;
  max-width: 460px;
  max-height: 460px;
  object-fit: contain;
  object-position: center center;
  border-radius: var(--ui-radius-large);

  pointer-events: none;
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 20px 25px -5px,
    rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;
}
</style>
