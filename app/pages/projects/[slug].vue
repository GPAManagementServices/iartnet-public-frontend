<template>
  <div v-if="data" class="project-page-root">
    <HeaderMain
      hero-variant="project"
      :breadcrumb="[{ label: $t('Research projects'), icon: 'arrow-left', to: $localePath('projects') }]"
    >
      <div class="project__header">
        <div class="project__meta">
          <ul>
            <li v-for="{ id, name } in data.categories" :key="id" class="uppercase">
              <UiBadge rounded size="xs" variant="soft">
                {{ name }}
              </UiBadge>
            </li>
          </ul>
        </div>
        <h1 class="title-large">
          {{ data.title }}
        </h1>
        <p v-if="projectSubtitle" class="project__subtitle">
          {{ projectSubtitle }}
        </p>
      </div>
    </HeaderMain>
    <main class="app-padding app-content project-main">
      <figure v-if="projectCoverImage" class="project-cover-wrap">
        <AppResponsiveImage
          v-if="projectCoverImage.path"
          :path="projectCoverImage.path"
          :alt="projectCoverImage.alt ?? projectCoverImage.title ?? ''"
          :fallback-src="projectCoverImage.url"
          sizes="(max-width: 768px) 100vw, min(100vw, 1400px)"
          :widths="[640, 960, 1400, 1920]"
          fit="max"
          priority
          img-class="app-rounded project-cover"
        />
        <img
          v-else
          :src="projectCoverImage.url"
          :alt="projectCoverImage.alt ?? projectCoverImage.title ?? ''"
          class="app-rounded project-cover"
        >
        <figcaption v-if="captionForMedia(projectCoverImage)" class="project-caption">
          {{ captionForMedia(projectCoverImage) }}
        </figcaption>
      </figure>

      <section class="project__description">
        <div
          class="project__description-body"
          :class="{ 'project__description-body--faded': showDescriptionFade }"
        >
          <div
            v-if="showAbstract"
            class="project__abstract rich-text"
            v-html="data.abstract_text"
          />
          <div
            v-else
            class="rich-text"
            :class="[{ 'line-clamp-3': !descriptionExpanded }]"
            v-html="data.description"
          />
        </div>
        <div
          v-if="canToggleDescription"
          class="project__description-toggle-wrap"
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
        class="project__info"
      >
        <div
          v-for="group in orderedPeopleGroups"
          :key="group.i18nKey"
          class="project__group"
        >
          <h4 class="project__role-title">
            {{ $t(peopleGroupTitleKey('project', group)) }}
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
                <li v-for="person in group.people" :key="person.id" class="project-person-row">
                  <button
                    v-if="canOpenPerson(person)"
                    type="button"
                    class="person-panel-trigger project-person-row__name"
                    :title="`${person.first_name} ${person.last_name}`"
                    @click="personPanelSlug = person.slug"
                  >
                    {{ person.first_name }} {{ person.last_name }}
                  </button>
                  <span
                    v-else
                    class="project-person-row__name"
                    :title="`${person.first_name} ${person.last_name}`"
                  >
                    {{ person.first_name }} {{ person.last_name }}
                  </span>
                </li>
              </ul>
            </template>
          </UiCollapsible>
          <ul v-else class="people-rows-list">
            <li v-for="person in group.people" :key="person.id" class="project-person-row">
              <button
                v-if="canOpenPerson(person)"
                type="button"
                class="person-panel-trigger project-person-row__name"
                :title="`${person.first_name} ${person.last_name}`"
                @click="personPanelSlug = person.slug"
              >
                {{ person.first_name }} {{ person.last_name }}
              </button>
              <span
                v-else
                class="project-person-row__name"
                :title="`${person.first_name} ${person.last_name}`"
              >
                {{ person.first_name }} {{ person.last_name }}
              </span>
            </li>
          </ul>
        </div>

        <div
          v-if="sortedInstitutions.length"
          class="project__institutions project__group"
        >
          <h4 class="project__role-title">
            {{ $t(promotingInstitutionsTitleKey) }}
          </h4>
          <ul class="project__institutions-list">
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
        <ActivityAttachmentsSection
          :attachments="data.attachments"
          documents-title-key="Project documents"
          pdf-carousel-hint-key="Project PDF carousel hint"
        />
      </ClientOnly>

      <section
        v-if="galleryItems.length"
        class="project__gallery-outer"
        :aria-label="$t('Gallery')"
      >
        <div class="project__gallery">
          <UiCarousel
            class="project__gallery-carousel"
            :items="galleryItems"
            spacing="8px"
            align="start"
            :loop="false"
            arrows
          >
            <template #default="{ item }">
              <figure class="gallery-item">
                <AppResponsiveImage
                  :path="item.path"
                  :alt="item.alt ?? item.title ?? ''"
                  :fallback-src="item.url"
                  sizes="(max-width: 768px) 96vw, (max-width: 1280px) 86vw, 1100px"
                  :widths="[640, 960, 1200, 1600]"
                  fit="crop"
                  img-class="project-gallery-img"
                />
                <figcaption v-if="captionForMedia(item)">
                  {{ captionForMedia(item) }}
                </figcaption>
              </figure>
            </template>
          </UiCarousel>
        </div>
      </section>

      <section
        v-for="(slot, index) in projectVideoSlots"
        :key="`project-video-${index}`"
        class="project__video-section"
      >
        <h4 class="project-sr-only">
          {{ projectVideoSlots.length > 1 ? `${$t('Video')} ${index + 1}` : $t('Video') }}
        </h4>
        <div v-if="slot.embedUrl" class="project__video-embed">
          <iframe
            :src="slot.embedUrl"
            :title="projectVideoIframeTitle(index)"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          />
        </div>
        <div v-else-if="slot.channelUrl" class="project__video-channel">
          <a
            :href="slot.channelUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="project__video-channel-link"
          >
            {{ $t('Open YouTube channel') }}
          </a>
        </div>
        <div v-else class="project__video-channel">
          <a
            :href="slot.raw"
            target="_blank"
            rel="noopener noreferrer"
            class="project__video-channel-link"
          >
            {{ $t('Open video') }}
          </a>
        </div>
      </section>

      <section v-if="backupItems.length" class="project__backup">
        <h4 class="project__role-title">
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
import type { Media, Person, Project } from '#shared/types/api'
import type { OrderedPeopleGroup } from '#shared/utils/detailPeopleOrdered'
import {
  normalizeYoutubeChannelPageUrl,
  normalizeYoutubeEmbedUrl,
  personHasBio,
} from '#shared/utils/detailPage'
import { buildOrderedPeopleGroups } from '#shared/utils/detailPeopleOrdered'
import ActivityAttachmentsSection from '~/components/Activities/ActivityAttachmentsSection.client.vue'
import PersonDetailContent from '~/components/People/PersonDetailContent.vue'

const { locale } = useI18n()

const route = useRoute('projects-slug___en')
const { data } = await useFetch<Project>(`/api/projects/${route.params.slug}`, {
  query: {
    locale: locale.value,
  },
})
if (!data.value)
  throw createError({ status: 404, statusText: $t('Page Not Found') })

const orderedPeopleGroups = computed(() =>
  buildOrderedPeopleGroups('project', data.value?.people_groups, locale.value),
)

function peopleGroupTitleKey(page: 'activity' | 'project', group: OrderedPeopleGroup): string {
  const suf = group.people.length === 1 ? 'one' : 'other'
  return `people_role.${page}.${group.i18nKey}.${suf}`
}

const projectCoverImage = computed(() => data.value?.media?.cover_image ?? data.value?.cover_image ?? null)
const galleryItems = computed(() => data.value?.media?.gallery ?? [])
const sortedInstitutions = computed(() =>
  data.value?.institutions ?? [].toSorted((a, b) =>
    (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' })),
)

const promotingInstitutionsTitleKey = computed(() =>
  sortedInstitutions.value.length === 1 ? 'people_role.project.research_unit.one' : 'people_role.project.research_unit.other',
)

const projectSubtitle = computed(() => (data.value?.subtitle ?? '').trim())

const descriptionExpanded = ref(false)
const hasAbstract = computed(() => Boolean(data.value?.abstract_text?.trim()))
const showAbstract = computed(() => hasAbstract.value && !descriptionExpanded.value)
const canToggleDescription = computed(() => Boolean(data.value?.description?.trim()))
const showDescriptionFade = computed(() =>
  Boolean(canToggleDescription.value && !descriptionExpanded.value && !showAbstract.value),
)

const projectVideoUrls = computed(() => {
  const p = data.value
  if (!p)
    return []
  if (Array.isArray(p.video_urls))
    return p.video_urls.map(u => (u ?? '').trim()).filter(Boolean)
  const legacy = p.video_url?.trim()
  return legacy ? [legacy] : []
})

const projectVideoSlots = computed(() =>
  projectVideoUrls.value.map(raw => ({
    raw,
    embedUrl: normalizeYoutubeEmbedUrl(raw),
    channelUrl: normalizeYoutubeChannelPageUrl(raw),
  })),
)

const youtubeEmbedUrl = computed(() => normalizeYoutubeEmbedUrl(data.value?.video_url))
const youtubeChannelPageUrl = computed(() => normalizeYoutubeChannelPageUrl(data.value?.video_url))

function projectVideoIframeTitle(index: number): string {
  const title = data.value?.title ?? ''
  const base = `${title} - YouTube`
  return projectVideoSlots.value.length > 1 ? `${base} (${index + 1})` : base
}

const backupItems = computed(() => {
  const items: string[] = []
  if (data.value?.video_url && !youtubeEmbedUrl.value && !youtubeChannelPageUrl.value)
    items.push(`${$t('Video')}: ${$t('invalid video URL')}`)
  return items
})

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

const meta_title = computed(() => data.value?.meta_title || data.value?.title)
const meta_description = computed(() => data.value?.meta_description || data.value?.description)

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
.ui-breadcrumb {
  padding: var(--app-padding);
}

.project-main {
  display: flex;
  flex-direction: column;
  gap: clamp(var(--app-padding), 2.5vw, 48px);
  margin-bottom: 96px;

  small {
    font-size: var(--ui-text-small);
  }
}

@media (min-width: 1024px) {
  .project-main {
    gap: 64px;
  }
}

.project-sr-only {
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

.project__header,
.project__description {
  width: min(100%, 768px);
  margin-inline: auto;
  @supports not (margin-inline: 0) {
    margin-left: auto;
    margin-right: auto;
  }
}

.project__header {
  display: flex;
  flex-direction: column;
  gap: var(--app-gap);
  margin-top: 96px;

  .project__meta {
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

  .project__subtitle {
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

.project-cover {
  width: 100%;
  height: auto;
}

.project-cover-wrap {
  margin-top: 0;
}

.project-caption {
  margin-top: 8px;
  font-size: var(--ui-text-small);
}

.project__info {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: min(100%, 768px);
  margin-inline: auto;
}

.project__role-title {
  margin: 0;
  font-size: var(--ui-text-large);
  font-weight: var(--bold);
  line-height: 1.2;
  align-self: start;
}

.project__group {
  display: grid;
  grid-template-columns: minmax(0, 520px) minmax(0, 1fr);
  align-items: start;
  column-gap: max(40px, var(--app-padding));
  row-gap: 12px;
  padding-block: var(--app-padding);
  border-top: 1px solid var(--ui-neutral-border);
}

.project__group > :not(h4) {
  min-width: 0;
}

.project__description {
  font-size: var(--text);
  width: min(100%, 768px);
  margin-inline: auto;
}

.project__description-body {
  position: relative;
}

.project__description-body--faded::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4.5rem;
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, var(--gray-1, #fcfcfc));
}

.project__description-toggle-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.project__group > :deep(.CollapsibleRoot) {
  width: 100%;
  align-items: stretch;
  gap: 16px;
}

/* Trigger è il UiButton (CollapsibleTrigger as-child): primo figlio del root */
.project__group > :deep(.CollapsibleRoot > :first-child) {
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

.project-person-row {
  display: block;
  min-width: 0;
}

.project-person-row__name {
  font-size: var(--ui-text);
  font-weight: var(--regular);
  line-height: 1.4;
}

.project__institutions-list {
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

.project__institutions-list a {
  font-weight: var(--bold);
}

@media (max-width: 767px) {
  .project__group {
    grid-template-columns: 1fr;
  }
}

.project__video-section {
  width: 100%;
  min-width: 0;
}

.project__gallery-outer {
  margin-block: 0;
}

.project__gallery {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  :deep(.project__gallery-carousel.UiCarousel) {
    width: 100%;
    max-width: 100%;
    margin-inline: 0;
    margin-block: 0;
  }

  :deep(.CarouselViewport) {
    overflow-x: hidden;
  }

  :deep(.CarouselSlide) {
    flex: 0 0 min(78%, 860px) !important;
    min-width: 0;
  }

  :deep(.CarouselControls) {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 10px;
    width: 100%;
    margin-top: 12px;
  }

  .gallery-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 12px;
    width: 100%;
    box-sizing: border-box;
    position: relative;
    margin: 0;

    .project-gallery-img {
      display: block;
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: min(85dvh, 92vw, 900px);
      object-fit: contain;
      object-position: center;
      border-radius: 8px;
    }

    figcaption {
      max-width: 100%;
      text-align: start;
      font-size: var(--ui-text-small, 0.875rem);
      line-height: 1.4;
      padding-inline: 0;
    }
  }
}

.project__video-embed iframe {
  width: 100%;
  min-height: 320px;
  border: 0;
  border-radius: 8px;
}

.project__video-channel-link {
  font-size: var(--text);
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.project__video-channel-link:hover {
  opacity: 0.85;
}

.project__backup {
  margin-top: 32px;
}

.project__backup .project__role-title {
  margin-block-end: 16px;
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
