<template>
  <main class="person-detail app-padding">
    <UiAvatar
      size="xl"
      :src="data?.media.image?.url"
      :alt="data?.media.image?.alt ?? undefined"
      :text="`${data?.first_name} ${data?.last_name}`"
    />
    <h1>
      <span class="title"> {{ data?.first_name }} {{ data?.last_name }} </span> <br>
      <strong v-if="data?.role" class="uppercase role"> {{ data.role }} </strong>
      <br v-if="personWebsite">
      <UiLink
        v-if="personWebsite"
        :to="personWebsite"
        target="_blank"
        rel="noopener noreferrer"
        class="person-detail__website"
      >
        {{ personWebsite }}
      </UiLink>
    </h1>

    <div v-if="data?.shortbio" class="person-detail__bio rich-text" v-html="data.shortbio" />
  </main>
</template>

<script setup lang="ts">
import type { Person } from '#shared/types/api'
import { normalizeHttpExternalUrl } from '#shared/utils/httpExternalUrl'

const props = defineProps<{
  slug: string
}>()

const { locale } = useI18n()

const requestPath = computed(() => `/api/people/${props.slug}`)

const { data } = useFetch<Person>(requestPath, {
  query: { locale },
})

const personWebsite = computed(() => normalizeHttpExternalUrl(data.value?.website))
</script>

<style lang="postcss" scoped>
.person-detail {
  display: flex;
  flex-direction: column;
  gap: var(--app-gap);

  .AvatarRoot {
    width: 256px;
    height: 256px;
    border-radius: var(--ui-radius);
  }

  .role {
    font-size: var(--text-mini);
  }
}

.person-detail__website {
  max-width: 100%;
  font-size: var(--text-small);
  overflow-wrap: anywhere;
  word-break: break-word;
}

.person-detail__bio {
  max-width: 60ch;
}
</style>
