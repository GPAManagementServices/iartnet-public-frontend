<template>
  <Presence :present="isOpen">
    <div class="app-menu-overlay" :data-state="isOpen ? 'open' : 'closed'" @click="isOpen = false" />
  </Presence>
  <Presence :present="isOpen">
    <nav class="app-menu" :data-state="isOpen ? 'open' : 'closed'">
      <!-- First column -->
      <UiButton
        class="first-column"
        variant="link"
        :to="$localePath('projects')"
        style="text-transform: uppercase;"
      >
        {{ $t('Research projects') }}
      </UiButton>

      <UiButton
        class="first-column"
        variant="link"
        :to="$localePath('search')"
        style="text-transform: uppercase;"
      >
        {{ $t('Search Database') }}
      </UiButton>

      <UiButton
        v-if="showNarratives"
        class="first-column"
        variant="link"
        :to="$localePath('narratives')"
        style="text-transform: uppercase;"
      >
        {{ $t('Narratives') }}
      </UiButton>

      <UiButton
        class="first-column"
        variant="link"
        :to="$localePath('activities')"
        style="text-transform: uppercase;"
      >
        {{ $t('Activities') }}
      </UiButton>

      <!-- Second column -->
      <UiButton
        class="second-column"
        variant="link"
        :to="$localePath('about')"
        style="text-transform: uppercase;"
      >
        {{ $t('About') }}
      </UiButton>

      <UiButton
        class="second-column"
        variant="link"
        :to="$localePath('institutions')"
        style="text-transform: uppercase;"
      >
        {{ $t('Institutions') }}
      </UiButton>
      <UiButton
        class="second-column"
        variant="link"
        :to="$localePath('people')"
        style="text-transform: uppercase;"
      >
        {{ $t('People') }}
      </UiButton>
      <UiButton
        class="second-column"
        variant="link"
        :to="$localePath('output')"
        style="text-transform: uppercase;"
      >
        {{ $t('Output') }}
      </UiButton>
    </nav>
  </Presence>
</template>

<script setup lang="ts">
const route = useRoute()
const isOpen = useState<boolean>('is-menu-open')
const config = useRuntimeConfig()
const showNarratives = computed(() => String(config.public.showNarratives) === 'true')

useBodyScrollLock(isOpen)

watch(route, () => {
  isOpen.value = false
})
</script>

<style lang="postcss" scoped>
.app-menu {
  position: fixed;
  top: 0;
  display: grid;
  grid-auto-flow: dense;
  align-content: center;
  justify-items: start;
  column-gap: 24px;
  width: 100%;
  padding: 128px var(--app-padding) 48px;
  background-color: white;
  z-index: 40;

  @media (min-width: 480px) {
    grid-template-columns: 1fr 1fr;
    padding: 128px 24px 48px;

    :deep(.first-column) {
      grid-column: 1;
    }
    :deep(.second-column) {
      grid-column: 2;
    }
  }
  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr 1fr;
    padding: 128px 40px 64px;

    :deep(.first-column) {
      grid-column: 2;
    }
    :deep(.second-column) {
      grid-column: 3;
    }
  }

  &[data-state='open'] {
    animation: slideDownAndFadeIn 400ms ease-out;
  }
  &[data-state='closed'] {
    animation: slideUpAndFadeOut 200ms ease-out;
  }
}

.app-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--black-a3);
  cursor: pointer;
  z-index: 40;

  &[data-state='open'] {
    animation: fadeIn 400ms;
  }
  &[data-state='closed'] {
    animation: fadeOut 400ms;
  }
}
</style>
