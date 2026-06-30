<template>
  <div v-if="items.length" class="activity-attachments-root">
    <section
      class="activity-attachments"
      aria-labelledby="activity-attachments-heading"
    >
      <h4 id="activity-attachments-heading" class="activity-attachments__role-title">
        {{ $t(documentsTitleKey) }}
      </h4>
      <div class="activity-attachments__column">
        <div
          class="activity-attachments__carousel-zone"
          :class="{ 'activity-attachments__carousel-zone--grid': useGridLayout }"
        >
          <p class="activity-attachments__hint">
            {{ $t(pdfCarouselHintKey) }}
          </p>
          <div
            v-if="useGridLayout"
            class="activity-attachments__grid"
          >
            <article
              v-for="item in items"
              :key="item.id"
              class="activity-attachments__slide activity-attachments__slide--grid"
            >
              <button
                type="button"
                class="activity-attachments__open"
                :aria-label="$t('Open PDF document', { name: displayLabel(item) })"
                @click="openItem(item)"
              >
                <ActivityPdfThumbnail
                  :url="item.url"
                  :aria-label="displayLabel(item)"
                  :loading-text="$t('Loading')"
                />
              </button>
              <p class="activity-attachments__name">
                {{ displayLabel(item) }}
              </p>
              <a
                class="activity-attachments__download"
                :href="item.url"
                :download="activityAttachmentDownloadFilename(item)"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="$t('Download PDF document', { name: displayLabel(item) })"
              >
                {{ $t('Download PDF') }}
              </a>
            </article>
          </div>
          <div v-else class="activity-attachments__carousel-wrap">
            <UiCarousel
              class="activity-attachments__carousel"
              :items="items"
              spacing="16px"
              arrows
            >
              <template #default="{ item }">
                <article class="activity-attachments__slide">
                  <button
                    type="button"
                    class="activity-attachments__open"
                    :aria-label="$t('Open PDF document', { name: displayLabel(item) })"
                    @click="openItem(item)"
                  >
                    <ActivityPdfThumbnail
                      :url="item.url"
                      :aria-label="displayLabel(item)"
                      :loading-text="$t('Loading')"
                    />
                  </button>
                  <p class="activity-attachments__name">
                    {{ displayLabel(item) }}
                  </p>
                  <a
                    class="activity-attachments__download"
                    :href="item.url"
                    :download="activityAttachmentDownloadFilename(item)"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="$t('Download PDF document', { name: displayLabel(item) })"
                  >
                    {{ $t('Download PDF') }}
                  </a>
                </article>
              </template>
            </UiCarousel>
          </div>
        </div>
      </div>
    </section>

    <UiDialog
      v-model:open="dialogOpen"
      :title="dialogTitle"
      max-width="min(100vw - 32px, 1200px)"
      @update:open="onDialogToggle"
    >
      <ActivityPdfInnerViewer
        v-if="dialogOpen && activeItem"
        :key="activeItem.id"
        :url="activeItem.url"
        :download-filename="activityAttachmentDownloadFilename(activeItem)"
      />
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import type { ActivityAttachment } from '#shared/types/api'
import {
  activityAttachmentDisplayLabel,
  activityAttachmentDownloadFilename,
  activityPdfAttachments,
} from '#shared/utils/activityAttachment'
import ActivityPdfInnerViewer from '~/components/Activities/ActivityPdfInnerViewer.client.vue'
import ActivityPdfThumbnail from '~/components/Activities/ActivityPdfThumbnail.client.vue'

const props = withDefaults(defineProps<{
  attachments: ActivityAttachment[] | undefined
  /** Chiave i18n titolo sezione (default: documenti activity). */
  documentsTitleKey?: string
  /** Chiave i18n testo hint carosello PDF. */
  pdfCarouselHintKey?: string
}>(), {
  documentsTitleKey: 'Activity documents',
  pdfCarouselHintKey: 'Activity PDF carousel hint',
})

const items = computed(() => activityPdfAttachments(props.attachments))

/** Allineamento Figma: griglia 2 colonne solo con pochi PDF; altrimenti carousel. */
const useGridLayout = computed(() => items.value.length > 0 && items.value.length <= 4)

function displayLabel(a: ActivityAttachment): string {
  return activityAttachmentDisplayLabel(a)
}

const dialogOpen = ref(false)
const activeItem = ref<ActivityAttachment | null>(null)

const dialogTitle = computed(() =>
  activeItem.value ? displayLabel(activeItem.value) : '',
)

function openItem(item: ActivityAttachment): void {
  activeItem.value = item
  dialogOpen.value = true
}

function onDialogToggle(open: boolean): void {
  if (!open)
    activeItem.value = null
}
</script>

<style lang="postcss" scoped>
.activity-attachments-root {
  margin-block: 0;
}

.activity-attachments {
  display: grid;
  grid-template-columns: minmax(0, 520px) minmax(0, 1fr);
  align-items: start;
  column-gap: max(40px, var(--app-padding));
  row-gap: 12px;
  padding-block: var(--app-padding);
  border-top: 1px solid var(--ui-neutral-border);
}

.activity-attachments__role-title {
  margin: 0;
  font-size: var(--ui-text-large);
  font-weight: var(--bold);
  line-height: 1.2;
  align-self: start;
}

.activity-attachments__column {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-width: 0;
}

.activity-attachments__carousel-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

.activity-attachments__carousel-zone--grid {
  align-items: stretch;
}

.activity-attachments__grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 767px) {
  .activity-attachments__grid {
    grid-template-columns: 1fr;
  }
}

.activity-attachments__slide--grid {
  min-width: 0;
}

@media (min-width: 768px) {
  .activity-attachments__slide--grid {
    max-width: 254px;
  }
}

.activity-attachments__carousel-wrap {
  display: flex;
  width: 100%;
  justify-content: center;
  min-width: 0;
}

@media (max-width: 767px) {
  .activity-attachments {
    grid-template-columns: 1fr;
  }
}

.activity-attachments__hint {
  margin: 0;
  margin-inline: auto;
  font-size: var(--ui-text-small);
  color: var(--gray-6, #666);
  max-width: 60ch;
  text-align: center;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    opacity 180ms ease-out,
    max-height 280ms ease-out,
    margin-block 180ms ease-out;
}

/*
.activity-attachments__carousel-zone:hover .activity-attachments__hint,
.activity-attachments__carousel-zone:focus-within .activity-attachments__hint {
  max-height: 20em;
  opacity: 1;
  margin-block-end: 24px;
}
*/

.activity-attachments__carousel {
  flex: 0 1 auto;
  width: auto;
  max-width: 100%;

  :deep(.CarouselSlide) {
    flex: 0 0 auto !important;
    max-width: min(100%, 320px);
  }

  :deep(.CarouselControls) {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
  }
}

.activity-attachments__slide {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-inline-end: 8px;
}

.activity-attachments__open {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  text-align: start;
}

.activity-attachments__open:focus-visible {
  outline: 2px solid var(--ui-focus, #0066cc);
  outline-offset: 4px;
}

.activity-attachments__name {
  margin: 0;
  font-size: var(--ui-text-small);
  line-height: 1.3;
  word-break: break-word;
}

.activity-attachments__download {
  align-self: flex-start;
  margin: 0;
  font-size: var(--ui-text-small);
  font-weight: var(--medium);
  line-height: 1.3;
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.activity-attachments__download:hover {
  opacity: 0.85;
}

.activity-attachments__download:focus-visible {
  outline: 2px solid var(--ui-focus, #0066cc);
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
