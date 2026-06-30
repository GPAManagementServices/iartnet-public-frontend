<template>
  <article class="narratives-card">
    <div class="card-content">
      <h3 class="card-title">
        <NuxtLink :to="link" class="card-link stretched-link">
          {{ title }}
        </NuxtLink>
      </h3>
      <div v-if="tags?.length" class="card-tags">
        <UiBadge
          v-for="tag in tags"
          :key="tag"
          :label="tag"
          variant="primary"
          rounded
        />
      </div>
      <UiButton
        :to="link"
        icon="arrow-right"
        variant="outline"
        rounded
        size="lg"
        :aria-label="$t('Read more about', { title })"
      />
    </div>
    <figure v-if="coverImage" class="card-cover app-rounded">
      <img class="app-rounded" :src="coverImage" :alt="title">
    </figure>
  </article>
</template>

<script setup lang="ts">
export interface NarrativesItem {
  id: number
  title: string
  description?: string
  coverImage: string
  tags: string[]
  link: string
}

defineProps<NarrativesItem>()
</script>

<style lang="postcss" scoped>
/* —— Mobile —— */
@media (max-width: 767px) {
  .narratives-card {
    position: relative;
    display: flex;
    flex-direction: column;
    border-top: 1px solid currentColor;

    & + .narratives-card {
      margin-top: 32px;
    }
  }

  .card-cover {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    height: 280px;
    order: -1;

    img {
      display: block;
      width: 100%;
      height: 100%;
      margin-inline: auto;
      object-fit: cover;
      object-position: center;
    }
  }

  .card-content {
    display: flex;
    flex-wrap: wrap;
    column-gap: var(--app-gap);
    row-gap: 16px;
    margin-block: 16px;

    h3 {
      flex: 1 1 calc(100% - 51px);
      font-size: var(--text);
      line-height: 1.25;
    }

    .card-tags {
      order: 1;
    }
  }

  .card-tags {
    margin-left: auto;
    display: flex;
    gap: 10px;
  }

  .card-title {
    font-size: var(--text);
    line-height: 1.25;
    margin: 0;
  }

  .card-link {
    color: inherit;
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
  .narratives-card {
    position: relative;
    display: flex;
    flex-direction: column;
    border-top: 1px solid currentColor;

    & + .narratives-card {
      margin-top: 48px;
    }
  }

  .card-cover {
    display: flex;
    align-items: flex-end;
    margin: 0;
    height: 420px;

    @media (max-width: 1023px) {
      height: 330px;
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .card-content {
    display: flex;
    column-gap: var(--app-gap);
    row-gap: 32px;
    margin-block: 24px;
    @supports not (margin-block: 0) {
      margin-top: 24px;
      margin-bottom: 24px;
    }
    align-items: first baseline;
  }

  .card-tags {
    margin-left: auto;
    display: flex;
    gap: 10px;
  }

  .card-title {
    font-size: var(--title);
    line-height: 1.2;
    margin: 0;
  }

  .card-link {
    color: inherit;
  }
}
</style>
