<!-- Dettaglio UI in `people.vue` (UiDialog + PersonDetailContent); route annidata per URL e outlet. -->
<template>
  <span class="people-page-child-shell" aria-hidden="true" />
</template>

<script setup lang="ts">
/** Head SEO only: slug route serves dialog UX, not a standalone SSR detail landing. */
const site = useSiteConfig()
const peopleListUrl = `${site.url.replace(/\/$/, '')}/people`

useSeoMeta({
  robots: 'noindex, follow',
  ogUrl: peopleListUrl,
})

useHead({
  link: [{ rel: 'canonical', href: peopleListUrl }],
})
</script>
