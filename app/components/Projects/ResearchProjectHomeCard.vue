<template>
  <article class="research-project-home-card app-rounded">
    <figure
      v-if="item.cover_image"
      class="research-project-home-card__cover"
    >
      <AppResponsiveImage
        v-if="getCmsMediaPath(item.cover_image)"
        :path="getCmsMediaPath(item.cover_image)"
        :alt="item.cover_image.alt ?? ''"
        :fallback-src="item.cover_image.url"
        sizes="(max-width: 768px) 100vw, 400px"
        :widths="[400, 640, 960]"
        fit="max"
      />
      <img
        v-else-if="item.cover_image.url"
        :src="item.cover_image.url"
        :alt="item.cover_image.alt ?? undefined"
      >
    </figure>

    <NuxtLink
      :to="projectTo"
      class="research-project-home-card__hit-area stretched-link"
      :aria-label="item.title"
    />

    <div class="research-project-home-card__body">
      <h3 class="research-project-home-card__title">
        {{ item.title }}
      </h3>
      <p v-if="subtitle" class="research-project-home-card__subtitle">
        {{ subtitle }}
      </p>
    </div>

    <footer class="research-project-home-card__footer">
      <UiButton
        :to="projectTo"
        icon="arrow-right"
        variant="outline"
        rounded
        size="md"
        tabindex="-1"
        aria-hidden="true"
      />
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { Project } from '#shared/types/api'
import { getCmsMediaPath } from '#shared/utils/cmsMedia'

const props = defineProps<{
  item: Project
}>()

const localePath = useLocalePath()

const projectTo = computed(() =>
  localePath({ name: 'projects-slug', params: { slug: props.item.slug } }),
)

const subtitle = computed(() => {
  const t = (props.item.subtitle ?? '').trim()
  return t.length ? t : null
})
</script>

<style lang="postcss" scoped>
.research-project-home-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  aspect-ratio: 1 / 1;
  min-height: 0;
  border: 1px solid var(--ui-neutral-border, #e0e0e0);
  background: var(--ui-neutral-background, #fff);
  padding: clamp(16px, 2vw, 24px);
  overflow: hidden;
  cursor: pointer;
}

.research-project-home-card__cover {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  transition: opacity 0.4s ease-out;
  z-index: 2;
  pointer-events: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.research-project-home-card:hover .research-project-home-card__cover {
  opacity: 1;
}

.research-project-home-card__hit-area {
  z-index: 10;
}

.research-project-home-card__body {
  position: relative;
  z-index: 3;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.research-project-home-card__title {
  margin: 0;
  font-size: clamp(16px, 1.6vw, 20px);
  font-weight: var(--bold, 700);
  line-height: 1.25;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}

.research-project-home-card__subtitle {
  margin: 0;
  font-size: clamp(14px, 1.4vw, 18px);
  font-weight: 500;
  line-height: 1.3;
  color: #8d8d8d;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.research-project-home-card__footer {
  position: relative;
  z-index: 3;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  margin-top: auto;
  padding-top: 12px;
  pointer-events: none;

  :deep(.ui-button),
  :deep(.ui-link),
  :deep(button) {
    pointer-events: none;
    background-color: var(--ui-neutral-background, #fff);
  }
}
</style>
