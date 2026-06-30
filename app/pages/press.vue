<template>
  <div class="press-page">
    <HeaderMain :title="data.title" />

    <section
      v-if="hasIntroOrContacts"
      class="press-intro-section"
    >
      <div class="press-intro-section__inner">
        <div class="press-intro-section__content">
          <p v-if="data.intro" class="press-intro-section__text">
            {{ data.intro }}
          </p>
          <ul v-if="data.contacts.length" class="press-contacts">
            <li
              v-for="contact in data.contacts"
              :key="contact.id"
              class="press-contacts__row"
            >
              <span class="press-contacts__label">{{ contact.label }}</span>
              <a
                class="press-contacts__value"
                :href="`mailto:${contact.email}`"
              >
                {{ contact.email }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section
      v-if="data.pressReleases.length"
      class="press-section press-section--releases divider app-padding content"
    >
      <h2 class="press-releases__title">
        {{ pressReleasesTitle }}
      </h2>
      <div class="press-section__inner">
        <div class="press-section__content">
          <ul class="press-releases__list">
            <li
              v-for="item in data.pressReleases"
              :key="item.id"
              class="press-releases__item"
            >
              <PressReleaseCard :item />
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section
      v-if="data.documents.length"
      class="press-section press-section--documents divider app-padding content"
    >
      <h2 class="press-documents__title">
        {{ documentsTitle }}
      </h2>
      <div class="press-section__inner">
        <div class="press-section__content">
          <ul class="press-documents__list">
            <li
              v-for="item in data.documents"
              :key="item.id"
              class="press-documents__item"
            >
              <PressDocumentItem :item />
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { PressPage } from '#shared/types/api'

const { locale } = useI18n()

const pressReleasesTitle = 'Press Releases'
const documentsTitle = 'Documents'

const { data, error } = await useFetch<PressPage>('/api/press', {
  query: { locale },
})

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 500,
    statusMessage: error.value.statusMessage ?? 'Failed to load press page',
  })
}

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
  })
}

const hasIntroOrContacts = computed(
  () => Boolean(data.value?.intro) || (data.value?.contacts.length ?? 0) > 0,
)

useCmsDetailSeo({
  meta_title: data.value.seo.title,
  meta_description: data.value.seo.description,
})
</script>

<style lang="postcss" scoped>
.press-page {
  --press-content-max: 1280px;
  --press-content-inset: 419.42px;
  --press-intro-min-height: 542px;
  --press-intro-padding-top: 80px;
  --press-intro-padding-inline: 40px;
  --press-documents-row-gap: 64px;
  --press-releases-grid-width: 860.58px;
  --press-releases-column-gap: 24px;
  --press-releases-row-gap: 48px;
  --press-releases-title-gap: 40px;
  --press-documents-grid-width: 860.58px;
  --press-documents-column-gap: 12px;
  --press-documents-title-gap: 40px;
}

.press-intro-section {
  box-sizing: border-box;
  width: 100%;
  min-height: var(--press-intro-min-height);
  padding: var(--press-intro-padding-top) var(--press-intro-padding-inline) 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.press-intro-section__inner {
  width: 100%;
  max-width: var(--press-content-max);
  margin-inline: auto;
  padding-bottom: 95px;
}

.press-intro-section__content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.press-intro-section__text {
  margin: 0;
  font-size: var(--text);
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  padding-bottom: 40px;
}

.press-section {
  /* margin-bottom: var(--app-margin); */

  &.divider {
    border-top: 1px solid var(--ui-neutral-border);
  }
}

.press-section__inner {
  width: 100%;
  max-width: var(--press-content-max);
  margin-inline: auto;
  padding-bottom: 80px;
}

.press-section__content {
  width: 100%;
}

.press-section--releases {
  display: flex;
  flex-direction: column;
  gap: var(--press-releases-title-gap);
}

.press-section--documents {
  display: flex;
  flex-direction: column;
  gap: var(--press-documents-title-gap);
}

.press-releases__title,
.press-documents__title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0;
}

.press-releases__list {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: var(--press-releases-grid-width);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  column-gap: var(--press-releases-column-gap);
  row-gap: 24px;
}

.press-releases__item {
  min-width: 0;
}

.press-contacts {
  list-style: none;
  margin: 0;
  padding: 0;
}

.press-contacts__row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  padding: 0.5em 0 1em;
  border-top: 1px solid #aaa;
  min-width: 0;
}

.press-contacts__label {
  font-size: var(--text-small);
  font-weight: var(--regular);
  line-height: 1.4;
  letter-spacing: 0.45px;
  text-transform: uppercase;
}

.press-contacts__value {
  font-size: var(--text-small);
  font-weight: var(--bold);
  line-height: 1.4;
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  word-break: break-word;

  &:focus-visible {
    outline: 2px solid var(--ui-focus, #0066cc);
    outline-offset: 2px;
    border-radius: 2px;
  }
}

.press-documents__list {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: var(--press-documents-grid-width);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  column-gap: var(--press-documents-column-gap);
  row-gap: 24px;
}

.press-documents__item {
  min-width: 0;
}

@media (max-width: 767px) {
  .press-intro-section {
    min-height: auto;
    padding-top: 32px;
    padding-inline: var(--app-padding);
  }

  .press-intro-section__content {
    gap: 32px;
  }
}

@media (min-width: 768px) {
  .press-intro-section__content,
  .press-section__content {
    padding-left: calc(var(--press-content-inset) / var(--press-content-max) * 100%);
    box-sizing: border-box;
  }

  .press-contacts__row {
    flex-direction: row;
    gap: 8px;
    padding: 0.5em 0 1em;
  }

  .press-contacts__label,
  .press-contacts__value {
    flex: 0 0 calc((100% - 8px) / 2);
    max-width: calc((100% - 8px) / 2);
    font-size: var(--text);
    line-height: 1.4;
  }

  .press-releases__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: var(--press-releases-row-gap);
  }

  .press-documents__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: var(--press-documents-row-gap);
  }
}

@media (min-width: 1024px) {
  .press-releases__list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .press-documents__list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
