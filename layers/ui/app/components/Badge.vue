<template>
  <Primitive :as class="ui-badge" :class="[size, { block, invert: invertIcon, rounded, square: isSquare }, variant]">
    <slot>
      <span v-if="label !== undefined && label !== null" class="truncate">
        {{ label }}
      </span>
    </slot>

    <slot name="icon">
      <UiIcon v-if="icon" v-bind="useIconCollection(icon)" />
    </slot>
  </Primitive>
</template>

<script setup lang="ts">
import type { Icon } from './Icon.vue'
import { useIconCollection } from './Icon.vue'

const props = withDefaults(defineProps<BadgeProps>(), {
  as: 'span',
  rounded: undefined,
  size: 'md',
  variant: 'primary',
})

const slots = defineSlots<BadgeSlots>()

const isSquare = computed(() => !slots.default && !props.label)
</script>

<script lang="ts">
export const badgeSize = ['xs', 'sm', 'md', 'lg', 'xl'] as const
export const badgeVariant = ['primary', 'secondary', 'accent', 'soft', 'outline'] as const

export interface BadgeProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'span'
   */
  as?: any
  label?: string
  variant?: typeof badgeVariant[number]
  size?: typeof badgeSize[number]
  square?: boolean
  rounded?: boolean
  block?: boolean
  icon?: Icon | string
  invertIcon?: boolean
}

export interface BadgeSlots {
  default: (props?: object) => any
  icon: (props?: object) => any
}
</script>

<style lang="postcss">
.ui-badge {
  display: inline-flex;
  align-items: center;
  column-gap: var(--gap-h);
  padding: var(--gap-v) var(--gap-h);
  font-weight: var(--medium);
  letter-spacing: 8%;
  color: var(--color-text);
  background-color: var(--color-background);
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  border-radius: var(--ui-radius);
  transition-property: color, background-color, border-color, opacity, transform;
  transition-duration: 200ms;
  transition-timing-function: ease-out;

  &.rounded {
    border-radius: var(--ui-radius-full);
  }

  &.block {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  &.invert {
    flex-direction: row-reverse;
  }

  &.square {
    padding-inline: var(--gap-v);
    @supports not (padding-inline: 0) {
      padding-left: var(--gap-v);
      padding-right: var(--gap-v);
    }
  }

  &.xs {
    --gap-v: 4px;
    --gap-h: 6px;
    height: 24px;
    font-size: var(--ui-text-extrasmall);

    .ui-icon {
      width: 10px;
      height: 10px;
    }
  }
  &.sm {
    --gap-v: 5px;
    --gap-h: 8px;
    height: 27px;
    font-size: var(--ui-text-small);

    .ui-icon {
      width: 12px;
      height: 12px;
    }
  }
  &.md {
    --gap-v: 6px;
    --gap-h: 10px;
    height: 32px;
    font-size: var(--ui-text);

    .ui-icon {
      width: 15px;
      height: 15px;
    }
  }
  &.lg {
    --gap-v: 7px;
    --gap-h: 12px;
    height: 39px;
    font-size: var(--ui-text-large);

    .ui-icon {
      width: 18px;
      height: 18px;
    }
  }
  &.xl {
    --gap-v: 8px;
    --gap-h: 14px;
    height: 48px;
    font-size: var(--ui-text-extralarge);

    .ui-icon {
      width: 22px;
      height: 22px;
    }
  }

  &.primary {
    --color-text: var(--ui-neutral-text);
    --color-background: var(--ui-neutral-interactive);
    --color-background-hover: var(--ui-neutral-interactive-hover);
  }
  &.secondary {
    --color-text: var(--ui-neutral-background);
    --color-background: var(--ui-neutral-solid);
    --color-background-hover: var(--ui-neutral-solid-hover);
  }
  &.accent {
    --color-text: var(--ui-neutral-background);
    --color-background: var(--ui-accent-solid);
    --color-background-hover: var(--ui-accent-solid-hover);
  }
  &.soft {
    --color-text: var(--ui-neutral-text);
    --color-background: var(--ui-neutral-interactive);
    --color-background-hover: var(--ui-neutral-interactive-hover);
  }
  &.outline {
    --color-text: var(--ui-neutral-text);
    --color-background: transparent;
    --color-background-hover: var(--ui-neutral-interactive);
    border-color: var(--ui-neutral-border);
  }

  .ui-icon {
    flex-shrink: 0;
  }
}
</style>
