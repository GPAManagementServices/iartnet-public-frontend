<template>
  <NuxtLink
    v-slot="{ href, navigate, route: linkRoute, rel, target, isExternal, isActive, isExactActive }"
    v-bind="nuxtLinkProps"
    :to
    custom
  >
    <template v-if="custom">
      <slot
        v-bind="{
          ...$attrs,
          ...(exact && isExactActive ? { 'aria-current': props.ariaCurrentValue } : {}),
          as,
          type,
          disabled,
          href,
          navigate,
          rel,
          target,
          isExternal,
          active: isLinkActive({ route: linkRoute, isActive, isExactActive, isExternal }),
        }"
      />
    </template>
    <UiLinkBase
      v-else
      v-bind="{
        ...$attrs,
        ...(exact && isExactActive ? { 'aria-current': props.ariaCurrentValue } : {}),
        as,
        type,
        disabled,
        href,
        navigate,
        rel,
        target,
        isExternal,
      }"
      :class="[resolveLinkClass({ route: linkRoute, isActive, isExactActive, isExternal }), { underline }]"
    >
      <slot :active="isLinkActive({ route: linkRoute, isActive, isExactActive, isExternal })" />
    </UiLinkBase>
  </NuxtLink>
</template>

<script lang="ts">
import type { RouteLocationRaw, RouterLinkProps } from 'vue-router'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from '../../types/html'
import { isEqual } from 'ohash/utils'
import { useForwardProps } from 'reka-ui'

interface NuxtLinkProps extends Omit<RouterLinkProps, 'to'> {
  /**
   * Route Location the link should navigate to when clicked on.
   */
  to?: RouteLocationRaw
  /**
   * An alias for `to`. If used with `to`, `href` will be ignored
   */
  href?: NuxtLinkProps['to']
  /**
   * Forces the link to be considered as external (true) or internal (false). This is helpful to handle edge-cases
   */
  external?: boolean
  /**
   * Where to display the linked URL, as the name for a browsing context.
   */
  target?: '_blank' | '_parent' | '_self' | '_top' | (string & {}) | null
  /**
   * A rel attribute value to apply on the link. Defaults to "noopener noreferrer" for external links.
   */
  rel?: 'noopener' | 'noreferrer' | 'nofollow' | 'sponsored' | 'ugc' | (string & {}) | null
  /**
   * If set to true, no rel attribute will be added to the link
   */
  noRel?: boolean
  /**
   * A class to apply to links that have been prefetched.
   */
  prefetchedClass?: string
  /**
   * When enabled will prefetch middleware, layouts and payloads of links in the viewport.
   */
  prefetch?: boolean
  /**
   * Allows controlling when to prefetch links. By default, prefetch is triggered only on visibility.
   */
  prefetchOn?: 'visibility' | 'interaction' | Partial<{
    visibility: boolean
    interaction: boolean
  }>
  /**
   * Escape hatch to disable `prefetch` attribute.
   */
  noPrefetch?: boolean
  /**
   * An option to either add or remove trailing slashes in the `href` for this specific link.
   * Overrides the global `trailingSlash` option if provided.
   */
  trailingSlash?: 'append' | 'remove'
}

export interface LinkProps extends NuxtLinkProps, /** @vue-ignore */ Omit<ButtonHTMLAttributes, 'type' | 'disabled'>, /** @vue-ignore */ Omit<AnchorHTMLAttributes, 'href' | 'target' | 'rel' | 'type'> {
  /**
   * The element or component this component should render as when not a link.
   * @defaultValue 'button'
   */
  as?: any
  /**
   * The type of the button when not a link.
   * @defaultValue 'button'
   */
  type?: ButtonHTMLAttributes['type']
  disabled?: boolean
  /** Force the link to be active independent of the current route. */
  active?: boolean
  /** Allows controlling how the current route sets the link as active. */
  exact?: boolean | 'partial'
  /** Allows controlling how the current route query sets the link as active. */
  exactQuery?: boolean | 'partial'
  /** Will only be active if the current route hash is an exact match. */
  exactHash?: boolean
  /** The class to apply when the link is inactive. */
  inactiveClass?: string
  custom?: boolean
  underline?: boolean
  class?: any
}

export interface LinkSlots {
  default: (props: { active: boolean }) => any
}
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<LinkProps>(), {
  as: 'button',
  type: 'button',
  ariaCurrentValue: 'page',
  active: undefined,
  activeClass: 'is-active',
  exactActiveClass: 'is-exact-active',
  underline: true,
})
defineSlots<LinkSlots>()

const route = useRoute()

const nuxtLinkProps = useForwardProps(reactiveOmit(props, 'as', 'type', 'disabled', 'active', 'exact', 'exactQuery', 'exactHash', 'activeClass', 'inactiveClass', 'to', 'href', 'custom', 'underline', 'class'))

const to = computed(() => props.to ?? props.href)

function isLinkActive({ route: linkRoute, isActive, isExactActive, isExternal }: any) {
  if (props.active !== undefined)
    return props.active

  if (!props.to || !route || isExternal)
    return false

  if (props.exactQuery === 'partial') {
    if (!isPartiallyEqual(linkRoute.query, route.query))
      return false
  }
  else if (props.exactQuery === true) {
    if (!isEqual(linkRoute.query, route.query))
      return false
  }

  if (props.exactHash && linkRoute.hash !== route.hash)
    return false

  if (props.exact && isExactActive)
    return true

  if (props.exact === 'partial') {
    if (isExactActive || route.path.includes(linkRoute?.path))
      return true
  }
  else if (!props.exact && isActive) {
    return true
  }

  return false
}

function resolveLinkClass({ route, isActive, isExactActive, isExternal }: any) {
  const active = isLinkActive({ route, isActive, isExactActive, isExternal })

  return [
    active
      ? isExactActive
        ? [props.activeClass, props.exactActiveClass]
        : props.activeClass
      : props.inactiveClass,
    props.class,
  ]
}
</script>
