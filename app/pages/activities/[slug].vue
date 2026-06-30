<template>
  <div v-if="data" class="activity-page-root">
    <HeaderMain
      hero-variant="activity"
      :breadcrumb="[{ label: $t('Activities'), icon: 'arrow-left', to: $localePath('activities') }]"
    >
      <div class="activity__header">
        <div class="activity__meta">
          <ul>
            <li v-for="{ id, name } in data.categories" :key="id" class="uppercase">
              <UiBadge rounded size="xs" variant="soft">
                {{ name }}
              </UiBadge>
            </li>
          </ul>
          <UiTime
            v-if="data.start_date"
            :datetimestart="computeDate(data.start_date, data.start_hour)!"
            :datetimeend="computeDate(data.end_date, data.end_hour)"
            date-style="long"
            :locale
            class="uppercase"
          />
        </div>
        <h1 class="title-large">
          {{ data.title }}
        </h1>
        <p v-if="activitySubtitle" class="activity__subtitle">
          {{ activitySubtitle }}
        </p>
        <small class="uppercase"> {{ data.location }} </small>
      </div>
    </HeaderMain>
    <main class="app-padding app-content activity-main">
      <figure v-if="data.media.cover_image" class="activity-cover-wrap">
        <AppResponsiveImage
          v-if="data.media.cover_image.path"
          :path="data.media.cover_image.path"
          :alt="data.media.cover_image.alt ?? data.media.cover_image.title ?? ''"
          :fallback-src="data.media.cover_image.url"
          sizes="(max-width: 768px) 100vw, min(100vw, 1400px)"
          :widths="[640, 960, 1400, 1920]"
          fit="max"
          priority
          img-class="app-rounded activity-cover"
        />
        <img
          v-else
          :src="data.media.cover_image.url"
          :alt="data.media.cover_image.alt ?? data.media.cover_image.title ?? ''"
          class="app-rounded activity-cover"
        >
        <figcaption v-if="captionForMedia(data.media.cover_image)" class="activity-caption">
          {{ captionForMedia(data.media.cover_image) }}
        </figcaption>
      </figure>

      <section v-if="data.description?.trim()" class="activity__description">
        <div
          class="activity__description-body"
          :class="{ 'activity__description-body--faded': showDescriptionFade }"
        >
          <div
            class="rich-text"
            :class="[{ 'line-clamp-3': !descriptionExpanded }]"
            v-html="data.description"
          />
        </div>
        <div
          v-if="canToggleDescription"
          class="activity__description-toggle-wrap"
        >
          <UiButton
            variant="outline"
            size="sm"
            rounded
            @click="descriptionExpanded = !descriptionExpanded"
          >
            {{ descriptionExpanded ? $t('Read less') : $t('Read more') }}
          </UiButton>
        </div>
      </section>

      <section
        v-if="orderedPeopleGroups.length || sortedInstitutions.length"
        class="activity__info"
      >
        <div
          v-for="group in orderedPeopleGroups"
          :key="group.i18nKey"
          class="activity__group"
        >
          <h4 class="activity__role-title">
            {{ $t(peopleGroupTitleKey('activity', group)) }}
          </h4>
          <UiCollapsible v-if="group.people.length > 8" :min-height="120">
            <template #default="{ open }">
              <UiButton
                variant="outline"
                size="sm"
                rounded
              >
                {{ open ? $t('Read less') : $t('Read more') }}
              </UiButton>
            </template>
            <template #content>
              <ul class="people-rows-list">
                <li v-for="person in group.people" :key="person.id" class="activity-person-row">
                  <button
                    v-if="canOpenPerson(person)"
                    type="button"
                    class="person-panel-trigger activity-person-row__name"
                    :title="`${person.first_name} ${person.last_name}`"
                    @click="personPanelSlug = person.slug"
                  >
                    {{ person.first_name }} {{ person.last_name }}
                  </button>
                  <span
                    v-else
                    class="activity-person-row__name"
                    :title="`${person.first_name} ${person.last_name}`"
                  >
                    {{ person.first_name }} {{ person.last_name }}
                  </span>
                </li>
              </ul>
            </template>
          </UiCollapsible>
          <ul v-else class="people-rows-list">
            <li v-for="person in group.people" :key="person.id" class="activity-person-row">
              <button
                v-if="canOpenPerson(person)"
                type="button"
                class="person-panel-trigger activity-person-row__name"
                :title="`${person.first_name} ${person.last_name}`"
                @click="personPanelSlug = person.slug"
              >
                {{ person.first_name }} {{ person.last_name }}
              </button>
              <span
                v-else
                class="activity-person-row__name"
                :title="`${person.first_name} ${person.last_name}`"
              >
                {{ person.first_name }} {{ person.last_name }}
              </span>
            </li>
          </ul>
        </div>

        <div
          v-if="sortedInstitutions.length"
          class="activity__institutions activity__group"
        >
          <h4 class="activity__role-title">
            {{ $t(promotingInstitutionsTitleKey) }}
          </h4>
          <ul class="activity__institutions-list">
            <li v-for="institution in sortedInstitutions" :key="institution.id">
              <NuxtLink
                v-if="institution.description"
                :to="$localePath(`/institutions/${institution.slug}`)"
              >
                {{ institution.name }}
              </NuxtLink>
              <span v-else>{{ institution.name }}</span>
            </li>
          </ul>
        </div>
      </section>

      <ClientOnly>
        <ActivityAttachmentsSection :attachments="data.attachments" />
      </ClientOnly>

      <section
        v-if="galleryItems.length"
        class="activity__gallery-outer"
        :aria-label="$t('Gallery')"
      >
        <div class="activity__gallery">
          <UiCarousel
            class="activity__gallery-carousel"
            :items="galleryItems"
            spacing="8px"
            align="start"
            :loop="false"
            arrows
          >
            <template #default="{ item }">
              <figure class="gallery-item">
                <div class="gallery-item__media">
                  <AppResponsiveImage
                    :path="item.path"
                    :alt="item.alt ?? item.title ?? ''"
                    :fallback-src="item.url"
                    sizes="(max-width: 768px) 92vw, min(860px, 78vw)"
                    :widths="[640, 960, 1200, 1600]"
                    fit="max"
                    img-class="activity-gallery-img"
                  />
                </div>
                <figcaption v-if="captionForMedia(item)">
                  {{ captionForMedia(item) }}
                </figcaption>
              </figure>
            </template>
          </UiCarousel>
        </div>
      </section>

      <section
        v-for="(slot, index) in activityVideoSlots"
        :key="`activity-video-${index}`"
        class="activity__video-section"
      >
        <h4 class="activity-sr-only">
          {{ activityVideoSlots.length > 1 ? `${$t('Video')} ${index + 1}` : $t('Video') }}
        </h4>
        <div v-if="slot.embedUrl" class="activity__video-embed">
          <iframe
            :src="slot.embedUrl"
            :title="activityVideoIframeTitle(index)"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          />
        </div>
        <div v-else-if="slot.channelUrl" class="activity__video-channel">
          <a
            :href="slot.channelUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="activity__video-channel-link"
          >
            {{ $t('Open YouTube channel') }}
          </a>
        </div>
        <div v-else class="activity__video-channel">
          <a
            :href="slot.raw"
            target="_blank"
            rel="noopener noreferrer"
            class="activity__video-channel-link"
          >
            {{ $t('Open video') }}
          </a>
        </div>
      </section>

      <section v-if="backupItems.length" class="activity__backup">
        <h4 class="activity__role-title">
          {{ $t('Backup') }}
        </h4>
        <ul>
          <li v-for="item in backupItems" :key="item">
            {{ item }}
          </li>
        </ul>
      </section>
    </main>

    <UiDialog
      :open="personPanelSlug !== null"
      side="right"
      title=""
      hide-title
      max-width="min(100vw - var(--app-padding), 560px)"
      @update:open="onPersonPanelOpenChange"
    >
      <PersonDetailContent v-if="personPanelSlug" :key="personPanelSlug" :slug="personPanelSlug" />
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import type { Activity, Media, Person } from '#shared/types/api'
import type { OrderedPeopleGroup } from '#shared/utils/detailPeopleOrdered'
import {
  normalizeYoutubeChannelPageUrl,
  normalizeYoutubeEmbedUrl,
  personHasBio,
} from '#shared/utils/detailPage'
import {
  buildOrderedPeopleGroups,

} from '#shared/utils/detailPeopleOrdered'
import ActivityAttachmentsSection from '~/components/Activities/ActivityAttachmentsSection.client.vue'
import PersonDetailContent from '~/components/People/PersonDetailContent.vue'

const { locale } = useI18n()

const route = useRoute('activities-slug___en')
const { data } = await useFetch<Activity>(`/api/activities/${route.params.slug}`, {
  query: {
    locale: locale.value,
  },
})
if (!data.value)
  throw createError({ status: 404, statusText: $t('Page Not Found') })

const setI18nParams = useSetI18nParams()
setI18nParams({
  en: { slug: data.value.translations.slug.en },
  it: { slug: data.value.translations.slug.it },
})

const orderedPeopleGroups = computed(() =>
  buildOrderedPeopleGroups('activity', data.value?.people_groups, locale.value),
)

function peopleGroupTitleKey(page: 'activity' | 'project', group: OrderedPeopleGroup): string {
  const suf = group.people.length === 1 ? 'one' : 'other'
  return `people_role.${page}.${group.i18nKey}.${suf}`
}

const activitySubtitle = computed(() => (data.value?.subtitle ?? '').trim())
const galleryItems = computed(() => data.value?.media.gallery ?? [])
const sortedInstitutions = computed(() =>
  data.value?.institutions ?? [].toSorted((a, b) =>
    (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' })),
)

const promotingInstitutionsTitleKey = computed(() =>
  sortedInstitutions.value.length === 1 ? 'Promoting institution' : 'Promoting institutions',
)

const descriptionExpanded = ref(false)
const canToggleDescription = computed(() => Boolean(data.value?.description?.trim()))
const showDescriptionFade = computed(() =>
  Boolean(canToggleDescription.value && !descriptionExpanded.value),
)

/** Ordine layout: solo `video_urls` dalla risposta API (può essere `[]`). Se il campo non esiste, fallback legacy a `video_url`. */
const activityVideoUrls = computed(() => {
  const a = data.value
  if (!a)
    return []
  if (Array.isArray(a.video_urls))
    return a.video_urls.map(u => (u ?? '').trim()).filter(Boolean)
  const legacy = a.video_url?.trim()
  return legacy ? [legacy] : []
})

const activityVideoSlots = computed(() =>
  activityVideoUrls.value.map(raw => ({
    raw,
    embedUrl: normalizeYoutubeEmbedUrl(raw),
    channelUrl: normalizeYoutubeChannelPageUrl(raw),
  })),
)

function activityVideoIframeTitle(index: number): string {
  const title = data.value?.title ?? ''
  const base = `${title} - YouTube`
  return activityVideoSlots.value.length > 1 ? `${base} (${index + 1})` : base
}

/** Sezione Backup riservata a note tecniche future; le persone non mappate sono in `people_role.*.unmapped`. */
const backupItems = computed((): string[] => [])

function captionForMedia(media: Media | null | undefined): string {
  if (!media)
    return ''
  const localized = locale.value === 'it' ? media.captions?.it : media.captions?.en
  return (localized ?? media.caption ?? '').trim()
}

function canOpenPerson(person: Person): boolean {
  return personHasBio(person)
}

const personPanelSlug = ref<string | null>(null)

function onPersonPanelOpenChange(open: boolean): void {
  if (!open)
    personPanelSlug.value = null
}

const meta_title = computed(() => data.value?.meta.title || data.value?.title)

// la description è la concatenazione di meta.description o subtitle o abstract_text se è vuoto
const meta_description = computed(() => {
  const cleanItem = data.value?.meta.description.replace(/<[^>]*>?/g, '') || data.value?.subtitle.replace(/<[^>]*>?/g, '') || data.value?.abstract_text.replace(/<[^>]*>?/g, '')
  return cleanItem || null
})

// le keywords sono le categorie concatenate a institutions
const keywords = computed(() => {
  if (!data.value?.categories.length && !data.value?.institutions.length)
    return ''

  const categories: Set<string> = new Set(data.value?.categories.map(category => category.name).flat().filter(Boolean))
  const institutions: Set<string> = new Set(data.value?.institutions.map(institution => institution.name).flat().filter(Boolean))
  return [...categories, ...institutions].join(', ')
})

useCmsDetailSeo({ meta_title: meta_title.value, meta_description: meta_description.value, keywords: keywords.value })
</script>

<style lang="postcss" scoped>
.activity-main {
  display: flex;
  flex-direction: column;
  gap: clamp(var(--app-padding), 2.5vw, 48px);
  margin-bottom: 96px;

  small {
    font-size: var(--ui-text-small);
  }
}

@media (min-width: 1024px) {
  .activity-main {
    gap: 64px;
  }
}

.activity-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.activity__header,
.activity__description,
.activity__video-section {
  width: min(100%, 768px);
  margin-inline: auto;
  @supports not (margin-inline: 0) {
    margin-left: auto;
    margin-right: auto;
  }
}

.activity__header {
  display: flex;
  flex-direction: column;
  gap: var(--app-gap);
  margin-top: 96px;

  .activity__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;

    ul {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      font-size: 0;
    }

    time {
      font-size: var(--ui-text-extrasmall);
    }
  }

  .activity__subtitle {
    font-weight: 700;
    font-style: Bold;
    font-size: var(--title);
    leading-trim: NONE;
    line-height: 120%;
    letter-spacing: 0.5px;
    vertical-align: middle;
    color: #8d8d8d;
  }
}

.activity__role-title {
  margin: 0;
  font-size: var(--ui-text-large);
  font-weight: var(--bold);
  line-height: 1.2;
  align-self: start;
}

.activity__group {
  display: grid;
  grid-template-columns: minmax(0, 520px) minmax(0, 1fr);
  align-items: start;
  column-gap: max(40px, var(--app-padding));
  row-gap: 12px;
  padding-block: var(--app-padding);
  border-top: 1px solid var(--ui-neutral-border);
}

.activity__group > :not(h4) {
  min-width: 0;
}

@media (max-width: 767px) {
  .activity__group {
    grid-template-columns: 1fr;
  }
}

.activity-cover {
  width: 100%;
  height: auto;
}

.activity-cover-wrap {
  margin-top: 0;
}

.activity-caption {
  margin-top: 8px;
  font-size: var(--ui-text-small);
}

.activity__info {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: min(100%, 768px);
  margin-inline: auto;
}

.activity__description-body {
  position: relative;
}

.activity__description-body--faded::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4.5rem;
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, var(--gray-1, #fcfcfc));
}

.activity__description-toggle-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.activity__group > :deep(.CollapsibleRoot) {
  width: 100%;
  align-items: stretch;
  gap: 16px;
}

.activity__group > :deep(.CollapsibleRoot > :first-child) {
  align-self: flex-end;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.people-rows-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.activity-person-row {
  display: block;
  min-width: 0;
}

.activity-person-row__name {
  font-size: var(--ui-text);
  font-weight: var(--regular);
  line-height: 1.4;
}

.activity__institutions-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin: 0;
  padding: 0;

  li {
    list-style: none;
    line-height: 1.25;
    font-size: var(--ui-text);
    font-weight: var(--bold);
  }
}

.activity__institutions-list a {
  font-weight: var(--bold);
}

.activity__backup {
  margin-top: 32px;
}

.activity__backup .activity__role-title {
  margin-block-end: 16px;
}

.activity__video-section {
  min-width: 0;
}

.activity__gallery-outer {
  margin-block: 0;
}

.activity__gallery {
  --activity-gallery-img-h: clamp(200px, 38vw, 480px);

  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  h2 {
    margin-block: 32px;
    font-size: var(--text);
    font-weight: var(--medium);
  }

  :deep(.activity__gallery-carousel.UiCarousel) {
    width: 100%;
    max-width: 100%;
    margin-inline: 0;
    margin-block: 0;
  }

  /* Spaziatura uniforme tra slide: gap flex al posto di padding/margin negativo del carousel base */
  :deep(.activity__gallery-carousel .CarouselContainer) {
    margin-left: 0;
    gap: var(--slide-spacing);
  }

  /* Slide stretta al minimo: solo larghezza del contenuto (max tetto paesaggio) */
  :deep(.activity__gallery-carousel .CarouselSlide) {
    flex: 0 0 auto !important;
    align-self: flex-start;
    box-sizing: border-box;
    width: fit-content;
    min-width: 0;
    max-width: min(78vw, 860px);
    padding-left: 0 !important;
  }

  :deep(.CarouselControls) {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 10px;
    width: 100%;
    margin-top: 12px;
  }

  /*
   * Table: larghezza figura = cella immagine → caption non allarga la slide oltre la foto.
   */
  .gallery-item {
    display: table;
    width: max-content;
    max-width: min(78vw, 860px);
    margin: 0;
    box-sizing: border-box;
    position: relative;

    .gallery-item__media {
      display: flex;
      align-items: center;
      justify-content: center;
      width: fit-content;
      max-width: min(78vw, 860px);
      height: var(--activity-gallery-img-h);
      border-radius: var(--ui-radius-large, 8px);
      overflow: hidden;
      box-sizing: border-box;
    }

    .activity-gallery-img {
      display: block;
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      object-position: center;
      border-radius: inherit;
    }

    figcaption {
      display: table-caption;
      caption-side: bottom;
      overflow-wrap: break-word;
      padding-block-start: 12px;
      text-align: start;
      font-size: var(--ui-text-small, 0.875rem);
      line-height: 1.4;
      padding-inline: 0;
    }
  }

  /* Nessun width:100% sul placeholder: non allargare il wrapper fit-content */
  .gallery-item__media :deep(.app-responsive-image--pending) {
    display: block;
    width: auto;
    min-height: var(--activity-gallery-img-h);
  }
}

.activity__video-embed iframe {
  width: 100%;
  min-height: 320px;
  border: 0;
  border-radius: 8px;
}

.activity__video-channel-link {
  font-size: var(--text);
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.activity__video-channel-link:hover {
  opacity: 0.85;
}

.person-panel-trigger {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: var(--regular);
  line-height: inherit;
  color: inherit;
  cursor: pointer;
  text-align: start;
  text-decoration: none;
}

.person-panel-trigger:hover {
  opacity: 1;
}

.person-panel-trigger:focus-visible {
  outline: 1px solid currentColor;
  outline-offset: 2px;
}
</style>
