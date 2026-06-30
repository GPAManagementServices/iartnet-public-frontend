<template>
  <p ref="root" class="numbers__card-value">
    {{ formatted }}
  </p>
</template>

<script setup lang="ts">
import type { CubicBezierPoints } from '@vueuse/core'
import { TransitionPresets } from '@vueuse/core'
import { formatStatValue } from '~/utils/formatStatValue'

const props = withDefaults(defineProps<{
  value: number
  compact?: boolean
  delay?: number
  duration?: number
}>(), {
  compact: false,
  delay: 0,
  duration: 5000,
})

const statCounterEasing: CubicBezierPoints = TransitionPresets.easeInOutExpo

const { locale } = useI18n()
const root = ref<HTMLElement | null>(null)
const source = ref(0)
const started = ref(false)

const prefersReducedMotion = usePreferredReducedMotion()
const transitionDisabled = computed(() => prefersReducedMotion.value === 'reduce')

const displayed = useTransition(source, {
  duration: computed(() => props.duration),
  delay: computed(() => props.delay),
  disabled: transitionDisabled,
  // Lento all'inizio, accelerazione al centro, rallentamento in chiusura
  transition: statCounterEasing,
})

const formatted = computed(() =>
  formatStatValue(displayed.value, locale.value, { compact: props.compact }),
)

useIntersectionObserver(
  root,
  ([entry]) => {
    if (!entry?.isIntersecting || started.value)
      return
    started.value = true
    source.value = props.value
  },
  { threshold: 0.2 },
)
</script>

<style lang="postcss" scoped>
.numbers__card-value {
  margin: 0;
  min-width: 0;
  max-width: 100%;
  font-size: clamp(2rem, 4.5vw, 3rem);
  font-weight: var(--regular);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--gray-12);
  text-align: center;
}
</style>
