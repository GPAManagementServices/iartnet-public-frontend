<template>
  <div>
    <HeaderMain title="People" />
    <main class="app-padding">
      <AppBlock class="main">
        <!-- general_coordination: Academic Coordinator -->
        <div
          v-if="academicCoordinatorPeople.length"
          class="people__section"
          data-role-key="Academic Coordinator"
        >
          <h4
            class="people__role-title"
            :class="{ 'people__role-title--sr-only': isCompactRoleBadgeGroup('Academic Coordinator') }"
          >
            {{ t('Academic Coordinator') }}
          </h4>
          <div class="people__grid people__grid--role-badges">
            <CardPerson
              v-for="item in academicCoordinatorPeople"
              :key="item.id"
              v-bind="item"
              size="md"
              people-row-badge
              :institution="globalSectionInstitutionLine(item)"
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

        <!-- research_unit_leads (ordine alfabetico cognome) + eventuali RUL solo in general_coordination (progetto iartnet) -->
        <div
          v-if="researchUnitLeadsDisplay.length"
          class="people__section"
          data-role-key="Research Unit Lead"
        >
          <h4
            class="people__role-title"
            :class="{ 'people__role-title--sr-only': isCompactRoleBadgeGroup('Research Unit Lead') }"
          >
            {{ t('Research Unit Lead') }}
          </h4>
          <div class="people__grid people__grid--role-badges">
            <CardPerson
              v-for="item in researchUnitLeadsDisplay"
              :key="item.id"
              v-bind="item"
              size="md"
              people-row-badge
              :institution="globalSectionInstitutionLine(item)"
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

        <!-- General advisors (esclusi comitati e project staff in accordion) -->
        <div
          v-if="generalAdvisorGroup"
          class="people__section"
          data-role-key="General Advisor"
        >
          <h4
            class="people__role-title"
            :class="{ 'people__role-title--sr-only': isCompactRoleBadgeGroup('General Advisor') }"
          >
            {{ generalAdvisorGroup.roleLabel }}
          </h4>
          <div class="people__grid people__grid--role-badges">
            <CardPerson
              v-for="item in generalAdvisorGroup.people"
              :key="item.id"
              v-bind="item"
              size="md"
              people-row-badge
              :institution="globalSectionInstitutionLine(item)"
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
      </AppBlock>

      <!-- Stesso contenitore: nessun gap extra tra project staff e prima istituzione (ritmo = trigger accordion istituzioni). -->
      <div
        v-if="showPeopleMidAccordions || visibleInstitutionBlocks.length || externalConsultantsPeople.length"
        class="people-page-mid-and-institutions"
      >
        <div
          v-if="showPeopleMidAccordions"
          class="people-page-mid-accordions"
        >
          <PeopleScientificCommittees
            v-if="people"
            :people="allPeopleList"
            :get-institution-line="globalSectionInstitutionLine"
          />
          <PeopleProjectStaffAccordion
            v-if="projectStaffPeopleFlat.length"
            :people="projectStaffPeopleFlat"
            :get-institution-line="globalSectionInstitutionLine"
          />
        </div>

        <!-- Separatore: istituzioni sotto accordion comitati + project staff -->
        <AppBlock
          v-if="visibleInstitutionBlocks.length || externalConsultantsPeople.length"
          divider
          class="people-institutions-block"
        >
          <PeopleInstitutionAccordion
            :institutions="visibleInstitutionBlocks"
            :external-consultants="externalConsultantsPeople"
            :get-external-consultant-institution-line="globalSectionInstitutionLine"
          />
        </AppBlock>
      </div>

      <!-- Backup (solo con NUXT_PUBLIC_SHOW_HIDDEN_DATA=true): istituzioni senza blocco + persone non in alcuna sezione visibile -->
      <AppBlock v-if="peopleBackupVisible" class="people__backup" divider>
        <template #header>
          <h4 class="title">
            {{ $t('Backup') }} — {{ $t('People not listed in the sections above') }}
          </h4>
        </template>
        <p class="people__backup-desc">
          {{ $t('People backup summary', { nInst: hiddenInstitutionsBackup.length, nPeople: unassignedPeopleBackup.length }) }}
        </p>
        <pre class="people__backup-json">{{ backupJson }}</pre>
      </AppBlock>
    </main>

    <!-- Outlet annidato (shell in people/[slug].vue); il pannello usa PersonDetailContent come activities/projects -->
    <div class="people-page-outlet" aria-hidden="true">
      <NuxtPage />
    </div>

    <UiDialog
      :open="isPeopleDetailDialogOpen"
      side="right"
      title=""
      hide-title
      max-width="min(100vw - var(--app-padding), 560px)"
      @update:open="onPeoplePanelOpenChange"
    >
      <PersonDetailContent
        v-if="personDetailSlug"
        :key="personDetailSlug"
        :slug="personDetailSlug"
      />
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import type { Person } from '#shared/types/api'
import { committeeChairs, PEOPLE_SCIENTIFIC_COMMITTEES } from '#shared/data/peopleScientificCommittees'
import { isInstitutionShownOnPeoplePage } from '#shared/utils/institutionPartner'
import { isCompactRoleBadgeGroup } from '#shared/utils/peoplePageCompactBadgeGroups'
import { matchesAppRoleTitle } from '#shared/utils/peopleRoleMatch'
import { personHasDetailPage } from '#shared/utils/personDetailPage'
import { resolveEditorialPersonName } from '#shared/utils/resolveEditorialPersonName'
import PeopleInstitutionAccordion from '~/components/People/PeopleInstitutionAccordion.vue'
import PeopleProjectStaffAccordion from '~/components/People/PeopleProjectStaffAccordion.vue'
import PeopleScientificCommittees from '~/components/People/PeopleScientificCommittees.vue'
import PersonDetailContent from '~/components/People/PersonDetailContent.vue'

definePageMeta({
  scrollToTop(to, from) {
    const t = String(to.name ?? '')
    const f = String(from.name ?? '')
    return !t.startsWith('people-slug') && !f.startsWith('people-slug')
  },
})

const route = useRoute()
const localePath = useLocalePath()
const { detailRoute } = usePersonDetailLink()
const config = useRuntimeConfig()
const { t, locale } = useI18n()

/** Dati nascosti / sezione debug People (stesso flag OSD, tooltip, ecc.) */
const showHiddenData = computed(
  () => String(config.public.showHiddenData) === 'true',
)
const { data: people } = await useFetch('/api/people', {
  query: {
    locale: locale.value,
    ...(typeof route.query.role === 'string' && route.query.role.trim()
      ? { role: route.query.role.trim() }
      : {}),
  },
})

const isPeopleDetailDialogOpen = computed(() =>
  String(route.name ?? '').startsWith('people-slug'),
)

const personDetailSlug = computed(() => {
  if (!isPeopleDetailDialogOpen.value)
    return ''
  const s = route.params.slug
  if (typeof s === 'string')
    return s
  if (Array.isArray(s))
    return s[0] ?? ''
  return String(s ?? '')
})

function onPeoplePanelOpenChange(open: boolean): void {
  if (!open && String(route.name ?? '').startsWith('people-slug'))
    void navigateTo(localePath('people'))
}

const ROLE_ORDER = [
  'Academic Coordinator',
  'Academic Team Member',
  'Research Staff',
  'Research Unit Lead',
  'Chief Information Officer',
  'Digital Collections Curator',
  'General Advisor',
  'Project Manager',
  'Project Staff',
  'Research Coordinator and Communication',
  'Research Office Manager',
  'Research Group Coordinator',
  'Student Collaborator',
  'External Consultant',
] as const

/** Ruoli mostrati solo in sezione globale iartnet; non ripetuti sotto Accademia di Brera */
const GLOBAL_ROLES_BRERA = [
  'General Advisor',
  'Project Manager',
  'Research Office Manager',
  'Research Coordinator and Communication',
  'Chief Information Officer',
  'Digital Collections Curator',
  'External Consultant',
] as const

const BRERA_SLUG = 'brera-academy'

const UNICODE_MARKS_RE = /\p{M}/gu

/** Normalizza slug/nome per confronti (case, accenti). */
function normInstText(s: string | undefined): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(UNICODE_MARKS_RE, '')
}

interface InstRef {
  slug?: string
  name?: string
  slug_en?: string
  slug_it?: string
  display_sort_key?: string
}

function isBreraInstitution(inst: { slug?: string, name?: string }) {
  return inst.slug === BRERA_SLUG || (inst.name != null && inst.name.includes('Brera'))
}

/** Sotto-istituzione: 4 gruppi (documento); a Brera senza blocco “consulenti” globale. */
const INSTITUTION_SUBGROUPS_BRERA = [
  'Academic Team Member',
  'Research Staff',
  'Project Staff',
  'Student Collaborator',
] as const

/** Stessi 4 + consulente esterno (dove la scheda prevede il ruolo). */
const INSTITUTION_SUBGROUPS_WITH_EC = [
  'Academic Team Member',
  'Research Staff',
  'Project Staff',
  'Student Collaborator',
  'External Consultant',
] as const

/**
 * Ordine documento: Brera → Teatro alla Scala → Carrara → Catania → Brescia → UniMi.
 * Il primo `match` che torna true vince.
 */
const INSTITUTION_SECTIONS: ReadonlyArray<{
  roles: readonly string[]
  match: (i: InstRef) => boolean
}> = [
  {
    roles: INSTITUTION_SUBGROUPS_BRERA,
    match: (i) => {
      const s = normInstText(i.slug)
      const se = normInstText(i.slug_en)
      const si = normInstText(i.slug_it)
      const n = normInstText(i.name)
      if (s === 'brera-academy' || se === 'brera-academy' || si === 'brera-academy')
        return true
      if (n.includes('brera') && (n.includes('belle') || n.includes('accademia')))
        return true
      if (s.includes('brera') && !s.includes('carrara') && !s.includes('catania'))
        return true
      return isBreraInstitution(i)
    },
  },
  {
    roles: INSTITUTION_SUBGROUPS_WITH_EC,
    match: (i) => {
      const s = normInstText(i.slug) + normInstText(i.slug_en) + normInstText(i.slug_it)
      const n = normInstText(i.name)
      return s.includes('scala') || n.includes('alla scala') || n.includes('teatro alla scala')
    },
  },
  {
    roles: INSTITUTION_SUBGROUPS_WITH_EC,
    match: (i) => {
      const s = normInstText(i.slug) + normInstText(i.slug_en) + normInstText(i.slug_it)
      const n = normInstText(i.name)
      return s.includes('carrara') || n.includes('carrara')
    },
  },
  {
    roles: INSTITUTION_SUBGROUPS_WITH_EC,
    match: (i) => {
      const s = normInstText(i.slug) + normInstText(i.slug_en) + normInstText(i.slug_it)
      const n = normInstText(i.name)
      return s.includes('catania') || n.includes('catania')
    },
  },
  {
    roles: INSTITUTION_SUBGROUPS_WITH_EC,
    match: (i) => {
      const s = normInstText(i.slug) + normInstText(i.slug_en) + normInstText(i.slug_it)
      const n = normInstText(i.name)
      return s.includes('brescia') || n.includes('brescia') || n.includes('marenzio')
    },
  },
  {
    roles: INSTITUTION_SUBGROUPS_WITH_EC,
    match: (i) => {
      const s = normInstText(i.slug) + normInstText(i.slug_en) + normInstText(i.slug_it)
      const n = normInstText(i.name)
      if (s.includes('unimi') || s.includes('studi-milano') || s.includes('unimi-studi'))
        return true
      if (n.includes('universit') && n.includes('milano'))
        return true
      if (n.includes('studi') && n.includes('milano') && n.includes('universit'))
        return true
      return false
    },
  },
]

function institutionDocumentOrderIndex(inst: InstRef): number {
  const idx = INSTITUTION_SECTIONS.findIndex(s => s.match(inst))
  return idx === -1 ? 1000 : idx
}

/** Solo i partner editoriali People (Brera, Scala, Carrara, Catania, Brescia, UniMi). */
function isDocumentPartnerInstitution(inst: InstRef): boolean {
  return INSTITUTION_SECTIONS.some(s => s.match(inst))
}

function rolesForInstitution(inst: InstRef): readonly string[] {
  const section = INSTITUTION_SECTIONS.find(s => s.match(inst))
  return section?.roles ?? ROLE_ORDER
}

/** Etichetta istituzione/i per tessera in sezione globale (nomi separati da virgola se più di una). */
function globalSectionInstitutionLine(p: Person): string | undefined {
  const names = p.institutions?.map(i => i.name).filter((n): n is string => Boolean(n?.trim()))
  if (!names?.length)
    return undefined
  return [...new Set(names)].join(', ')
}

function sortPeople<T extends { last_name?: string, first_name?: string }>(collection: T[] | undefined): T[] {
  if (!collection?.length)
    return []
  return collection.toSorted((a, b) =>
    (a.last_name ?? '').localeCompare(b.last_name ?? '')
    || (a.first_name ?? '').localeCompare(b.first_name ?? ''))
}

/** EC con istituzione: restano nel blocco istituzione, non nel gruppo globale External Consultant. */
function personHasInstitutionalAffiliation(p: Person): boolean {
  return Boolean(
    p.institutions?.some(i => Boolean(i.name?.trim() || i.slug?.trim())),
  )
}

/** CNAM: non mostrare blocco istituzione in coda (resta in anagrafica globale sulle card). */
function isCnamInstitutionBlock(inst: InstRef): boolean {
  const s = normInstText(inst.slug) + normInstText(inst.slug_en) + normInstText(inst.slug_it)
  const n = normInstText(inst.name)
  if (s.includes('cnam'))
    return true
  if (n.includes('cnam'))
    return true
  if (n.includes('consiglio nazionale') && (n.includes('alta formazione') || n.includes('artistica e musicale')))
    return true
  return false
}

/** Blocco istituzione in People: elenco documento + no CNAM + categoria partner CMS. */
function isInstitutionBlockVisibleOnPeople(inst: InstRef & { categories?: { slug: string }[] }): boolean {
  if (isCnamInstitutionBlock(inst))
    return false
  if (!isDocumentPartnerInstitution(inst))
    return false
  return isInstitutionShownOnPeoplePage(inst)
}

interface PeopleRoleGroup {
  roleKey: string
  roleLabel: string
  people: Person[]
}

function groupByRoleOrder(
  collection: Person[] | undefined,
  roleFilter?: readonly string[],
): PeopleRoleGroup[] {
  if (!collection?.length)
    return []
  const order = roleFilter ?? ROLE_ORDER
  return order.map((roleKey) => {
    const roleLabel = t(roleKey)
    const list = sortPeople(collection.filter(p => matchesAppRoleTitle(p, roleKey, roleLabel)))
    return { roleKey, roleLabel, people: list }
  }).filter(g => g.people.length > 0)
}

/** general_coordination (grouped) oppure iartnet (legacy). */
const generalCoordination = computed(() => {
  const v = people.value
  if (!v)
    return []
  if (v.mode === 'grouped')
    return v.general_coordination ?? []
  return v.iartnet ?? []
})

const researchUnitLeadsFromApi = computed(() => {
  const v = people.value
  if (!v || v.mode !== 'grouped')
    return []
  return v.research_unit_leads ?? []
})

/** Legacy: RUL da iartnet + people per istituzione. */
const legacyResearchUnitLeads = computed((): Person[] => {
  const v = people.value
  if (!v || v.mode !== 'legacy')
    return []
  const out: Person[] = []
  const seen = new Set<number>()
  const label = t('Research Unit Lead')
  for (const p of v.iartnet ?? []) {
    if (matchesAppRoleTitle(p, 'Research Unit Lead', label) && !seen.has(p.id)) {
      seen.add(p.id)
      out.push(p)
    }
  }
  for (const inst of v.institutions ?? []) {
    if (!isInstitutionBlockVisibleOnPeople(inst))
      continue
    for (const p of inst.people ?? []) {
      if (matchesAppRoleTitle(p, 'Research Unit Lead', label) && !seen.has(p.id)) {
        seen.add(p.id)
        out.push(p)
      }
    }
  }
  return sortPeople(out)
})

/** RUL: merge API + GC progetto; ordine alfabetico per cognome (come resto anagrafica). */
const researchUnitLeadsDisplay = computed((): Person[] => {
  if (people.value?.mode === 'legacy')
    return legacyResearchUnitLeads.value
  const apiList = [...researchUnitLeadsFromApi.value]
  const apiIds = new Set(apiList.map(p => p.id))
  const label = t('Research Unit Lead')
  const extraFromGc = generalCoordination.value.filter(
    p => !apiIds.has(p.id) && matchesAppRoleTitle(p, 'Research Unit Lead', label),
  )
  return sortPeople([...apiList, ...extraFromGc])
})

const academicCoordinatorPeople = computed((): Person[] => {
  const label = t('Academic Coordinator')
  return sortPeople(
    generalCoordination.value.filter(p => matchesAppRoleTitle(p, 'Academic Coordinator', label)),
  )
})

const researchUnitLeadDisplayIds = computed(() => new Set(researchUnitLeadsDisplay.value.map(p => p.id)))

/** general_coordination senza AC e senza chi è già nel blocco RUL (inclusi RUL progetto). */
const globalCoordinationForRoleGrid = computed((): Person[] => {
  const labelAc = t('Academic Coordinator')
  const labelRul = t('Research Unit Lead')
  const rulIds = researchUnitLeadDisplayIds.value
  return generalCoordination.value.filter((p) => {
    if (rulIds.has(p.id))
      return false
    if (matchesAppRoleTitle(p, 'Academic Coordinator', labelAc))
      return false
    if (matchesAppRoleTitle(p, 'Research Unit Lead', labelRul))
      return false
    return true
  })
})

/**
 * Ruoli globali da general_coordination.
 * External Consultant globale: solo senza istituzione; gli EC con istituzione solo sotto il blocco istituzione.
 */
const globalRoleGroups = computed((): PeopleRoleGroup[] => {
  const groups = groupByRoleOrder(globalCoordinationForRoleGrid.value, GLOBAL_ROLES_BRERA)
  return groups
    .map((g) => {
      if (g.roleKey !== 'External Consultant')
        return g
      return {
        ...g,
        people: g.people.filter(p => !personHasInstitutionalAffiliation(p)),
      }
    })
    .filter(g => g.people.length > 0)
})

/** Sotto-sequenza in accordion "Project staff" (ordine documento). */
const PROJECT_STAFF_ACCORDION_ROLE_KEYS = [
  'Project Manager',
  'Digital Collections Curator',
  'Research Coordinator and Communication',
] as const

/** Project staff globale spostato da Brera (editoriale; non in general_coordination). */
const PEOPLE_GLOBAL_PROJECT_STAFF_FROM_BRERA = ['Bruno Aliprandi'] as const

const PEOPLE_GLOBAL_PROJECT_STAFF_FROM_BRERA_ROLE: Readonly<Record<string, string>> = {
  'Bruno Aliprandi': 'Chief Technology Officer',
}

function isGlobalProjectStaffFromBrera(p: Person): boolean {
  return PEOPLE_GLOBAL_PROJECT_STAFF_FROM_BRERA.some(
    name => resolveEditorialPersonName([p], name)?.id === p.id,
  )
}

const generalAdvisorGroup = computed((): PeopleRoleGroup | null => {
  const g = globalRoleGroups.value.find(x => x.roleKey === 'General Advisor')
  if (!g?.people.length)
    return null
  return g
})

const projectStaffAccordionGroups = computed((): PeopleRoleGroup[] => {
  const out: PeopleRoleGroup[] = []
  for (const k of PROJECT_STAFF_ACCORDION_ROLE_KEYS) {
    const g = globalRoleGroups.value.find(x => x.roleKey === k)
    if (g?.people.length)
      out.push(g)
  }
  return out
})

/** Tutte le persone nella risposta, deduplicate per id. */
const allPeopleList = computed((): Person[] => {
  const byId = new Map<number, Person>()
  const v = people.value
  if (!v)
    return []
  if (v.mode === 'grouped') {
    for (const p of v.general_coordination ?? [])
      byId.set(p.id, p)
    for (const p of v.research_unit_leads ?? [])
      byId.set(p.id, p)
    for (const inst of v.institutions ?? []) {
      for (const p of inst.people ?? [])
        byId.set(p.id, p)
    }
  }
  else {
    for (const p of v.iartnet ?? [])
      byId.set(p.id, p)
    for (const inst of v.institutions ?? []) {
      for (const p of inst.people ?? [])
        byId.set(p.id, p)
    }
  }
  return [...byId.values()]
})

/** Project staff: elenco piatto (ordine gruppi documento, nessun titolo intermedio in UI). */
const projectStaffPeopleFlat = computed((): Person[] => {
  const out: Person[] = []
  const seen = new Set<number>()
  for (const g of projectStaffAccordionGroups.value) {
    for (const p of g.people) {
      if (!seen.has(p.id)) {
        seen.add(p.id)
        out.push(p)
      }
    }
  }
  for (const name of PEOPLE_GLOBAL_PROJECT_STAFF_FROM_BRERA) {
    const p = resolveEditorialPersonName(allPeopleList.value, name)
    if (p && !seen.has(p.id)) {
      seen.add(p.id)
      const roleKey = PEOPLE_GLOBAL_PROJECT_STAFF_FROM_BRERA_ROLE[name]
      out.push(roleKey ? { ...p, role: t(roleKey) } : p)
    }
  }
  return sortPeople(out)
})

/** Wrapper fuori da .ui-block.main: mostra se c’è almeno comitati (payload) o project staff in accordion. */
const showPeopleMidAccordions = computed(
  () => Boolean(people.value) || projectStaffPeopleFlat.value.length > 0,
)

const institutionsPayload = computed(() => people.value?.institutions ?? [])

/**
 * Istituzioni: ordine documento (Brera → Carrara → …); solo partner di progetto; no CNAM.
 * Ruoli per blocco: whitelist; persone ordinate per cognome in groupByRoleOrder.
 */
const institutionRoleGroups = computed(() => {
  const list = [...institutionsPayload.value]
    .filter(inst => isInstitutionBlockVisibleOnPeople(inst))
    .sort((a, b) => {
      const da = institutionDocumentOrderIndex(a)
      const db = institutionDocumentOrderIndex(b)
      if (da !== db)
        return da - db
      const ka = a.display_sort_key ?? a.name ?? ''
      const kb = b.display_sort_key ?? b.name ?? ''
      return ka.localeCompare(kb, undefined, { sensitivity: 'base' })
    })
  return list.map((institution) => {
    const roleFilter = rolesForInstitution(institution)
    let groups = groupByRoleOrder(institution.people, [...roleFilter])
    if (isBreraInstitution(institution)) {
      groups = groups.filter(
        g => !GLOBAL_ROLES_BRERA.includes(g.roleKey as typeof GLOBAL_ROLES_BRERA[number]),
      )
      groups = groups.map((g) => {
        if (g.roleKey !== 'Project Staff')
          return g
        return {
          ...g,
          people: g.people.filter(p => !isGlobalProjectStaffFromBrera(p)),
        }
      })
    }
    return { ...institution, groups }
  })
})

/** Istituzioni con almeno un gruppo non vuoto (accordion). */
const visibleInstitutionBlocks = computed(() =>
  institutionRoleGroups.value.filter(inst => inst.groups.some(g => g.people.length)),
)

/** Consulenti esterni senza istituzione: ultima voce nello stesso accordion delle istituzioni. */
const externalConsultantsPeople = computed((): Person[] => {
  const g = globalRoleGroups.value.find(x => x.roleKey === 'External Consultant')
  return g?.people ?? []
})

/** Id persone mostrate nei comitati scientifici (editoriale), se presenti in API. */
const scientificCommitteePersonIds = computed((): Set<number> => {
  const list = allPeopleList.value
  const ids = new Set<number>()
  for (const c of PEOPLE_SCIENTIFIC_COMMITTEES) {
    for (const name of committeeChairs(c)) {
      const chair = resolveEditorialPersonName(list, name)
      if (chair)
        ids.add(chair.id)
    }
    for (const n of c.members) {
      const p = resolveEditorialPersonName(list, n)
      if (p)
        ids.add(p.id)
    }
  }
  return ids
})

watch(
  [personDetailSlug, allPeopleList],
  ([slug, list]) => {
    if (!slug || !list.length)
      return
    const p = list.find(x => x.slug === slug)
    if (p && !personHasDetailPage(p))
      void navigateTo(localePath('people'))
  },
  { flush: 'post' },
)

/** Istituzioni nel payload senza blocco visibile (CNAM o non partner): elencate nel backup. */
const hiddenInstitutionsBackup = computed(() => {
  return institutionsPayload.value
    .filter(inst => !isInstitutionBlockVisibleOnPeople(inst))
    .map((inst) => {
      const cnam = isCnamInstitutionBlock(inst)
      const documentPartner = isDocumentPartnerInstitution(inst)
      const partner = isInstitutionShownOnPeoplePage(inst)
      let Motivo: string
      if (cnam && !partner)
        Motivo = 'CNAM; non partner progetto'
      else if (cnam)
        Motivo = 'CNAM'
      else if (!documentPartner)
        Motivo = 'Fuori elenco partner documento People'
      else if (!partner)
        Motivo = 'Non partner progetto (categoria CMS)'
      else
        Motivo = 'Non partner progetto'
      return {
        Nome: inst.name ?? '—',
        Slug: inst.slug ?? '—',
        Motivo,
      }
    })
})

/** Persone già mostrate nelle sezioni principali. */
const assignedPersonIds = computed(() => {
  const ids = new Set<number>()
  for (const p of academicCoordinatorPeople.value)
    ids.add(p.id)
  for (const p of researchUnitLeadsDisplay.value)
    ids.add(p.id)
  for (const g of globalRoleGroups.value) {
    for (const p of g.people)
      ids.add(p.id)
  }
  for (const p of projectStaffPeopleFlat.value)
    ids.add(p.id)
  for (const inst of institutionRoleGroups.value) {
    for (const group of inst.groups) {
      for (const p of group.people)
        ids.add(p.id)
    }
  }
  for (const id of scientificCommitteePersonIds.value)
    ids.add(id)
  return ids
})

/** Backup a pié pagina: persone non in alcuna sezione visibile (inclusi chi era solo in blocchi istituzione nascosti). */
const unassignedPeopleBackup = computed(() => {
  const assigned = assignedPersonIds.value
  return allPeopleList.value
    .filter(p => !assigned.has(p.id))
    .map(p => ({
      Nome: `${(p.first_name ?? '').trim()} ${(p.last_name ?? '').trim()}`.trim() || '—',
      Ruolo: (p.role ?? '').trim() || '—',
      Istituzione: (p.institutions?.map(i => i.name).filter(Boolean).join(', ') as string) || '—',
    }))
})

const peopleBackupVisible = computed(
  () => showHiddenData.value
    && (hiddenInstitutionsBackup.value.length > 0 || unassignedPeopleBackup.value.length > 0),
)

/** JSON strutturato per la sezione backup (istituzioni nascoste + persone non assegnate). */
const backupJson = computed(() =>
  JSON.stringify(
    {
      istituzioni_non_visualizzate: hiddenInstitutionsBackup.value,
      persone_non_visualizzate: unassignedPeopleBackup.value,
    },
    null,
    2,
  ),
)
</script>

<style lang="postcss" scoped>
main {
  display: flex;
  flex-direction: column;
  gap: 128px;
  margin-bottom: 96px;
}

@media (min-width: 1024px) {
  .ui-block.main {
    padding-left: 25%;
  }
}

.people__section {
  --people-section-stack-gap: clamp(80px, 5.5rem, 120px);

  & + .people__section {
    margin-top: var(--people-section-stack-gap);
  }
}

/*
 * Nessun gap tra `.people-page-mid-accordions` e istituzioni: lo stack usa solo
 * padding dei trigger (40px) + `border-top` del blocco istituzioni / righe successive.
 */
.people-page-mid-and-institutions {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  min-width: 0;
}

/*
 * Il margine alto predefinito di `AppBlock` è azzerato qui (non serve compensare un gap wrapper).
 */
.people-institutions-block :deep(.app-block__content) {
  margin-top: 0;
  margin-bottom: var(--app-padding);
}

.people-page-mid-accordions {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
}

.people-page-mid-accordions > .people-top-accordion:not(:last-child) {
  /*margin-bottom: calc(var(--ui-text-large) * 1.2 + 20px);*/
}

@media (min-width: 768px) {
  .people-page-mid-accordions > .people-top-accordion:not(:last-child) {
    /*margin-bottom: calc(var(--ui-text-large) * 1.2 + 24px);*/
  }
}

.people__role-title {
  margin: 0 0 24px;
  font-size: var(--ui-text-large);
  font-weight: var(--bold);
  line-height: 1.2;
}

.people__role-title--sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.people__grid {
  --min: 240px;
  display: grid;
  column-gap: var(--app-padding);
  row-gap: 32px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--min)), 1fr));
  }

  & + .people__grid {
    margin-top: 0;
  }
}

/*
 * Badge sopra accordion: mobile = 2 col / gap da Figma (come accordion da <768px);
 * desktop ripristino `auto-fill` con min-card 280px come prima delle modifiche a 2 col fisse.
 */
.people__grid--role-badges {
  --min: 280px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: var(--people-accordion-grid-mobile-column-gap);
  row-gap: var(--people-accordion-grid-mobile-row-gap);
  min-width: 0;
  align-items: start;

  @media (min-width: 768px) {
    column-gap: var(--app-padding);
    row-gap: 32px;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--min)), 1fr));
    justify-content: stretch;
  }
}

/* RUL: più colonne, adatto a una/due righe di card */
.people__grid--compact {
  --min: 200px;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--min)), 1fr));

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

.people__backup {
  margin-top: 64px;
}

.people__backup-desc {
  margin: 0 0 16px;
  font-size: var(--ui-text-small);
  color: var(--gray-6, #666);
}

.people__backup-json {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.4;
  background: var(--gray-1, #f5f5f5);
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Outlet `people/[slug]`: solo per la route annidata; nessun spazio in layout */
.people-page-outlet {
  height: 0;
  overflow: hidden;
  pointer-events: none;
}
</style>
