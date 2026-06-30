<template>
  <AspectRatio class="AspectRatio" v-bind="rootProps">
    <slot />
  </AspectRatio>
</template>

<script lang="ts">
import type { AspectRatioProps as AspectRatioRootProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'

export interface AspectRatioProps extends AspectRatioRootProps {}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<AspectRatioProps>(), {
  ratio: 1 / 1,
})

const rootProps = useForwardProps(props)
</script>

<style lang="postcss">
.AspectRatio {
  inset: 0;
  @supports not (inset: 0) {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
