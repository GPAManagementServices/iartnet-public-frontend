<template>
  <CollapsibleRoot
    v-slot="{ open }"
    data-slot="collapsible"
    v-bind="rootProps"
    class="CollapsibleRoot"
  >
    <CollapsibleTrigger v-if="!!slots.default" as-child>
      <slot :open />
    </CollapsibleTrigger>

    <CollapsibleContent
      class="CollapsibleContent"
      v-bind="props.content"
      :force-mount="!!minHeight"
      :style="typeof minHeight === 'number' ? { '--min-height': `${props.minHeight}px` } : undefined"
    >
      <slot name="content" />
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<script lang="ts">
import type { CollapsibleRootEmits, CollapsibleRootProps } from 'reka-ui'
import { useForwardPropsEmits } from 'reka-ui'

export interface CollapsibleProps extends Pick<CollapsibleRootProps, 'defaultOpen' | 'open' | 'disabled' | 'unmountOnHide'> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  minHeight?: number
  /**
   * The content of the collapsible.
   */
  content?: Record<string, any>
}

export interface CollapsibleEmits extends CollapsibleRootEmits {}

export interface CollapsibleSlots {
  default: (props: { open: boolean }) => any
  content: (props?: object) => any
}
</script>

<script lang="ts" setup>
const props = withDefaults(defineProps<CollapsibleProps>(), {
  unmountOnHide: true,
})
const emits = defineEmits<CollapsibleEmits>()
const slots = defineSlots<CollapsibleSlots>()

const rootProps = useForwardPropsEmits(reactivePick(props, 'as', 'defaultOpen', 'open', 'disabled', 'unmountOnHide'), emits)
</script>

<style lang="postcss">
.CollapsibleRoot {
  display: flex;
  flex-direction: column;
  gap: var(--app-gap);
}

.CollapsibleContent {
  overflow: hidden;

  &[data-state='closed'] {
    animation: collapsible-up 200ms ease-out forwards;
  }
  &[data-state='open'] {
    animation: collapsible-down 200ms ease-out forwards;
  }
}

@keyframes collapsible-down {
  from {
    height: var(--min-height, 0);
  }
  to {
    height: var(--reka-collapsible-content-height);
  }
}
@keyframes collapsible-up {
  from {
    height: var(--reka-collapsible-content-height);
  }
  to {
    height: var(--min-height, 0);
  }
}
</style>
