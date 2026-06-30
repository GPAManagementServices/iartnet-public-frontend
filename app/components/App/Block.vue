<template>
  <Primitive :as class="ui-block" :class="{ divider }">
    <div v-if="!!slots.header || !!cta" v-appear class="app-block__header">
      <slot name="header" />
      <div v-if="props.cta" class="app-block-cta">
         <UiButton v-bind="props.cta" />
      </div>
    </div>

    <div v-if="!!slots.default" v-appear class="app-block__content">
      <slot />
    </div>

    <div v-if="!!slots.footer" v-appear class="app-block__footer">
      <slot name="footer" />
    </div>
  </Primitive>
</template>

<script setup lang="ts">
import type { ButtonProps } from '#layers/ui/app/components/Button.vue'

const props = defineProps<BlockProps>()
const slots = defineSlots<BlockSlots>()
</script>

<script lang="ts">
export interface BlockProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  divider?: boolean
  cta?: ButtonProps
}

export interface BlockSlots {
  header: (props?: object) => any
  default: (props?: object) => any
  footer: (props?: object) => any
}
</script>

<style lang="postcss" scoped>
.ui-block {
  &.divider {
    border-top: 1px solid var(--ui-neutral-border);
  }

  .app-block__header {
    display: flex;
    flex-direction: column;
    row-gap: 32px;
    column-gap: var(--app-gap);
    margin-block: var(--app-padding);
    @supports not (margin-block: 0) {
      margin-top: var(--app-padding);
      margin-bottom: var(--app-padding);
    }
    @media (min-width: 768px) {
      flex-direction: row;
      .app-block-cta {
        margin-left: auto;
      }
    }
  }
  .app-block__content {
    margin-block: 96px var(--app-padding);
    @supports not (margin-block: 0) {
      margin-top: 96px;
      margin-bottom: var(--app-padding);
    }
  }
  .app-block__footer {
    margin-block: var(--app-padding);
    @supports not (margin-block: 0) {
      margin-top: var(--app-padding);
      margin-bottom: var(--app-padding);
    }
  }
}
</style>
