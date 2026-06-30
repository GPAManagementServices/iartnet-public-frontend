<template>
  <div class="people-top-accordion people-sci-accordion" data-section="scientific-committees">
    <AccordionRoot
      class="PeopleAccordionRoot"
      type="single"
      collapsible
    >
      <RekaAccordionItem
        class="PeopleAccordionItem PeopleAccordionItem--top"
        value="scientific-committees"
      >
        <AccordionHeader class="PeopleAccordionHeader">
          <AccordionTrigger
            class="PeopleAccordionTrigger PeopleAccordionTrigger--institution"
            :aria-label="t('Scientific Committees')"
          >
            <span class="PeopleAccordionTrigger__label">
              {{ t('Scientific Committees') }}
            </span>
            <UiIcon name="chevron-down-people" collection="app" />
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent
          class="PeopleAccordionContent PeopleAccordionContent--institution"
        >
          <div
            v-for="c in committees"
            :key="c.id"
            class="people-sci-accordion__subsection"
          >
            <h3 class="people-sci-accordion__subsection-title">
              {{ t(c.titleKey) }}
            </h3>
            <!-- Chair(s) e Member: due gruppi distinti -->
            <div class="people-sci-accordion__role-group">
              <div
                class="people__grid people__grid--role-badges people__grid--sci-accordion"
              >
                <template
                  v-for="(chairName, cIdx) in committeeChairs(c)"
                  :key="`${c.id}-chair-${cIdx}`"
                >
                  <CardPerson
                    v-if="memberResolved(chairName)"
                    v-bind="memberResolved(chairName)!"
                    size="md"
                    people-row-badge
                    :institution="getInstitutionLine(memberResolved(chairName)!)"
                    :row-badge-role-override="chairBadgeLabel(c)"
                  >
                    <NuxtLink
                      v-if="memberResolved(chairName) && detailRoute(memberResolved(chairName)!)"
                      class="stretched-link"
                      :to="localePath(detailRoute(memberResolved(chairName)!)!)"
                      :aria-label="chairName"
                    />
                  </CardPerson>
                  <p
                    v-else
                    class="people-sci-accordion__editorial-name"
                  >
                    {{ chairName }}
                    <span class="people-sci-accordion__editorial-meta">—</span>
                    <span class="people-sci-accordion__editorial-role">{{ chairBadgeLabel(c) }}</span>
                  </p>
                </template>
              </div>
            </div>
            <div class="people-sci-accordion__role-group">
              <div
                class="people__grid people__grid--role-badges people__grid--sci-accordion"
              >
                <template
                  v-for="(name, idx) in c.members"
                  :key="`${c.id}-m-${idx}`"
                >
                  <CardPerson
                    v-if="memberResolved(name)"
                    v-bind="memberResolved(name)!"
                    size="md"
                    people-row-badge
                    :institution="committeeMemberInstitutionLine(name, memberResolved(name)!)"
                    :row-badge-role-override="t('Member')"
                  >
                    <NuxtLink
                      v-if="memberResolved(name) && detailRoute(memberResolved(name)!)"
                      class="stretched-link"
                      :to="localePath(detailRoute(memberResolved(name)!)!)"
                      :aria-label="name"
                    />
                  </CardPerson>
                  <p
                    v-else
                    class="people-sci-accordion__editorial-name"
                  >
                    {{ name }}
                    <span class="people-sci-accordion__editorial-meta">—</span>
                    <span class="people-sci-accordion__editorial-role">{{ t('Member') }}</span>
                  </p>
                </template>
              </div>
            </div>
          </div>
        </AccordionContent>
      </RekaAccordionItem>
    </AccordionRoot>
  </div>
</template>

<script setup lang="ts">
import type { ScientificCommitteeDef } from '#shared/data/peopleScientificCommittees'
import type { Person } from '#shared/types/api'
import {
  committeeChairs,
  PEOPLE_SCIENTIFIC_COMMITTEES,
  SCIENTIFIC_COMMITTEE_MEMBER_INSTITUTION_OVERRIDES,
} from '#shared/data/peopleScientificCommittees'
import { resolveEditorialPersonName } from '#shared/utils/resolveEditorialPersonName'
import {
  AccordionContent,
  AccordionHeader,
  AccordionRoot,
  AccordionTrigger,
  AccordionItem as RekaAccordionItem,
} from 'reka-ui'

const props = defineProps<{
  people: Person[]
  getInstitutionLine: (p: Person) => string | undefined
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { detailRoute } = usePersonDetailLink()
const committees = PEOPLE_SCIENTIFIC_COMMITTEES

function getInstitutionLine(p: Person) {
  return props.getInstitutionLine(p)
}

function committeeMemberInstitutionLine(editorialName: string, p: Person): string | undefined {
  return SCIENTIFIC_COMMITTEE_MEMBER_INSTITUTION_OVERRIDES[editorialName]
    ?? props.getInstitutionLine(p)
}

function chairBadgeLabel(c: ScientificCommitteeDef): string {
  return committeeChairs(c).length > 1 ? t('CHAIRS') : t('CHAIR')
}

function memberResolved(name: string): Person | null {
  return resolveEditorialPersonName(props.people, name)
}
</script>

<style scoped lang="postcss">
/* Tra sottosezioni comitati: gap da `.PeopleAccordionContent--institution` (64px Figma). */

.people-sci-accordion__role-group + .people-sci-accordion__role-group {
  margin-top: 48px;
}

.people-sci-accordion__subsection-title {
  margin: 0 0 20px;
  font-size: var(--ui-text-large);
  font-weight: var(--bold);
  line-height: 1.25;
  color: rgba(17, 17, 17, 0.55); /*var(--ui-neutral-text);*/
  letter-spacing: 0.01em;
}

.people-sci-accordion__editorial-name {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin: 0;
  min-width: 0;
  font-size: var(--ui-text-large);
  line-height: 1.25;
  color: var(--ui-neutral-text);
}

.people-sci-accordion__editorial-meta {
  font-size: var(--ui-text-small);
  color: var(--gray-7);
}

.people-sci-accordion__editorial-role {
  font-size: var(--ui-text-extrasmall);
  font-weight: var(--medium);
  line-height: 1.35;
  color: var(--gray-8);
  letter-spacing: 0.02em;
}
</style>

<style lang="postcss">
/* Allineato a PeopleInstitutionAccordion (scoped al wrapper). */
.people-sci-accordion .PeopleAccordionRoot {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.people-sci-accordion .PeopleAccordionHeader {
  display: flex;
}

@media (max-width: 767px) {
  .people-sci-accordion .PeopleAccordionRoot {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    min-width: 0;
    height: auto;
  }

  .people-sci-accordion .PeopleAccordionHeader {
    width: 100%;
  }
}

.people-sci-accordion .PeopleAccordionTrigger--institution {
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

.people-page-mid-accordions > .people-sci-accordion:first-child .PeopleAccordionTrigger--institution {
  border-top: none;
}

.people-sci-accordion .PeopleAccordionTrigger__label {
  min-width: 0;
  flex: 1;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.people-sci-accordion .PeopleAccordionTrigger--institution .ui-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  color: #111111;
  transform: translateY(5.25px);
  transition: transform 200ms ease-out;
}

.people-sci-accordion .PeopleAccordionTrigger--institution[data-state='open'] > .ui-icon {
  transform: translateY(5.25px) rotate(180deg);
}

.people-sci-accordion .PeopleAccordionContent--institution {
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

.people-sci-accordion .PeopleAccordionContent--institution[data-state='open'] {
  margin-top: var(--people-accordion-content-gap);
  padding-top: 4px;
  padding-bottom: 8px;
}

@media (min-width: 768px) {
  .people-sci-accordion .PeopleAccordionTrigger--institution {
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

  .people-page-mid-accordions > .people-sci-accordion:first-child .PeopleAccordionTrigger--institution {
    border-top: none;
  }

  .people-sci-accordion .PeopleAccordionContent--institution[data-state='open'] {
    margin-bottom: var(--people-accordion-content-gap);
  }
}

.people-sci-accordion .people__grid--sci-accordion {
  --min: 260px;
  display: grid;
  column-gap: var(--people-accordion-grid-mobile-column-gap);
  row-gap: var(--people-accordion-grid-mobile-row-gap);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-width: 0;
}

@media (min-width: 768px) {
  /* Allineato alle istituzioni (PeopleInstitutionAccordion): colonne uniformi, righe incomplete coerenti. */
  .people-sci-accordion .people__grid--sci-accordion {
    --min: 316px;
    column-gap: var(--app-padding);
    row-gap: 28px;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--min)), 1fr));
    justify-content: start;
    justify-items: start;
  }
}
</style>
