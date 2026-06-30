<template>
  <UiLink
    v-slot="{ ...slotProps }"
    :type
    :disabled="disabled || loading"
    :underline="variant === 'link'"
    v-bind="omit(linkProps, ['type', 'disabled'])"
    custom
  >
    <UiLinkBase
      v-bind="slotProps"
      class="ui-button"
      :class="[size, { block, invert: invertIcon, rounded, square: isSquare }, variant, props.class]"
    >
      <slot>
        <span v-if="label !== undefined && label !== null" class="truncate">
          {{ label }}
        </span>
      </slot>

      <slot name="icon">
        <UiIcon v-if="icon || loading" v-bind="useIconCollection(icon ?? 'loading')" />
      </slot>
    </UiLinkBase>
  </UiLink>
</template>

<script setup lang="ts">
import type { Icon } from './Icon.vue'
import type { LinkProps } from './Link/Link.vue'
import { useForwardProps } from 'reka-ui'
import { useIconCollection } from './Icon.vue'

const props = withDefaults(defineProps<ButtonProps>(), {
  rounded: undefined,
  size: 'md',
  variant: 'primary',
})

const slots = defineSlots<ButtonSlots>()

const linkProps = useForwardProps(pickLinkProps(props))

const isSquare = computed(() => (!slots.default && !props.label) || props.square)
</script>

<script lang="ts">
export const buttonSize = ['xs', 'sm', 'md', 'lg', 'xl'] as const
export const buttonVariant = ['primary', 'secondary', 'accent', 'outline', 'soft', 'ghost', 'link'] as const

export interface ButtonProps extends Omit<LinkProps, 'raw' | 'custom'> {
  label?: string
  variant?: typeof buttonVariant[number]
  size?: typeof buttonSize[number]
  square?: boolean
  rounded?: boolean
  block?: boolean
  icon?: Icon | string
  invertIcon?: boolean
  loading?: boolean
  class?: any
}

export interface ButtonSlots {
  default: (props?: object) => any
  icon: (props?: object) => any
}
</script>

<style lang="postcss">
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  column-gap: var(--gap-h);
  height: var(--size);
  padding: var(--gap-v) var(--gap-h);
  font-weight: var(--medium);
  letter-spacing: 8%;
  color: var(--color-text);
  background-color: var(--color-background);
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  border-radius: var(--ui-radius);
  transition-property: color, background-color, border-color, transform;
  transition-duration: 200ms;
  transition-timing-function: ease-out;
  &:focus {
    outline: none;
    &-visible {
      box-shadow: 0 0 0 1px var(--ui-neutral-border);
    }

    &:active {
      transform: scaleX(0.98) scaleY(0.98);
    }
  }

  @media (hover) {
    &:is(:not(:disabled, [disabled])):hover {
      color: var(--color-text-hover, var(--color-text));
      background-color: var(--color-background-hover, var(--color-background)) !important;
    }
  }
  &:is(:not(:disabled, [disabled])):active {
    color: var(--color-text-hover, var(--color-text));
    background-color: var(--color-background-hover, var(--color-background)) !important;
  }

  &.rounded {
    border-radius: var(--ui-radius-full);
  }

  &.block {
    display: flex;
    width: 100%;
  }

  &.invert {
    flex-direction: row-reverse;
  }

  &.square {
    min-width: var(--size);
    padding-inline: var(--gap-v);
    @supports not (padding-inline: 0) {
      padding-left: var(--gap-v);
      padding-right: var(--gap-v);
    }
  }

  &.xs {
    --size: 24px;
    --gap-v: 4px;
    --gap-h: 6px;
    font-size: var(--ui-text-extrasmall);

    .ui-icon {
      width: 10px;
      height: 10px;
    }
  }
  &.sm {
    --size: 27px;
    --gap-v: 5px;
    --gap-h: 8px;
    font-size: var(--ui-text-small);

    .ui-icon {
      width: 12px;
      height: 12px;
    }
  }
  &.md {
    --size: 32px;
    --gap-v: 6px;
    --gap-h: 10px;
    font-size: var(--ui-text);

    .ui-icon {
      width: 15px;
      height: 15px;
    }
  }
  &.lg {
    --size: 39px;
    --gap-v: 7px;
    --gap-h: 12px;
    font-size: var(--ui-text-large);

    .ui-icon {
      width: 18px;
      height: 18px;
    }
  }
  &.xl {
    --size: 48px;
    --gap-v: 8px;
    --gap-h: 14px;
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
  &.outline {
    --color-text: var(--ui-neutral-text);
    --color-background: transparent;
    --color-background-hover: var(--ui-neutral-interactive);
    border-color: var(--ui-neutral-border);
  }
  &.soft {
    --color-text: var(--ui-neutral-text);
    --color-background: var(--ui-neutral-interactive);
    --color-background-hover: var(--ui-neutral-interactive-hover);
  }
  &.ghost {
    --color-text: var(--ui-neutral-text);
    --color-background: transparent;
    --color-background-hover: var(--ui-neutral-interactive);
  }
  &.link {
    --color-text: var(--ui-neutral-text);
    --color-text-hover: var(--ui-neutral-text-hover);
    --color-background: transparent;

    @media (hover) {
      &:is(:not(:disabled, [disabled])):hover {
        --color-text-hover: var(--ui-accent-solid);
        text-decoration: underline;
      }
    }
    @media not (hover) {
      &:is(:not(:disabled, [disabled])) {
        text-decoration: underline;
      }
    }
  }

  .ui-icon {
    flex-shrink: 0;
  }
}
</style>
