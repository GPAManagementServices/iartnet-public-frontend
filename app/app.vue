<template>
  <UiApp :locale="localeProperties">
    <!-- <NuxtLoadingIndicator :height="2" color="var(--ui-neutral-text)" /> -->
    <NuxtRouteAnnouncer />
    <AppHeader />
    <NuxtPage />
    <CookieBanner />
    <AppFooter />
  </UiApp>
</template>

<script setup lang="ts">
// const appConfig = useAppConfig()
const { localeProperties } = useI18n()
</script>
