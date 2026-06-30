<template>
  <AppMenu />
  <nav
    aria-label="Primary navigation"
    :class="{ 'app-header--inverted': isNavInverted }"
  >
    <NuxtLink :to="$localePath('index')" style="margin-right: auto;" :aria-label="$t('Homepage')">
      <img
        class="app-header__logo"
        :src="logoSrc"
        style="height: 32px;"
        aria-label="iArtNET"
      >
    </NuxtLink>
    <UiButton variant="ghost" style="text-transform: uppercase;" :to="$localePath('search')">
      {{ $t('Search') }}
    </UiButton>

    <UiButton
      variant="ghost"
      :icon="isMenuOpen ? 'cross' : 'menu'"
      :aria-label="$t('Toggle menu')"
      @click="toggleOpen()"
    />
  </nav>
</template>

<script setup lang="ts">
import { APP_HEADER_LOGO_SRC } from '#shared/constants/appHeaderLogo'
import { useMediaQuery } from '@vueuse/core'
import { useAppHeaderTheme } from '~/composables/useAppHeaderTheme'

const isMenuOpen = useState<boolean>('is-menu-open', () => false)
const toggleOpen = useToggle(isMenuOpen)
const appHeaderTheme = useAppHeaderTheme()
const isDesktopHeaderTheme = useMediaQuery('(min-width: 768px)', { ssrWidth: 768 })

const isLogoInverted = computed(() =>
  isDesktopHeaderTheme.value && appHeaderTheme.value.logo === 'inverted',
)
const isNavInverted = computed(() =>
  isDesktopHeaderTheme.value && appHeaderTheme.value.nav === 'inverted',
)

const logoSrc = computed(() =>
  isLogoInverted.value ? APP_HEADER_LOGO_SRC.inverted : APP_HEADER_LOGO_SRC.default,
)
</script>

<style lang="postcss" scoped>
nav {
  position: absolute;
  top: 0;
  inset-inline: 0;
  @supports not (inset-inline: 0) {
    left: 0;
    right: 0;
  }
  display: flex;
  gap: 4px;
  padding: 28px var(--app-padding);
  z-index: 50;
}

.app-header--inverted :deep(.ui-button.ghost) {
  --color-text: #fff;
  --color-text-hover: rgba(255, 255, 255, 0.88);
  --color-background-hover: rgba(255, 255, 255, 0.12);
}
</style>
