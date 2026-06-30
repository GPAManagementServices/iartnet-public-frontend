<template>
  <div class="activities-grid">
    <!-- Desktop View -->
    <div
      v-for="item, index in displayItems"
      :key="item.id"
      class="grid--desktop activities-grid__cell"
      :class="getCardClass(index)"
    >
      <ActivitiesCard :item />
    </div>

    <!-- Mobile View -->
    <UiCarousel
      class="mobile-view"
      :items="displayItems"
      :slides-per-view="{ 0: 1, 640: 2 }"
      spacing="0"
      arrows
    >
      <template #default="{ item }">
        <ActivitiesCard :item />
      </template>
    </UiCarousel>
  </div>
</template>

<script setup lang="ts">
import type { Activity } from '#shared/types/api'

const props = withDefaults(defineProps<{
  items: Activity[]
  limit?: number
  includePast?: boolean
}>(), {
  limit: 8,
})

// Filter for future events only and limit
const displayItems = computed(() => {
  const now = new Date()
  return props.items
    .filter((item) => {
      if (props.includePast)
        return true
      if (!item.start_date)
        return true // Include items without dates
      const startDate = new Date(item.start_date as string)
      return startDate >= now
    })
    .slice(0, props.limit)
})

// Calculate grid columns based on viewport (reactive)
const columns = ref(1)

onMounted(() => {
  const updateColumns = () => {
    if (window.innerWidth >= 1024)
      columns.value = 3
    else if (window.innerWidth >= 768)
      columns.value = 2
    else columns.value = 1
  }
  updateColumns()
  window.addEventListener('resize', updateColumns)
  onUnmounted(() => window.removeEventListener('resize', updateColumns))
})

// Calculate classes for borders and rounded corners
const getCardClass = (index: number) => {
  const total = displayItems.value.length
  const cols = columns.value
  const row = Math.floor(index / cols)
  const col = index % cols
  const totalRows = Math.ceil(total / cols)
  const isFirstRow = row === 0
  const isLastRow = row === totalRows - 1
  const isFirstCol = col === 0
  const isLastCol = col === cols - 1
  const isLastItem = index === total - 1

  const classes: string[] = []

  // Right border: add unless it's the last column
  if (!isLastCol) {
    classes.push('border-right')
  }

  // Bottom border: add unless it's the last row
  if (!isLastRow) {
    classes.push('border-bottom')
  }

  // Corner rounding - only for actual corners of the grid
  if (isFirstRow && isFirstCol)
    classes.push('rounded-tl')
  if (isFirstRow && (isLastCol || isLastItem))
    classes.push('rounded-tr')
  if (isLastRow && isFirstCol)
    classes.push('rounded-bl')
  if (isLastItem)
    classes.push('rounded-br')

  return classes
}
</script>

<style lang="postcss" scoped>
.activities-grid {
  --columns: 1;
  --radius: calc(var(--ui-radius) + 4px);

  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  grid-auto-rows: 1fr;
  overflow: hidden;

  @media (min-width: 768px) {
    --columns: 2;
    border: 1px solid var(--ui-neutral-solid);
    border-radius: var(--radius);
  }

  @media (min-width: 1024px) {
    --columns: 3;
    border: 1px solid var(--ui-neutral-solid);
    border-radius: var(--radius);
  }
}

/* Cell wrapper for proper border handling */
.activities-grid__cell {
  display: flex;
  min-height: 0;
  gap: 10px;
}

.activities-grid__cell.border-right {
  border-right: 1px solid var(--ui-neutral-solid);
}

.activities-grid__cell.border-bottom {
  border-bottom: 1px solid var(--ui-neutral-solid);
}

/* Base card styles - fill the cell */
.activities-grid__cell :deep(.activity-card) {
  flex: 1;
  border: none;
  border-radius: 0;
}

/* Corner rounding for cards at grid edges */

.activities-grid__cell.rounded-tl :deep(.activity-card) {
  border-top-left-radius: calc(var(--radius) - 1px);
}
.activities-grid__cell.rounded-tr :deep(.activity-card) {
  border-top-right-radius: calc(var(--radius) - 1px);
}
.activities-grid__cell.rounded-bl :deep(.activity-card) {
  border-bottom-left-radius: calc(var(--radius) - 1px);
}
.activities-grid__cell.rounded-br :deep(.activity-card) {
  border-bottom-right-radius: calc(var(--radius) - 1px);
}

/* Desktop Grid */
.grid--desktop {
  display: none;

  @media (min-width: 768px) {
    display: grid;
  }
}

/* Mobile View */
.mobile-view {
  @media (min-width: 768px) {
    display: none;
  }

  :deep(.CarouselSlide:first-child .activity-card) {
    border-top-left-radius: calc(var(--radius) - 1px);
    border-bottom-left-radius: calc(var(--radius) - 1px);
  }

  :deep(.CarouselSlide:last-child .activity-card) {
    border-top-right-radius: calc(var(--radius) - 1px);
    border-bottom-right-radius: calc(var(--radius) - 1px);
  }
}
</style>
