<template>
  <nav class="osd-search-back-nav ui-breadcrumb" :aria-label="$t('OSD-BreadcrumbNav')">
    <ol>
      <li class="ui-breadcrumb-item">
        <button
          type="button"
          class="osd-search-back-nav__btn ui-breadcrumb-itemlink uppercase to"
          :aria-label="$t('Search back to results')"
          @click="goBackToSearchResults"
        >
          <UiIcon name="arrow-left" />
          <span class="truncate">{{ $t('Search') }}</span>
        </button>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
const { goBackToSearchResults } = useBackToSearch()
</script>

<style lang="postcss" scoped>
.osd-search-back-nav {
  position: relative;
  min-width: 0;
}

.osd-search-back-nav ol {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.osd-search-back-nav__btn {
  border: none;
  background: none;
  cursor: pointer;
  font: inherit;
  text-align: start;
}
</style>
