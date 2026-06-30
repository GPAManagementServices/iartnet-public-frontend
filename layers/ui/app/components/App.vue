<template>
  <ConfigProvider
    :use-id="() => (useId() as string)"
    :dir="props.dir || (locale?.dir === 'auto' ? 'ltr' : locale?.dir)"
    :locale="locale?.code"
    v-bind="configProviderProps"
  >
    <TooltipProvider v-bind="tooltipProps">
      <slot />
    </TooltipProvider>
  </ConfigProvider>
</template>

<script lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'
import type { ConfigProviderProps, TooltipProviderProps } from 'reka-ui'
import { useForwardProps } from 'reka-ui'

export interface AppProps extends Omit<ConfigProviderProps, 'useId' | 'locale'> {
  tooltip?: TooltipProviderProps
  locale?: LocaleObject
  portal?: boolean | string | HTMLElement
}

export interface AppSlots {
  default: (props?: object) => any
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<AppProps>(), {
  portal: 'body',
})

defineSlots<AppSlots>()

const configProviderProps = useForwardProps(reactivePick(props, 'scrollBody'))
const tooltipProps = toRef(() => props.tooltip)

const locale = toRef(() => props.locale)

const portal = toRef(() => props.portal)
provide(portalTargetInjectionKey, portal)

provide('dir', toRef(props.dir))
</script>
