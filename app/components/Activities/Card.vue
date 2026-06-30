<template>
  <article class="activity-card">
    <header v-if="item.categories.length" class="card-badges">
      <UiBadge
        v-for="category in item.categories"
        :key="category.id"
        size="xs"
        variant="soft"
        rounded
        class="uppercase"
      >
        {{ category.name }}
      </UiBadge>
    </header>

    <h3 class="card-title">
      <NuxtLink
        class="stretched-link hover-line"
        :to="$localePath({ name: 'activities-slug', params: { slug: item.slug } })"
      >
        {{ item.title }}
      </NuxtLink>
    </h3>

    <footer class="card-footer">
      <UiTime
        v-if="item.start_date"
        :datetimestart="computeDate(item.start_date, item.start_hour)!"
        :datetimeend="computeDate(item.end_date, item.end_hour)"
        day="numeric"
        month="short"
        year="numeric"
        :locale
        class="card-date uppercase"
      />
      <span v-if="institutionName" class="card-institution uppercase">
        {{ institutionName }}
      </span>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { Activity } from '#shared/types/api'

const props = defineProps<{
  item: Activity
}>()

const { locale } = useI18n()

const institutionName = computed(() => {
  return props.item.institutions?.[0]?.name ?? null
})
</script>

<style lang="postcss" scoped>
.activity-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--app-gap);
  padding: clamp(16px, 3vw, 24px);
  border: 1px solid var(--ui-neutral-solid);
  background-color: var(--ui-neutral-background);
  min-height: 200px;

  @media (hover) {
    /* Trigger hover-line underline when card is hovered (stretched-link ::after captures hover) */
    &:hover .hover-line {
      text-decoration-color: var(--gray-4);
    }
  }
}
  .card-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .card-title {
    flex: 1;
    font-size: var(--text-large);
    font-weight: var(--medium);
    line-height: 1.2;
    margin: 0;
    padding-bottom: clamp(24px, 4vw, 48px);

  }

  .card-footer {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: auto;

    .card-date {
      font-size: var(--ui-text);
      font-weight: var(--medium);
    }

    .card-institution {
      font-size: var(--ui-text-extrasmall);
      color: var(--ui-neutral-text);
    }
  }
</style>
