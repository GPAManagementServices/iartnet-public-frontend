<template>
  <div class="research-catalogue">
    <table ref="table" class="catalogue-table app-padding">
      <tbody>
        <tr v-for="item, key in catalogue" :key @mouseover=" currentCover = item?.media?.cover_image?.url">
          <td class="entry-title">
            <a :href="item.external_link" target="_blank" class="stretched-link">
              {{ item.title }}
            </a>
          </td>

          <td class="author">
            {{ item.author }}
          </td>
          <td class="categories">
            <span v-for="category in item.categories" :key="category.id" class="chips">{{ category.name }}</span>
          </td>
          <td class="link">
            <UiIcon name="arrow-right" />
          </td>
        </tr>
      </tbody>
    </table>
    <Transition name="fade">
      <ResearchCataloguePreview
        v-if="!isOutside && isLargeScreen && currentCover !== null"
        :cover="currentCover"
        :x-pos="xPos"
        :y-pos="yPos"
      />
    </Transition>
  </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  catalogue?: ResearchCatalogue[]
}>(), {
  catalogue: () => [],
})

const emit = defineEmits(['showCover'])
const table = useTemplateRef<HTMLElement>('table')
const currentCover = ref<string | null>(null)
const { isOutside, xPos, yPos } = useFollowMe(table)
const isLargeScreen = useMediaQuery('(min-width: 1024px)', { ssrWidth: 1024 })
</script>

<style lang="postcss" scoped>
.research-catalogue {
  position: relative;

  table tr td {
    border: none;
  }

  .catalogue-table {
    width: 100%;

    button {
      font-size: inherit !important;
    }

    tr {
      position: relative;
    }

    td {
      font-size: var(--text-small);
      vertical-align: middle;
    }

    /* Allow long titles to wrap within available space */
    .resource-title {
      white-space: normal;
      text-align: left;
      max-width: 100%;
      overflow-wrap: anywhere;
      word-break: break-word;
      flex: 1 1 auto;
      justify-content: flex-start;
      align-items: flex-start;
      padding: 0;
    }

    tr {
      width: 100%;
      display: flex;
      align-items: stretch;
      position: relative;
    }

    td {
      border-top: 1px solid black;
      align-items: stretch;
      padding-block: 1em;

      &.categories {
        flex: 1 0 30%;

        display: flex;
        align-items: first baseline;
        gap: 8px;

        & > * {
          font-size: var(--text-mini);
          text-transform: uppercase;
          padding: 0 18px;
          border-radius: 1em;
          display: inline-block;
          background-color: #eee;
        }
      }

      &.entry-title {
        flex: 0 1 50%;
        font-style: italic;
        padding-right: 1em;

        & > * {
          display: inline-block;
          max-width: 80ch;
        }
      }

      &.author {
        flex: 0 1 20%;
      }

      &.link {
        display: flex;
        align-items: first baseline;
        color: #aaa;
      }
    }

    @media (max-width: 768px) {
      td {
        &.entry-title {
          flex: 1 0 80%;
        }

        &.categories {
          display: none;
        }
      }
    }

    @media (max-width: 480px) {
      .open {
        display: none;
      }
    }
  }
}
</style>
