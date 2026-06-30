<template>
  <AvatarRoot
    :as
    class="AvatarRoot"
    :class="[size, props.class]"
    :style="props.style"
  >
    <AvatarImage
      v-if="src"
      :src
      :alt
      v-bind="$attrs"
      class="AvatarImage"
    />

    <AvatarFallback class="AvatarFallback" :delay-ms="600">
      <UiIcon v-if="icon" v-bind="useIconCollection(icon)" />
      <span v-else class="AvatarText">
        {{ fallback }}
      </span>
    </AvatarFallback>
  </AvatarRoot>
</template>

<script lang="ts" setup>
import type { ImgHTMLAttributes } from '../types/html'
import type { Icon } from './Icon.vue'
import { useIconCollection } from './Icon.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<AvatarProps>(), {
  as: 'span',
  size: 'md',
})

const fallback = computed(() => (props.text || '').split(' ').map(word => word.charAt(0)).join('').substring(0, 2))
</script>

<script lang="ts">
export const avatarSize = ['xs', 'sm', 'md', 'lg', 'xl'] as const

export interface AvatarProps extends /** @vue-ignore */ Omit<ImgHTMLAttributes, 'src' | 'alt'> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'span'
   */
  as?: any
  src?: string
  alt?: string
  icon?: Icon | string
  text?: string
  /**
   * @defaultValue 'md'
   */
  size?: typeof avatarSize[number]
  class?: any
  style?: any
}
</script>

<style lang="postcss">
.AvatarRoot {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ui-radius-full);
  vertical-align: middle;
  font-size: var(--font-size);
  color: var(--ui-neutral-text);
  background-color: var(--black-a2);
  border: 1px solid var(--ui-neutral-border);
  user-select: none;
  overflow: hidden;

  &.xs {
    --font-size: var(--ui-text-extrasmall);
    width: 24px;
    height: 24px;
  }
  &.sm {
    --font-size: var(--ui-text-small);
    width: 32px;
    height: 32px;
  }
  &.md {
    --font-size: var(--ui-text);
    width: 40px;
    height: 40px;
  }
  &.lg {
    --font-size: var(--ui-text-large);
    width: 48px;
    height: 48px;
  }
  &.xl {
    --font-size: var(--ui-text-extralarge);
    width: 64px;
    height: 64px;
  }

  .u-icon {
    flex-shrink: 0;
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: cover;
  }
}
</style>
