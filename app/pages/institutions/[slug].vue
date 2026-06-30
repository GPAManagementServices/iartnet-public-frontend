<template>
  <div v-if="data">
    <HeaderMain :breadcrumb="[{ label: $t('Institutions'), icon: 'arrow-left', to: $localePath('institutions') }]" :title="data.name">
      <UiLink v-if="data.website" :to="websiteHref">
        {{ websiteDisplayHost }}
      </UiLink>
    </HeaderMain>
    <main class="app-content app-padding">
      <img
        v-if="data.media.cover_image"
        :src="data.media.cover_image.url"
        :alt="data.media.cover_image.alt ?? undefined"
        class="app-rounded"
      >
      <AppBlock>
        <div class="double-column">
          <div>
            <img
              v-if="data.media.logo"
              :src="data.media.logo.url"
              :alt="data.media.logo.alt ?? undefined"
              class="logo"
            >
          </div>
          <div v-if="data.description" class="rich-text institution-description" v-html="data.description" />
        </div>
      </AppBlock>
    </main>
  </div>
</template>

<script setup lang="ts">
import { institutionWebsiteDisplayHost, institutionWebsiteHref } from '#shared/utils/institutionWebsiteDisplay'

const { locale } = useI18n()

const route = useRoute('institutions-slug___en')
const { data } = await useFetch(`/api/institutions/${route.params.slug}`, {
  query: {
    locale: locale.value,

  },
})
if (!data.value)
  throw createError({ status: 404, statusText: $t('Page Not Found') })

const websiteHref = computed(() => institutionWebsiteHref(data.value?.website))
const websiteDisplayHost = computed(() => institutionWebsiteDisplayHost(data.value?.website))

const setI18nParams = useSetI18nParams()
setI18nParams({
  en: { slug: data.value.translations.slug.en },
  it: { slug: data.value.translations.slug.it },
})

const meta_title = computed(() => data.value?.meta.title || data.value?.name)

// la description è la concatenazione di meta.description o subtitle o abstract_text se è vuoto
const meta_description = computed(() => {
  const cleanItem = data.value?.meta.description || data.value?.name
  return cleanItem || null
})

// le keywords sono le categorie concatenate a institutions
const keywords = computed(() => {
  if (!data.value?.categories.length)
    return ''

  const categories = data.value?.categories.map(category => category.name).flat().filter(Boolean)
  return categories.join(', ')
})

useCmsDetailSeo({ meta_title: meta_title.value, meta_description: meta_description.value, keywords: keywords.value })
</script>

<style lang="postcss" scoped>
header {
  padding-inline: 0;
  @supports not (padding-inline: 0) {
    padding-left: 0;
    padding-right: 0;
  }

  :deep(> *) {
    width: 100%;
    max-width: var(--app-content);
    margin-inline: auto;
    padding-inline: var(--app-padding);
    @supports not (margin-inline: 0) {
      margin-left: auto;
      margin-right: auto;
      padding-left: var(--app-padding);
      padding-right: var(--app-padding);
    }
  }
}

main {
  display: flex;
  flex-direction: column;
  gap: var(--app-gap);
  margin-block: 64px 96px;

  .double-column {
    --min: 512px;
    display: grid;
    column-gap: var(--app-gap);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--min)), 1fr));
  }

  .logo {
    max-width: 128px;
    margin-block-end: 24px;
    @supports not (margin-block-end: 0) {
      margin-bottom: 24px;
    }
  }

  .institution-description {
    max-width: 60ch;
    margin-left: auto;
  }
}
</style>
