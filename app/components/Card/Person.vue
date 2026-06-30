<template>
  <article
    :class="[
      size,
      {
        'inline': inline && !peopleRowBadge && !peopleInstitutionBadge,
        'people-row-badge': peopleRowBadge,
        'people-inst-badge': peopleInstitutionBadge,
      },
    ]"
  >
    <slot />
    <UiAvatar
      v-if="!hideAvatar"
      :size
      :src="avatarImageUrl"
      :alt="media?.image?.alt ?? undefined"
      :text="`${first_name} ${last_name}`"
    />
    <span
      v-else-if="peopleInstitutionBadge && hideAvatar"
      class="people-inst-badge__avatar-placeholder"
      aria-hidden="true"
    />
    <h3 v-if="peopleInstitutionBadge" class="row-badge people-inst-badge__text">
      <span class="people-inst-badge__name">{{ first_name }} {{ last_name }}</span>
      <span v-if="!hideRole && role" class="people-inst-badge__role">{{ role }}</span>
    </h3>
    <h3 v-else-if="peopleRowBadge" class="row-badge people-row-badge__text">
      <span class="people-row-badge__name" :title="rowBadgeNameTitle">{{ first_name }} {{ last_name }}</span>
      <span v-if="institution" class="people-row-badge__institution" :title="institution">{{ institution }}</span>
      <span
        v-if="!hideRole && (rowBadgeRoleOverride || role)"
        class="people-row-badge__role"
      >{{ rowBadgeRoleOverride || role }}</span>
    </h3>
    <h3 v-else class="row-badge">
      <span class="name"> {{ first_name }} {{ last_name }} </span> <br>
      <div v-if="(!hideRole && role) || institution">
        <span v-if="!hideRole && role" class="role"> {{ role }} </span>
        <span v-if="institution" class="institution"> {{ institution }} </span>
      </div>
    </h3>
  </article>
</template>

<script lang="ts">
import type { avatarSize } from '#layers/ui/app/types'
import type { Person } from '#shared/types/api'

export interface CardPerson extends Person {
  /**
   * @defaultValue 'lg'
   */
  size?: typeof avatarSize[number]
  inline?: boolean
  institution?: string
  /** Quando true, nasconde l'etichetta del ruolo (utile se il ruolo è già mostrato come titolo di sezione). */
  hideRole?: boolean
  /**
   * People: badge orizzontale (avatar a sinistra, 3 righe nome / istituzione / ruolo) come Figma.
   * @defaultValue false
   */
  peopleRowBadge?: boolean
  /**
   * People sezione istituzione (in accordion): avatar a sinistra, 2 righe nome e ruolo (Figma). Escluso da `peopleRowBadge`.
   * @defaultValue false
   */
  peopleInstitutionBadge?: boolean
  /**
   * Nasconde foto/iniziali: in accordion istituzioni resta un segnaposto invisibile, stessa larghezza/altezza dell’avatar.
   * @defaultValue false
   */
  hideAvatar?: boolean
  /**
   * Con `peopleRowBadge`, testo mostrato al posto del campo `role` (es. Chair/Member in comitati).
   */
  rowBadgeRoleOverride?: string
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<CardPerson>(), {
  size: 'lg',
  hideRole: false,
  peopleRowBadge: false,
  peopleInstitutionBadge: false,
  hideAvatar: false,
})

/** URL avatar: se esiste media.image.path usa il proxy Curator (NUXT_PUBLIC_BASE_URL + sign) con thumbnail; altrimenti fallback su url. */
const avatarImageUrl = computed(() => {
  const img = props.media?.image
  if (!img)
    return undefined
  const raw = img.path ?? ''
  const path = raw.startsWith('/') ? raw.slice(1) : raw
  if (path) {
    return `/api/image/${path}?w=200&h=200&fit=crop`
  }
  return img.url
})

/** Testo completo per tooltip nativo quando nome è clampato a 2 righe */
const rowBadgeNameTitle = computed(() =>
  `${props.first_name ?? ''} ${props.last_name ?? ''}`.trim(),
)
</script>

<style lang="postcss" scoped>
article {
  --size-width: 316px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 7px;
  &.inline {
    flex-direction: row;

    &.xs .name {
      margin-top: 3px;
    }
    &.sm .name {
      margin-top: 5px;
    }
    &.md .name {
      margin-top: 7px;
    }
    &.lg .name {
      margin-top: 8px;
    }
    &.xl .name {
      margin-top: 12px;
    }

    h3 div {
      flex-direction: row;
      gap: var(--app-padding);
    }
  }

  .row-badge {
    width: var(--size-width) !important;
    max-width: var(--size-width) !important;
  }

  &.people-row-badge {
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
    width: 100%;

    .row-badge {
      width: auto !important;
      max-width: min(var(--size-width), 100%) !important;
      flex: 1 1 0;
      min-width: 0;
    }

    @media (min-width: 800px) {
      gap: 16px;
    }
  }

  &.people-inst-badge {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    min-width: 0;
    width: var(--size-width) !important;
    max-width: var(--size-width) !important;

    /* Mobile accordion: Fill cella (~169px da Figma), non larghezza fissa 316px */
    @media (max-width: 767px) {
      gap: 7px;
      width: 100% !important;
      max-width: 100% !important;
    }

    @media (min-width: 768px) {
      gap: 14px;
    }
  }

  /* Stesse dimensioni di `Avatar.vue`, invisibile ma occupa lo spazio (allineamento testo) */
  &.people-inst-badge .people-inst-badge__avatar-placeholder {
    flex-shrink: 0;
    box-sizing: border-box;
    visibility: hidden;
    pointer-events: none;
  }

  &.xs.people-inst-badge .people-inst-badge__avatar-placeholder {
    width: 24px;
    height: 24px;
  }

  &.sm.people-inst-badge .people-inst-badge__avatar-placeholder {
    width: 32px;
    height: 32px;
  }

  &.md.people-inst-badge .people-inst-badge__avatar-placeholder {
    width: 40px;
    height: 40px;
  }

  &.lg.people-inst-badge .people-inst-badge__avatar-placeholder {
    width: 48px;
    height: 48px;
  }

  &.xl.people-inst-badge .people-inst-badge__avatar-placeholder {
    width: 64px;
    height: 64px;
  }

  &.xs {
    .name {
      font-size: var(--ui-text-small);
    }
    .role,
    .institution {
      font-size: 10px;
    }
  }
  &.sm {
    .name {
      font-size: var(--ui-text);
    }
    .role,
    .institution {
      font-size: var(--ui-text-extrasmall);
    }
  }
  &.md {
    .name {
      font-size: var(--ui-text-large);
    }
    .role,
    .institution {
      font-size: var(--ui-text-extrasmall);
    }
  }
  &.lg {
    .name {
      font-size: var(--ui-text-extralarge);
    }
    .role,
    .institution {
      font-size: var(--ui-text-small);
    }
  }
  &.xl {
    .name {
      font-size: var(--ui-text-xxlarge);
    }
    .role,
    .institution {
      font-size: var(--ui-text-small);
    }
  }

  h3 {
    display: flex;
    flex-direction: column;

    div {
      display: flex;
      flex-direction: column;
    }
  }

  .name {
    font-weight: var(--regular);
    line-height: 1.2;
  }
}

.people-row-badge__text {
  margin: 0;
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 2px;
  font-weight: var(--regular);
}

.people-row-badge__name,
.people-row-badge__institution {
  max-width: 100%;
  overflow-wrap: break-word;
  word-break: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.people-row-badge__name {
  /*
  font-size: var(--ui-text-large);
  font-weight: var(--regular);
  line-height: 1.25;
  color: var(--ui-neutral-text);
  width: 100%;

  OK
  */
  font-weight: var(--bold);
  font-size: 17px;
  line-height: 120%;
  width: 100%;
  letter-spacing: 0.5px;
  vertical-align: middle;
  color: rgba(17, 17, 17, 1);
}

.people-row-badge__institution {
  /*
  margin-top: 2px;
  font-size: var(--ui-text-small);
  line-height: 1.35;
  font-weight: var(--regular);
  color: var(--gray-8);
  width: 100%;

OK
  */
  font-weight: var(--regular);
  font-size: 12px;
  margin-top: 2px;
  width: 100%;
  line-height: 120%;
  letter-spacing: 0.5px;
  vertical-align: middle;
  color: rgba(17, 17, 17, 1);
}

.people-row-badge__role {
  /*
  display: block;
  margin-top: 2px;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: var(--ui-text-extrasmall);
  line-height: 1.35;
  font-weight: var(--medium);
  color: var(--gray-9);
  letter-spacing: 0.02em;

OK
  */
  font-weight: var(--regular);
  font-size: 12px;
  margin-top: 2px;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 120%;
  letter-spacing: 0.5px;
  vertical-align: middle;
  color: rgba(17, 17, 17, 1);
}

article.md .people-row-badge__institution {
  font-size: var(--ui-text-extrasmall);
}

article.xl .people-row-badge__name {
  font-size: var(--ui-text-extralarge);
}

.people-inst-badge__text {
  margin: 0;
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  font-weight: var(--regular);
}

.people-inst-badge__name,
.people-inst-badge__role {
  display: block;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.people-inst-badge__name {
  font-style: var(--people-inst-badge-name-font-style);
  font-weight: var(--people-inst-badge-name-font-weight);
  font-size: var(--people-inst-badge-name-font-size);
  line-height: var(--people-inst-badge-name-line-height);
  letter-spacing: var(--people-inst-badge-name-letter-spacing);
  vertical-align: middle;
  leading-trim: var(--people-inst-badge-name-leading-trim);
  color: rgba(17, 17, 17, 1);
  width: var(--size-width) !important;
}

@media (max-width: 767px) {
  .people-inst-badge__name {
    width: 100% !important;
  }
}

.people-inst-badge__role {
  /*
  font-size: var(--ui-text-extrasmall);
  line-height: 1.35;
  font-weight: var(--medium);
  color: var(--gray-8);
  letter-spacing: 0.02em;
  */
  font-weight: var(--regular);
  font-size: 12px;
  line-height: 120%;
  letter-spacing: 0.5px;
  vertical-align: middle;
  color: rgba(17, 17, 17, 1);
}

</style>
