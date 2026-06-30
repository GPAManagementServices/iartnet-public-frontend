<template>
  <section id="numbers" class="numbers-section">
    <AppBlock>
      <template #default>
        <ul class="numbers__grid">
          <li v-for="(tot, index) in totals" :key="tot.key">
            <article class="numbers__card">
              <div class="numbers__card-header">
                <p class="numbers__card-label">
                  {{ tot.name }}
                </p>
                <p v-if="tot.annotations" class="numbers__card-annotations">
                  {{ tot.annotations }}
                </p>
              </div>
              <AnimatedStatValue
                :value="tot.value"
                :compact="tot.compact"
                :delay="index * 80"
              />
            </article>
          </li>
        </ul>
      </template>
    </AppBlock>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

const STATIC_TOTALS = {
  DigitalObjects: 3280,
  CatalogingRecords: 40_000,
  RestoredObjects: 9736,
  researchProjects: 16,
  activities: 33,
  associateMembers: 31,
  AcademicMobility: 31,
  people: 280,
  students: 49,
} as const
/*
const { data: numbersData } = await useFetch<CardsStat>('/api/numbers')
const statCards = computed(() => numbersData.value?.cardsStat ?? [])
const totalCards = computed(() =>
  statCards.value.reduce((sum, card) => sum + (card.tot_cards ?? 0), 0),
 )
*/
const totals = computed(() => [
  // { key: 'digital-objects', name: t('Digital Objects'), value: totalCards.value },
  /* ...statCards.value.map(card => ({
    key: card.code,
    name: card.name,
    value: card.tot_cards,
  })), */
  { key: 'digital-objects', name: t('Digital Objects'), value: STATIC_TOTALS.DigitalObjects },
  { key: 'cataloging-records', name: t('Cataloging Records'), annotations: 'ICCD.ICCU, ICAR Digital library...', value: STATIC_TOTALS.CatalogingRecords, compact: true },
  { key: 'restored-objects', name: t('Restored Objects'), value: STATIC_TOTALS.RestoredObjects },
  { key: 'research-projects', name: t('Research projects'), value: STATIC_TOTALS.researchProjects },
  { key: 'activities', name: t('Activities'), value: STATIC_TOTALS.activities },
  { key: 'associate-members', name: t('Associate Members'), value: STATIC_TOTALS.associateMembers },
  { key: 'academic-mobility', name: t('Academic Mobility'), value: STATIC_TOTALS.AcademicMobility },
  { key: 'people', name: t('People'), value: STATIC_TOTALS.people },
  { key: 'students', name: t('Students'), value: STATIC_TOTALS.students },
])
</script>

<style lang="postcss" scoped>
#numbers {
  width: 100%;
  //max-width: 60ch;
  margin-left: auto;
  margin-right: 0;
  //box-sizing: border-box;
}

.numbers__grid {
  display: grid;
  width: 100%;
  gap: var(--app-gap);
  grid-template-columns: 1fr;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  & > li {
    min-width: 0;
    width: 100%;
  }
}

.numbers__card {
  --numbers-card-padding: 10px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: var(--numbers-card-padding);
  background-color: var(--ui-neutral-background);
  border: 1px solid var(--ui-neutral-border);
  border-radius: 10px;

  @media (max-width: 767px) {
    height: 200px;
  }

  @media (min-width: 768px) {
    --numbers-card-padding: 12px;
    aspect-ratio: 3 / 2;
  }
}

.numbers__card-header {
  position: absolute;
  top: var(--numbers-card-padding);
  left: var(--numbers-card-padding);
  max-width: calc(100% - 2 * var(--numbers-card-padding));
}

.numbers__card-label {
  margin: 0;
  font-size: var(--text-small);
  font-weight: var(--bold);
  line-height: 1.3;
  color: var(--gray-12);
}

.numbers__card-annotations {
  margin: 4px 0 0;
  font-size: var(--text-mini);
  font-weight: var(--regular);
  line-height: 1.3;
  color: var(--gray-8);
}
</style>
