<template>
  <div
    class="story-link-scheda-media"
    :class="{ 'story-link-scheda-media--fill': fill }"
  >
    <slot />
    <a
      v-if="href && layoutClass"
      class="story-link-scheda"
      :class="layoutClass"
      :href="href"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="$t('Vai alla scheda')"
    >
      <span class="story-link-scheda__icon">
        <UiIcon
          name="go-to-digital-object"
          collection="app"
          size="24px"
        />
      </span>
      <span class="story-link-scheda__label">{{ $t('Vai alla scheda') }}</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import type { TStoryLinkSchedaType } from '#shared/types/api'
import { storyLinkHref, storyLinkSchedaLayoutClass } from '#shared/utils/storyLinkScheda'
import { computed } from 'vue'
import UiIcon from '~~/layers/ui/app/components/Icon.vue'

const props = defineProps<{
  linkScheda?: TStoryLinkSchedaType | null
  /** When true, the wrapper fills the parent (cover layouts). */
  fill?: boolean
}>()

const href = computed(() => storyLinkHref(props.linkScheda))

const layoutClass = computed(() => {
  const layout = props.linkScheda?.Layout
  return layout ? storyLinkSchedaLayoutClass(layout) : null
})
</script>
