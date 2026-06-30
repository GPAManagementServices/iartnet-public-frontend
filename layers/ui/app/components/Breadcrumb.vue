<template>
  <Primitive :as class="ui-breadcrumb" aria-label="breadcrumb">
    <ol>
      <template v-for="item, index in items" :key="index">
        <li class="ui-breadcrumb-item">
          <UiLink v-slot="{ active, ...slotProps }" v-bind="pickLinkProps(item)" custom>
            <UiLinkBase
              v-bind="slotProps"
              as="span"
              :aria-current="(item.active ?? active) && (index === items!.length - 1) ? 'page' : undefined"
              class="ui-breadcrumb-itemlink uppercase"
              :class="[{ active: item.active, disabled: !!item.disabled, to: !!item.to }, item.class]"
            >
              <slot
                :name="((item.slot || 'item') as keyof BreadcrumbSlots<T>)"
                :item="(item as Extract<T, { slot: string; }>)"
                :active="item.active ?? (index === items!.length - 1)"
                :index
              >
                <slot
                  :name="((item.slot ? `${item.slot}-leading` : 'item-leading') as keyof BreadcrumbSlots<T>)"
                  :item="(item as Extract<T, { slot: string; }>)"
                  :active="item.active ?? (index === items!.length - 1)"
                  :index
                >
                  <UiIcon v-if="item.icon" v-bind="useIconCollection(item.icon)" />
                </slot>

                <span v-if="get(item, props.labelKey as string) || !!slots[(item.slot ? `${item.slot}-label` : 'item-label') as keyof BreadcrumbSlots<T>]" class="truncate">
                  <slot
                    :name="((item.slot ? `${item.slot}-label` : 'item-label') as keyof DynamicSlots<T, 'label'>)"
                    :item="(item as Extract<T, { slot: string; }>)"
                    :active="item.active ?? (index === items!.length - 1)"
                    :index
                  >
                    {{ get(item, props.labelKey as string) }}
                  </slot>
                </span>

                <slot
                  :name="((item.slot ? `${item.slot}-trailing` : 'item-trailing') as keyof DynamicSlots<T, 'trailing'>)"
                  :item="(item as Extract<T, { slot: string; }>)"
                  :active="item.active ?? (index === items!.length - 1)"
                  :index
                />
              </slot>
            </UiLinkBase>
          </UiLink>
        </li>

        <li v-if="index < items!.length - 1" role="presentation" aria-hidden="true">
          <slot name="separator">
            <UiIcon v-bind="useIconCollection(separatorIcon)" />
          </slot>
        </li>
      </template>
    </ol>
  </Primitive>
</template>

<script lang="ts">
import type { Directions } from '@nuxtjs/i18n'
import type { DynamicSlots, GetItemKeys } from '../types/utils'
import type { Icon } from './Icon.vue'
import type { LinkProps } from './Link/Link.vue'
import { useIconCollection } from './Icon.vue'

export interface BreadcrumbItem extends Omit<LinkProps, 'raw' | 'custom'> {
  label?: string
  icon?: Icon | string
  slot?: string
  [key: string]: any
}

export interface BreadcrumbProps<T extends BreadcrumbItem = BreadcrumbItem> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'nav'
   */
  as?: any
  items?: T[]
  /**
   * The icon to use as a separator.
   * @defaultValue 'slash'
   */
  separatorIcon?: Icon | 'string'
  /**
   * The key used to get the label from the item.
   * @defaultValue 'label'
   */
  labelKey?: GetItemKeys<T>
}

type SlotProps<T extends BreadcrumbItem> = (props: { item: T, index: number, active?: boolean }) => any

export type BreadcrumbSlots<T extends BreadcrumbItem = BreadcrumbItem> = {
  'item': SlotProps<T>
  'item-leading': SlotProps<T>
  'item-label': (props: { item: T, index: number, active?: boolean }) => any
  'item-trailing': (props: { item: T, index: number, active?: boolean }) => any
  'separator': (props: object) => any
}
& DynamicSlots<T, 'leading', { index: number, active?: boolean }>
& DynamicSlots<T, 'label' | 'trailing', { index: number, active?: boolean }>
</script>

<script setup lang="ts" generic="T extends BreadcrumbItem">
const props = withDefaults(defineProps<BreadcrumbProps<T>>(), {
  as: 'nav',
  labelKey: 'label',
})
const slots = defineSlots<BreadcrumbSlots<T>>()

const dir = inject<Ref<Directions>>('dir')
const separatorIcon = computed(() => props.separatorIcon || (dir?.value === 'rtl' ? 'backslash' : 'slash'))
</script>

<style lang="postcss">
.ui-breadcrumb {
  position: relative;
  min-width: 0;

  ol {
    display: flex;
    align-items: center;
    gap: 10px;

    li {
      display: flex;
    }

    .ui-breadcrumb-item {
      min-width: 0;
    }
  }

  .ui-breadcrumb-itemlink {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;
    color: var(--ui-accent-solid);
    font-size: var(--ui-text-small);
    font-weight: var(--medium);
    gap: 10px;
    transition: color 200ms ease-out;
    &:focus-visible {
      outline: 1px var(--ui-accent-border);
    }

    &.active {
      font-weight: var(--bold);
    }

    @media (hover) {
      &:not(.disabled):not(.active).to:hover {
        color: var(--ui-accent-solid-hover);
      }
    }
  }

  .ui-icon {
    flex-shrink: 0;
    font-size: 16px;
  }
}
</style>
