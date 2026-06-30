<template>
  <div
    v-if="people.length"
    class="people-top-accordion people-ps-accordion"
    data-section="project-staff-accordion"
  >
    <AccordionRoot
      class="PeopleAccordionRoot"
      type="single"
      collapsible
    >
      <RekaAccordionItem
        class="PeopleAccordionItem PeopleAccordionItem--top"
        value="project-staff"
      >
        <AccordionHeader class="PeopleAccordionHeader">
          <AccordionTrigger
            class="PeopleAccordionTrigger PeopleAccordionTrigger--institution"
            :aria-label="t('Project staff (People section)')"
          >
            <span class="PeopleAccordionTrigger__label">
              {{ t('Project staff (People section)') }}
            </span>
            <UiIcon name="chevron-down-people" collection="app" />
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent
          class="PeopleAccordionContent PeopleAccordionContent--institution"
        >
          <div
            class="people__grid people__grid--role-badges people__grid--ps-accordion"
          >
            <CardPerson
              v-for="item in people"
              :key="item.id"
              v-bind="item"
              size="md"
              people-row-badge
              :institution="getInstitutionLine(item)"
            >
              <NuxtLink
                v-if="detailRoute(item)"
                class="stretched-link"
                :to="localePath(detailRoute(item)!)"
                :aria-label="`${item.first_name} ${item.last_name}`"
              />
            </CardPerson>
          </div>
        </AccordionContent>
      </RekaAccordionItem>
    </AccordionRoot>
  </div>
</template>

<script setup lang="ts">
import type { Person } from '#shared/types/api'
import {
  AccordionContent,
  AccordionHeader,
  AccordionRoot,
  AccordionTrigger,
  AccordionItem as RekaAccordionItem,
} from 'reka-ui'

const props = defineProps<{
  /** Persone in ordine documento (PM, Curator, Research Coord…), senza titoli di gruppo. */
  people: Person[]
  getInstitutionLine: (p: Person) => string | undefined
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { detailRoute } = usePersonDetailLink()

function getInstitutionLine(p: Person) {
  return props.getInstitutionLine(p)
}
</script>

<style lang="postcss">
/* Allineato a PeopleInstitutionAccordion / PeopleScientificCommittees (scoped al wrapper). */
.people-ps-accordion .PeopleAccordionRoot {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.people-ps-accordion .PeopleAccordionHeader {
  display: flex;
}

@media (max-width: 767px) {
  .people-ps-accordion .PeopleAccordionRoot {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    min-width: 0;
    height: auto;
  }

  .people-ps-accordion .PeopleAccordionHeader {
    width: 100%;
  }
}

.people-ps-accordion .PeopleAccordionTrigger--institution {
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: var(--people-accordion-inst-trigger-gap-mobile);
  padding-top: var(--people-accordion-inst-trigger-padding-y-mobile);
  padding-bottom: var(--people-accordion-inst-trigger-padding-y-mobile);
  min-height: var(--people-accordion-inst-trigger-min-height-mobile);
  height: auto;
  border-top: var(--people-accordion-inst-trigger-border-top);
  border-right: none;
  border-bottom: none;
  border-left: none;
  text-align: start;
  opacity: 1;
  font-family: var(--people-accordion-inst-trigger-font-family);
  font-style: var(--people-accordion-inst-trigger-font-style);
  font-weight: var(--people-accordion-inst-trigger-font-weight);
  font-size: var(--people-accordion-inst-trigger-font-size);
  line-height: var(--people-accordion-inst-trigger-line-height);
  letter-spacing: var(--people-accordion-inst-trigger-letter-spacing);
  vertical-align: middle;
  leading-trim: var(--people-accordion-inst-trigger-leading-trim);
  color: var(--ui-neutral-text);
  background: transparent;
  cursor: pointer;
}

.people-page-mid-accordions > .people-ps-accordion:first-child .PeopleAccordionTrigger--institution {
  border-top: none;
}

.people-ps-accordion .PeopleAccordionTrigger__label {
  min-width: 0;
  flex: 1;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.people-ps-accordion .PeopleAccordionTrigger--institution .ui-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  color: #111111;
  transform: translateY(5.25px);
  transition: transform 200ms ease-out;
}

.people-ps-accordion .PeopleAccordionTrigger--institution[data-state='open'] > .ui-icon {
  transform: translateY(5.25px) rotate(180deg);
}

.people-ps-accordion .PeopleAccordionContent--institution {
  display: flex;
  flex-direction: column;
  gap: var(--people-accordion-content-gap);
  max-width: none;
  width: 100%;
  min-width: 0;
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
  font-size: var(--ui-text);
  overflow: hidden;
}

.people-ps-accordion .PeopleAccordionContent--institution[data-state='open'] {
  margin-top: var(--people-accordion-content-gap);
  padding-top: 4px;
  padding-bottom: 8px;
}

@media (min-width: 768px) {
  .people-ps-accordion .PeopleAccordionTrigger--institution {
    gap: var(--people-accordion-inst-trigger-gap-desktop);
    padding-top: var(--people-accordion-inst-trigger-padding-y-desktop);
    padding-bottom: var(--people-accordion-inst-trigger-padding-y-desktop);
    min-height: 0;
    height: var(--people-accordion-inst-trigger-height-desktop);
    box-sizing: border-box;
    border-top: var(--people-accordion-inst-trigger-border-top);
    justify-content: space-between;
    align-items: center;
    opacity: 1;
  }

  .people-page-mid-accordions > .people-ps-accordion:first-child .PeopleAccordionTrigger--institution {
    border-top: none;
  }

  .people-ps-accordion .PeopleAccordionContent--institution[data-state='open'] {
    margin-bottom: var(--people-accordion-content-gap);
  }
}

.people-ps-accordion .people__grid--ps-accordion {
  --min: 260px;
  display: grid;
  column-gap: var(--people-accordion-grid-mobile-column-gap);
  row-gap: var(--people-accordion-grid-mobile-row-gap);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-width: 0;
}

@media (min-width: 768px) {
  /* Allineato a istituzioni e comitati: colonne uniformi, righe incomplete coerenti. */
  .people-ps-accordion .people__grid--ps-accordion {
    --min: 316px;
    column-gap: var(--app-padding);
    row-gap: 28px;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--min)), 1fr));
    justify-content: start;
    justify-items: start;
  }
}
</style>
