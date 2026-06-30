<template>
  <article class="press-release-card">
    <div
      class="press-release-card__cover"
      :class="{ 'press-release-card__cover--placeholder': !coverUrl }"
      :aria-hidden="!coverUrl ? true : undefined"
    >
      <img
        v-if="coverUrl"
        :src="coverUrl"
        :alt="coverAlt"
        width="127"
        height="160"
        loading="lazy"
        decoding="async"
      >
    </div>
    <div class="press-release-card__info">
      <h3 class="press-release-card__title">
        <a
          v-if="destinationUrl"
          class="press-release-card__link"
          :href="destinationUrl"
          :download="downloadAttr"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ item.title }}
        </a>
        <span v-else>{{ item.title }}</span>
      </h3>
      <p v-if="item.description" class="press-release-card__description">
        {{ item.description }}
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PressRelease } from '#shared/types/api'

const props = defineProps<{
  item: PressRelease
}>()

const coverUrl = computed(() => props.item.cover?.url ?? null)

const coverAlt = computed(() => props.item.cover?.alt ?? '')

const destinationUrl = computed(() => props.item.destination?.url ?? null)

const downloadAttr = computed(() => {
  const destination = props.item.destination
  if (destination?.type === 'file')
    return destination.fileName
  return undefined
})
</script>

<style lang="postcss" scoped>
.press-release-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.press-release-card__cover {
  width: min(100%, 127px);
  aspect-ratio: 127 / 160;
  border: 1px solid var(--ui-neutral-border);
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.press-release-card__cover--placeholder {
  background-color: #e8e8e8;
}

.press-release-card__info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.press-release-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-word;
}

.press-release-card__description {
  margin: 0;
  font-size: 14px;
  font-weight: var(--regular);
  line-height: 1.4;
  color: #666;
  word-break: break-word;
}

.press-release-card__link {
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  &:focus-visible {
    outline: 2px solid var(--ui-focus, #0066cc);
    outline-offset: 2px;
    border-radius: 2px;
  }
}
</style>
