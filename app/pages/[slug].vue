<template>
  <div v-if="data">
    <HeaderMain :breadcrumb="[{ label: $t('Homepage'), icon: 'arrow-left', to: $localePath('index') }]" :title="data.title">
      <figure v-if="data.media.cover_image">
        <img class="app-rounded" :src="data.media.cover_image.url" :alt="data.media.cover_image.alt ?? undefined">
        <figcaption v-if="data.media.cover_image?.caption">
          {{ data.media.cover_image.caption }}
        </figcaption>
      </figure>
    </HeaderMain>

    <main class="app-padding app-content rich-text" v-html="data.description" />
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()

const route = useRoute('slug___en')
const { data } = await useFetch<Page>(`/api/pages/${route.params.slug}`, {
  query: {
    locale: locale.value,
  },
})
if (!data.value)
  throw createError({ status: 404, statusText: $t('Page Not Found') })

const setI18nParams = useSetI18nParams()
setI18nParams({
  en: { slug: data.value?.translations.slug.en },
  it: { slug: data.value?.translations.slug.it },
})
</script>

<style lang="postcss" scoped>
header figure {
  display: flex;
  flex-direction: column;
  gap: 7px;
  max-width: max(320px, 60vw);
  margin: 64px auto 8px;

  img {
    max-width: 100%;
    object-fit: contain;
  }

  figcaption {
    font-size: var(--ui-text-small);
  }
}

main {
  max-width: 60ch;
  margin-left: auto;
  margin-bottom: 96px;
  font-size: var(--text);
}
</style>
