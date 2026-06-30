<template>
  <article class="press-document-item">
    <UiBadge
      v-if="item.category"
      rounded
      size="xs"
      variant="outline"
      class="press-document-item__badge uppercase"
    >
      {{ item.category }}
    </UiBadge>
    <h3 class="press-document-item__title">
      <a
        v-if="destinationUrl"
        class="press-document-item__link"
        :href="destinationUrl"
        :download="downloadAttr"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ item.title }}
      </a>
      <span v-else>{{ item.title }}</span>
    </h3>
    <UiTime
      v-if="dateTimeStart"
      class="press-document-item__date"
      :datetimestart="dateTimeStart"
      day="2-digit"
      month="2-digit"
      year="numeric"
      locale="en-GB"
    />
  </article>
</template>

<script setup lang="ts">
import type { PressDocument } from '#shared/types/api'

const props = defineProps<{
  item: PressDocument
}>()

const destinationUrl = computed(() => props.item.destination?.url ?? null)

const downloadAttr = computed(() => {
  const destination = props.item.destination
  if (destination?.type === 'file')
    return destination.fileName
  return undefined
})

const dateTimeStart = computed(() =>
  props.item.date ? `${props.item.date}T00:00:00` : undefined,
)
</script>

<style lang="postcss" scoped>
.press-document-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.press-document-item__badge {
  align-self: flex-start;
}

.press-document-item__title {
  margin: 0;
  font-size: var(--text-small);
  font-weight: var(--bold);
  line-height: 1.4;
  word-break: break-word;
}

.press-document-item__date {
  font-size: var(--text-small);
  font-weight: var(--regular);
  line-height: 1.4;
}

.press-document-item__link {
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
