<template>
  <article class="card app-rounded" :class="[`card--${variant}`]">
    <figure v-if="item.cover_image" class="card__cover" :class="[`card__cover--${variant}`]">
      <AppResponsiveImage
        v-if="getCmsMediaPath(item.cover_image)"
        :path="getCmsMediaPath(item.cover_image)"
        :alt="item.cover_image.alt ?? ''"
        :fallback-src="item.cover_image.url"
        sizes="(max-width: 768px) 100vw, min(100%, 400px)"
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
      v-if="variant === 'default'"
      :to="projectTo"
      class="card__hit-area"
      tabindex="-1"
      aria-hidden="true"
    />

    <div class="card__content">
      <UiBadge
        v-if="item.badge && variant === 'featured'"
        :size="badgeSize"
        variant="outline"
        rounded
        class="card__badge"
      >
        {{ item.badge }}
      </UiBadge>

      <h3 class="card__title" :class="[{ 'card__title--featured': variant === 'featured' }]">
        {{ item.title }}
      </h3>

      <p v-if="subtitle && variant !== 'featured'" class="card__subtitle">
        {{ subtitle }}
      </p>

      <p v-if="item.meta_description && variant === 'featured'" class="card__description">
        {{ item.meta_description }}
      </p>

      <footer class="card__footer">
        <div class="card__tags">
          <UiBadge
            v-for="{ name } in item.categories"
            :key="name"
            :size="badgeSize"
            variant="primary"
            rounded
          >
            {{ name }}
          </UiBadge>
        </div>
        <UiButton
          :to="projectTo"
          :class="variant !== 'default' ? 'stretched-link' : undefined"
          icon="arrow-right"
          variant="outline"
          rounded
          :size="buttonSize"
          :aria-label="$t('Read more about', { title: item.title })"
        />
      </footer>
    </div>
  </article>
</template>

<script setup lang="ts">
import { getCmsMediaPath } from '#shared/utils/cmsMedia'

export interface ArtisticPracticeItem extends Project {
  type: 'featured' | 'normal' | 'wide'
  badge?: string
}

const props = withDefaults(defineProps<{
  item: ArtisticPracticeItem
  variant?: 'featured' | 'default' | 'compact'
  size?: 'sm' | 'md' | 'lg'
}>(), {
  variant: 'default',
  size: 'md',
})

const localePath = useLocalePath()
const projectTo = computed(() =>
  localePath({ name: 'projects-slug', params: { slug: props.item.slug } }),
)

const subtitle = computed(() => {
  const t = (props.item.subtitle ?? '').trim()
  return t.length ? t : null
})

const badgeSize = computed(() => {
  const sizeMap = { sm: 'xs', md: 'sm', lg: 'sm' } as const
  return sizeMap[props.size]
})

const buttonSize = computed(() => {
  const sizeMap = { sm: 'md', md: 'xl', lg: 'xl' } as const
  return sizeMap[props.size]
})
</script>

<style lang="postcss" scoped>
.card {
  position: relative;
  border: 1px solid var(--ui-neutral-solid);
  overflow: hidden;
  background: var(--ui-neutral-background);
  cursor: pointer;
}

.card__content {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: clamp(8px, 2vw, 24px);
}

.card__badge {
  align-self: flex-start;
  margin-bottom: 8px;
}

.card__title {
  font-size: 28px;
  font-weight: var(--bold);
  line-height: 1.2;
  letter-spacing: 0.025em;
  margin: 0;
  max-width: 65ch;
}

.card__title--featured {
  font-size: 42px;
  line-height: 1;
  margin-bottom: 48px;
}

.card__subtitle {
  margin: 8px 0 0;
  font-size: clamp(14px, 1.4vw, 18px);
  font-weight: var(--medium);
  line-height: 1.3;
  letter-spacing: 0.025em;
  color: #8d8d8d;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.card__description {
  font-size: var(--text-small);
  color: var(--gray-8);
  line-height: 1.5;
  margin: 0;
}

.card__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
}

.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.card__cover {
  margin: 0;
}

.card__cover--default {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.4s ease-out;
  z-index: 5;
  pointer-events: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.card:hover .card__cover--default {
  opacity: 1;
}

.card__cover--compact {
  margin: 12px;
  align-self: flex-start;

  img {
    width: auto;
    height: 100%;
    max-height: 150px;
    object-fit: contain;
    border-radius: var(--ui-radius);
  }
}

.card__cover--featured {
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

/* Featured variant */
.card--featured {
  display: grid;
  grid-template-columns: 1fr;

  .card__content {
    order: 2;
    min-height: 280px;
  }

  .card__cover--featured {
    order: 1;
    aspect-ratio: 16 / 9;
  }

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;

    .card__content {
      order: 1;
      min-height: 320px;
    }

    .card__cover--featured {
      order: 2;
      aspect-ratio: auto;
    }
  }
}

/* Default variant (normal/wide cards) */
.card--default {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 280px;

  .card__hit-area {
    position: absolute;
    inset: 0;
    z-index: 10;
  }

  .card__content {
    flex: 1;
  }

  .card__footer :deep(.ui-link) {
    background-color: var(--ui-neutral-background);
  }
}

/* Compact variant (carousel cards) */
.card--compact {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 180px;

  .card__cover--compact {
    flex-shrink: 0;
  }

  .card__content {
    flex: 1;
  }

  .card__title {
    font-size: var(--text-large);
    margin-bottom: 8px;
  }

  .card__footer :deep(a),
  .card__footer :deep(button) {
    display: none;
  }
}
</style>
