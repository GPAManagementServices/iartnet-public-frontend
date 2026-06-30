<template>
  <div class="people-committee-entry">
    <CardPerson
      v-if="person"
      v-bind="person"
      :institution="institution"
      size="md"
      hide-role
    >
      <NuxtLink
        v-if="hasDetail && person && detailRoute(person)"
        class="stretched-link"
        :to="localePath(detailRoute(person)!)"
        :aria-label="ariaLabel"
      />
    </CardPerson>
    <p
      v-else
      class="people-committee-fallback"
    >
      {{ name }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Person } from '#shared/types/api'
import { personHasDetailPage } from '#shared/utils/personDetailPage'

const props = defineProps<{
  name: string
  person: Person | null
  institution?: string
}>()

const localePath = useLocalePath()
const { detailRoute } = usePersonDetailLink()

const hasDetail = computed(() => props.person != null && personHasDetailPage(props.person))

const ariaLabel = computed(
  () => (props.person ? `${props.person.first_name} ${props.person.last_name}` : ''),
)
</script>

<style scoped lang="postcss">
.people-committee-fallback {
  margin: 0;
  font-size: var(--ui-text);
  line-height: 1.3;
  color: var(--color-text, inherit);
}
</style>
