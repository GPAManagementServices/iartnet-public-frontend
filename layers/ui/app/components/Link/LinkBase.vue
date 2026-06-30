<template>
  <Primitive
    v-bind="href ? {
      'as': 'a',
      'href': disabled ? undefined : href,
      'class': ['ui-link', { external: isExternal }],
      'aria-disabled': disabled ? 'true' : undefined,
      'target': target ?? (isExternal && '_blank'),
      'role': disabled ? 'link' : undefined,
      'tabindex': disabled ? -1 : undefined,
    } : as === 'button' ? { as, type, disabled } : { as }"
    :rel
    @click="onClickWrapper"
  >
    <slot />
  </Primitive>
</template>

<script lang="ts">
import type { LinkProps } from './Link.vue'

export interface LinkBaseProps {
  as?: string
  type?: string
  disabled?: boolean
  onClick?: ((e: MouseEvent) => void | Promise<void>) | Array<((e: MouseEvent) => void | Promise<void>)>
  href?: string
  navigate?: (e: MouseEvent) => void
  target?: LinkProps['target']
  rel?: LinkProps['rel']
  active?: boolean
  isExternal?: boolean
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<LinkBaseProps>(), {
  as: 'button',
  type: 'button',
})

function onClickWrapper(e: MouseEvent) {
  if (props.disabled) {
    e.stopPropagation()
    e.preventDefault()
    return
  }

  if (props.onClick) {
    for (const onClick of Array.isArray(props.onClick) ? props.onClick : [props.onClick]) {
      onClick(e)
    }
  }

  if (props.href && props.navigate && !props.isExternal)
    props.navigate(e)
}
</script>

<style lang="postcss">
.ui-link {
  text-underline-offset: 4px;

  @media (hover) {
    &.underline:is(:not(:disabled, [disabled])):hover {
      text-decoration-line: underline;
    }
  }

  &.external {
    cursor: alias;
  }
}
</style>
