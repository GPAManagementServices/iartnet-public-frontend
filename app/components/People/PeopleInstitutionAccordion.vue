<template>
  <div class="people-institution-accordion">
    <AccordionRoot
      class="PeopleAccordionRoot"
      type="multiple"
      collapsible
      :default-value="INSTITUTION_ACCORDION_DEFAULT"
    >
      <RekaAccordionItem
        v-for="inst in institutions"
        :key="institutionKey(inst)"
        class="PeopleAccordionItem PeopleAccordionItem--institution"
        :value="institutionValue(inst)"
      >
        <AccordionHeader class="PeopleAccordionHeader">
          <AccordionTrigger
            class="PeopleAccordionTrigger PeopleAccordionTrigger--institution"
            :aria-label="inst.name"
          >
            <span class="PeopleAccordionTrigger__label">{{ inst.name }}</span>
            <UiIcon name="chevron-down-people" collection="app" />
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent
          class="PeopleAccordionContent PeopleAccordionContent--institution"
        >
          <template v-for="group in inst.groups" :key="group.roleKey">
            <div
              v-if="group.people.length"
              class="people-ia__group"
            >
              <div
                class="people__grid people__grid--role-badges people__grid--inst-accordion"
              >
                <CardPerson
                  v-for="item in group.people"
                  :key="item.id"
                  v-bind="item"
                  :role="roleLabelInInstitutionCard(item)"
                  size="md"
                  people-institution-badge
                  :hide-avatar="isStudentRoleMember(item)"
                  :hide-role="false"
                >
                  <NuxtLink
                    v-if="detailRoute(item)"
                    class="stretched-link"
                    :to="localePath(detailRoute(item)!)"
                    :aria-label="`${item.first_name} ${item.last_name}`"
                  />
                </CardPerson>
              </div>
            </div>
          </template>
        </AccordionContent>
      </RekaAccordionItem>

      <RekaAccordionItem
        v-if="externalConsultants.length"
        class="PeopleAccordionItem PeopleAccordionItem--institution"
        value="external-consultants"
      >
        <AccordionHeader class="PeopleAccordionHeader">
          <AccordionTrigger
            class="PeopleAccordionTrigger PeopleAccordionTrigger--institution"
            :aria-label="externalConsultantsTitle"
          >
            <span class="PeopleAccordionTrigger__label">{{ externalConsultantsTitle }}</span>
            <UiIcon name="chevron-down-people" collection="app" />
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent class="PeopleAccordionContent PeopleAccordionContent--institution">
          <div
            class="people__grid people__grid--role-badges people__grid--inst-accordion"
          >
            <CardPerson
              v-for="item in externalConsultants"
              :key="item.id"
              v-bind="item"
              size="md"
              people-row-badge
              :institution="externalConsultantInstitutionLine(item)"
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
import { isStudentRole, matchesAppRoleTitle } from '#shared/utils/peopleRoleMatch'
import {
  AccordionContent,
  AccordionHeader,
  AccordionRoot,
  AccordionTrigger,
  AccordionItem as RekaAccordionItem,
} from 'reka-ui'

export interface PeopleInstitutionGroup {
  roleKey: string
  roleLabel: string
  people: Person[]
}

export interface PeopleInstitutionBlock {
  id?: number
  name?: string
  slug?: string
  groups: PeopleInstitutionGroup[]
}

const props = withDefaults(
  defineProps<{
    institutions: PeopleInstitutionBlock[]
    /** Consulenti esterni senza istituzione: ultima voce nello stesso accordion delle istituzioni. */
    externalConsultants?: Person[]
    getExternalConsultantInstitutionLine?: (p: Person) => string | undefined
  }>(),
  {
    externalConsultants: () => [],
  },
)

/** `type="multiple"`: nessun item aperto in default (non controllato). */
const INSTITUTION_ACCORDION_DEFAULT: string[] = []

const NAME_SLUGIFY_WS = /\s+/g

const { t } = useI18n()
const localePath = useLocalePath()
const { detailRoute } = usePersonDetailLink()

const externalConsultantsTitle = computed(() => t('External consultants (People section)'))

function externalConsultantInstitutionLine(p: Person): string | undefined {
  return props.getExternalConsultantInstitutionLine?.(p)
}

function institutionKey(inst: PeopleInstitutionBlock): string {
  if (inst.id != null)
    return `i-${inst.id}`
  return `n-${(inst.name ?? '').replace(NAME_SLUGIFY_WS, '-').slice(0, 64)}`
}

function institutionValue(inst: PeopleInstitutionBlock): string {
  return institutionKey(inst)
}

function isStudentRoleMember(p: Person): boolean {
  return isStudentRole(p, t('Student Collaborator'))
}

/** Solo card nei blocchi istituzione: External Consultant → External Advisor (non nel gruppo globale EC). */
function roleLabelInInstitutionCard(item: Person): string | undefined {
  const raw = item.role?.trim()
  if (!raw)
    return undefined
  if (matchesAppRoleTitle(item, 'External Consultant', t('External Consultant')))
    return t('External Advisor')
  return raw
}
</script>

<style lang="postcss">
.people-institution-accordion .PeopleAccordionRoot {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

/* Spazio tra istituzioni: ~ altezza riga header (line-height titolo + padding verticale trigger) */
.people-institution-accordion .PeopleAccordionItem--institution:not(:last-child) {
  /*margin-bottom: calc(var(--ui-text-large) * 1.2 + 20px);*/
}

@media (min-width: 768px) {
  .people-institution-accordion .PeopleAccordionItem--institution:not(:last-child) {
    /*margin-bottom: calc(var(--ui-text-large) * 1.2 + 24px);*/
  }
}

.people-institution-accordion .PeopleAccordionItem--institution {
  margin-top: 0;
  margin-bottom: 0;
}

.people-institution-accordion .PeopleAccordionHeader {
  display: flex;
}

/* Mobile (<768): Figma — flow orizzontale, Fill × Hug 138, padding verticale 40, gap 24, border-top 10% #111 */
@media (max-width: 767px) {
  .people-institution-accordion .PeopleAccordionRoot {
    /* stack verticale automatico sugli item; larghezza = Fill del contenitore (~358 nel frame mobile) */
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    min-width: 0;
    height: auto;
  }

  .people-institution-accordion .PeopleAccordionHeader {
    width: 100%;
  }
}

.people-institution-accordion .PeopleAccordionTrigger--institution {
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

.people-institution-accordion .PeopleAccordionItem--institution:first-child .PeopleAccordionTrigger--institution {
  border-top: none;
}

.people-institution-accordion .PeopleAccordionTrigger__label {
  min-width: 0;
  flex: 1;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.people-institution-accordion .PeopleAccordionTrigger--institution .ui-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  color: #111111;
  transform: translateY(5.25px);
  transition: transform 200ms ease-out;
}

.people-institution-accordion .PeopleAccordionTrigger--institution[data-state='open'] > .ui-icon {
  transform: translateY(5.25px) rotate(180deg);
}

.people-institution-accordion .PeopleAccordionContent--institution {
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

/* Chiuso: nessun margine sotto il trigger (il 64px restava nel layout e sbilanciava lo stack). */
.people-institution-accordion .PeopleAccordionContent--institution[data-state='open'] {
  margin-top: var(--people-accordion-content-gap);
  padding-top: 4px;
  padding-bottom: 8px;
}

@media (min-width: 768px) {
  .people-institution-accordion .PeopleAccordionTrigger--institution {
    gap: var(--people-accordion-inst-trigger-gap-desktop);
    padding-top: var(--people-accordion-inst-trigger-padding-y-desktop);
    padding-bottom: var(--people-accordion-inst-trigger-padding-y-desktop);
    min-height: 0;
    /* Figma desktop chiuso: Hug 118 (padding verticale 40 già incluso nel box sizing) */
    height: var(--people-accordion-inst-trigger-height-desktop);
    box-sizing: border-box;
    border-top: var(--people-accordion-inst-trigger-border-top);
    justify-content: space-between;
    align-items: center;
    opacity: 1;
  }

  .people-institution-accordion .PeopleAccordionItem--institution:first-child .PeopleAccordionTrigger--institution {
    border-top: none;
  }

  /* Spazio dopo pannello aperto prima dell’istituzione successiva */
  .people-institution-accordion .PeopleAccordionContent--institution[data-state='open'] {
    margin-bottom: var(--people-accordion-content-gap);
  }
}

/* Griglia accordion istituzione: mobile 2 colonne (Figma), desktop auto-fill card 316px */
.people-institution-accordion .people__grid--inst-accordion {
  --min: 260px;
  display: grid;
  column-gap: var(--people-accordion-grid-mobile-column-gap);
  row-gap: var(--people-accordion-grid-mobile-row-gap);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-width: 0;
}

@media (min-width: 768px) {
  /*
   * Colonne uniformi (1fr) al posto di max-content: righe incomplete allineate alle colonne sopra;
   * --min = larghezza card istituzione (`Person.vue` --size-width).
   */
  .people-institution-accordion .people__grid--inst-accordion {
    --min: 316px;
    column-gap: var(--app-padding);
    row-gap: 28px;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--min)), 1fr));
    justify-content: start;
    justify-items: start;
  }
}

.people-institution-accordion .people__grid--inst-accordion article.people-inst-badge {
  align-items: flex-start;
}

.people-institution-accordion .people__grid--inst-accordion article.people-inst-badge .people-inst-badge__text {
  justify-content: flex-start;
}
</style>
