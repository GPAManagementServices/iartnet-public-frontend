<template>
  <section
    v-if="hasContent"
    class="story-section story-section--catalogo-opere-citate story-panel-opaque"
  >
    <h2 class="story-catalogo-opere-citate__title">
      {{ $t("Catalogo") }}
    </h2>
    <div class="story-catalogo-opere-citate__table">
      <ul class="story-catalogo-opere-citate__list">
        <li
          v-for="(item, index) in items"
          :key="index"
          class="story-catalogo-opere-citate__item"
        >
          <div
            v-if="item.Image?.URL"
            class="story-catalogo-opere-citate__item-image-wrap"
          >
            <StoryCatalogoOpereCitateImage
              :image="item.Image.URL"
              :alt="item.Title"
              :cache-key="`story-catalogo-opere-citate-${index}`"
            />
          </div>
          <div
            v-else
            class="story-catalogo-opere-citate__item-image-wrap story-catalogo-opere-citate__item-image-placeholder"
            aria-hidden="true"
          />
          <span
            v-if="item.Title"
            class="story-catalogo-opere-citate__item-title"
          >
            {{ item.Title }}
          </span>
          <span
            v-if="item.Author"
            class="story-catalogo-opere-citate__item-author"
          >
            {{ item.Author }}
          </span>
          <span
            v-if="item.Tags?.length"
            class="story-catalogo-opere-citate__item-tags"
          >
            <span
              v-for="(tag, tagIndex) in item.Tags"
              :key="tagIndex"
              class="story-catalogo-opere-citate__tag"
            >
              {{ tag }}
            </span>
          </span>
          <NuxtLink
            v-if="itemLink(item)"
            :to="itemLink(item)!"
            class="story-catalogo-opere-citate__item-link"
            aria-label="Vai all'opera"
          >
            <UiIcon
              name="go-to-opere-citate"
              collection="app"
            />
          </NuxtLink>
          <span
            v-else
            class="story-catalogo-opere-citate__item-link-placeholder"
            aria-hidden="true"
          />
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TStoryCatalogoOpereCitateType } from '#shared/types/api'
import { storyLinkHref } from '#shared/utils/storyLinkScheda'
import { computed } from 'vue'
import StoryCatalogoOpereCitateImage from '~/components/Narratives_OLD/StoryCatalogoOpereCitateImage.vue'

const props = defineProps<{
  items?: TStoryCatalogoOpereCitateType[] | null
}>()

const hasContent = computed(() => (props.items?.length ?? 0) > 0)

function itemLink(item: TStoryCatalogoOpereCitateType): string | null {
  return storyLinkHref(item.LinkScheda)
}
</script>

<style scoped>
/* —— Mobile —— */
@media (max-width: 767px) {
  .story-section--catalogo-opere-citate {
    display: flex;
    flex-direction: column;
    min-height: auto;
    margin-block: 32px;
  }

  .story-catalogo-opere-citate__title {
    font-weight: 700;
    font-style: Bold;
    font-size: 24px;
    line-height: 1.2;
    letter-spacing: 0.45px;
    margin-top: 32px;
    margin-bottom: 24px;
    margin-left: 16px;
    margin-right: 16px;
  }

  .story-catalogo-opere-citate__table {
    margin-left: 16px;
    margin-right: 16px;
  }

  .story-catalogo-opere-citate__list {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.9rem;
  }

  .story-catalogo-opere-citate__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-height: auto;
    height: auto;
    padding: 16px 0;
    box-sizing: border-box;
    border-top: 1px solid rgba(0, 0, 0, 0.15);
  }

  .story-catalogo-opere-citate__item-image-wrap {
    align-self: center;
    box-sizing: border-box;
    width: 100px;
    max-width: 100px;
    height: 62px;
    max-height: 62px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .story-catalogo-opere-citate__item-image-wrap :deep(.catalogo-opere-citate-item-image) {
    display: block;
    max-width: 100px;
    max-height: 62px;
    width: auto;
    height: auto;
    margin-inline: auto;
    object-fit: contain;
    object-position: center;
  }

  .story-catalogo-opere-citate__item-title {
    width: 100%;
    padding-left: 0;
    text-align: center;
    font-weight: 400;
    font-style: italic;
    font-size: 16px;
    line-height: 1.4;
    letter-spacing: 0.45px;
  }

  .story-catalogo-opere-citate__item-author {
    width: 100%;
    text-align: center;
    font-weight: 400;
    font-style: normal;
    font-size: var(--story-bibliography-font-size);
    line-height: 1.4;
    letter-spacing: 0.45px;
  }

  .story-catalogo-opere-citate__item-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    justify-content: center;
    width: 100%;
  }

  .story-catalogo-opere-citate__tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-width: 69px;
    height: 20px;
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 14px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #333;
    background: #eee;
  }

  .story-catalogo-opere-citate__item-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    min-height: 1.5rem;
    color: inherit;
    text-decoration: none;
  }

  .story-catalogo-opere-citate__item-link-placeholder {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    min-height: 1.5rem;
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
  .story-section--catalogo-opere-citate {
    display: flex;
    flex-direction: column;
    min-height: auto;
    margin-block: var(--story-footer-section-margin-block);
  }

  .story-catalogo-opere-citate__title {
    font-weight: 700;
    font-style: Bold;
    font-size: 30px;
    line-height: 38.4px;
    letter-spacing: 0.45px;
    margin-top: var(--story-footer-section-margin-block);
    margin-bottom: 80px;
    margin-left: 42px;
  }

  .story-catalogo-opere-citate__table {
    margin-left: 40px;
    margin-right: 40px;
  }

  .story-catalogo-opere-citate__list {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.9rem;
  }

  .story-catalogo-opere-citate__item {
    display: grid;
    grid-template-columns: 100px 2fr 10rem 1fr auto;
    gap: 0 1rem;
    align-items: center;
    min-height: 82px;
    height: 82px;
    box-sizing: border-box;
    border-top: 1px solid rgba(0, 0, 0, 0.15);
  }

  .story-catalogo-opere-citate__item-image-wrap {
    grid-column: 1;
    align-self: center;
    box-sizing: border-box;
    width: 100px;
    max-width: 100px;
    height: 62px;
    max-height: 62px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .story-catalogo-opere-citate__item-image-wrap :deep(.catalogo-opere-citate-item-image) {
    display: block;
    max-width: 100px;
    max-height: 62px;
    width: auto;
    height: auto;
    object-fit: contain;
  }

  .story-catalogo-opere-citate__item-title {
    grid-column: 2;
    padding-left: 15px;
    font-weight: 400;
    font-style: italic;
    font-size: 16px;
    line-height: 25.2px;
    letter-spacing: 0.45px;
  }

  .story-catalogo-opere-citate__item-author {
    grid-column: 3;
    font-weight: 400;
    font-style: normal;
    font-size: 17px;
    line-height: 25.2px;
    letter-spacing: 0.45px;
  }

  .story-catalogo-opere-citate__item-tags {
    grid-column: 4;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .story-catalogo-opere-citate__tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-width: 69px;
    height: 20px;
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 14px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #333;
    background: #eee;
  }

  .story-catalogo-opere-citate__item-link {
    grid-column: 5;
    justify-self: end;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    min-height: 1.5rem;
    color: inherit;
    text-decoration: none;
  }

  .story-catalogo-opere-citate__item-link-placeholder {
    grid-column: 5;
    justify-self: end;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    min-height: 1.5rem;
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .story-catalogo-opere-citate__table {
    width: auto;
    margin-left: 0;
    margin-right: 50px;
  }
}
</style>
