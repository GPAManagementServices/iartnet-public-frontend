<template>
  <AccordionRoot
    class="AccordionRoot"
    v-bind="forwarded"
  >
    <slot :items="items">
      <template
        v-for="(item, key) in items"
        :key
      >
        <RekaAccordionItem
          class="AccordionItem"
          :disabled="item.disabled"
          :value="item.value"
        >
          <slot
            name="header"
            :items="items"
          >
            <AccordionHeader class="AccordionHeader">
              <slot
                name="trigger"
                :items="items"
              >
                <AccordionTrigger
                  class="AccordionTrigger"
                  :aria-label="item.title"
                >
                  <slot> {{ item.title }} </slot>
                  <UiIcon name="chevron-down" />
                </AccordionTrigger>
              </slot>
            </AccordionHeader>
          </slot>
          <slot
            name="content"
            :items="items"
          >
            <AccordionContent class="AccordionContent">
              <div>
                <slot> {{ item.content }} </slot>
              </div>
            </AccordionContent>
          </slot>
        </RekaAccordionItem>
      </template>
    </slot>
  </AccordionRoot>
</template>

<script setup lang="ts">
import type { AccordionRootEmits, AccordionRootProps } from 'reka-ui'
import { reactiveOmit } from '@vueuse/core'
import {
  AccordionContent,
  AccordionHeader,
  AccordionRoot,
  AccordionTrigger,
  AccordionItem as RekaAccordionItem,
  useForwardPropsEmits,
} from 'reka-ui'

export interface AccordionItem {
  title?: string
  content?: string
  value: string
  disabled?: boolean
  icon?: string
}

defineOptions({ name: 'UiAccordion' })
const props = withDefaults(defineProps<{
  items?: AccordionItem[]
} & AccordionRootProps>(), {
  type: 'single',
  collapsible: true,
  items: () => [],
})

const emits = defineEmits<AccordionRootEmits>()
const forwarded = useForwardPropsEmits(reactiveOmit(props, 'items'), emits)
</script>

<style lang="postcss">
.AccordionRoot {
  width: 100%;
  min-width: 220px;
}

.AccordionItem {
  border-top: 1px solid var(--ui-neutral-text);
}

.AccordionHeader {
  display: flex;
}

.AccordionTrigger {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  padding-bottom: 8px;
  font-size: var(--ui-text-large);

  .ui-icon {
    width: 16px;
    height: 16px;
    color: var(--gray-6);
    transition: transform 200ms ease-out;
  }

  &[data-state='open'] > .ui-icon {
    transform: rotate(180deg);
  }
}

.AccordionContent {
  margin-left: auto;
  max-width: 65ch;
  font-size: var(--ui-text-large);
  overflow: hidden;

  &[data-state='open'] {
    animation: slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1);
  }

  &[data-state='closed'] {
    animation: slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1);
  }

  & > div {
    padding-top: 16px;
    padding-bottom: 32px;
  }
}

@keyframes slideDown {
  from {
    height: 0;
  }

  to {
    height: var(--reka-accordion-content-height);
  }
}

@keyframes slideUp {
  from {
    height: var(--reka-accordion-content-height);
  }

  to {
    height: 0;
  }
}
</style>
