<template>
  <Primitive
    class="UiCarousel embla"
    as="section"
    role="region"
    aria-roledescription="carousel"
    tabindex="0"
    @keydown="onKeyDown"
  >
    <!-- viewport -->
    <div ref="emblaRef" class="CarouselViewport">
      <!-- container -->
      <div class="CarouselContainer">
        <div
          v-for="(item, index) in items"
          :key="index"
          role="group"
          aria-roledescription="slide"
          :aria-label="`Slide ${index + 1} of ${items.length}`"
          class="CarouselSlide"
        >
          <slot :item :index />
        </div>
      </div>
    </div>
    <!-- controls -->
    <div v-if="arrows || dots || (autoPlay && autoPlayControls)" class="CarouselControls">
      <div v-if="arrows || (autoPlay && autoPlayControls)" class="CarouselButtons">
        <template v-if="arrows">
          <UiButton
            icon="chevron-left"
            variant="outline"
            aria-label="Previous"
            :disabled="!canScrollPrev"
            @click="scrollPrev()"
          />
          <UiButton
            icon="chevron-right"
            variant="outline"
            aria-label="Next"
            :disabled="!canScrollNext"
            @click="scrollNext()"
          />
        </template>
        <UiButton
          v-if="autoPlay && autoPlayControls"
          :icon="isAutoplayPlaying ? 'pause' : 'play'"
          variant="link"
          rounded
          size="lg"
          class="autoplay-button"
          :class="{ 'is-playing': isAutoplayPlaying }"
          :aria-label="isAutoplayPlaying ? 'Pause autoplay' : 'Play autoplay'"
          @click="toggleAutoplay()"
        >
          <!-- Progress Ring SVG Overlay -->
          <svg
            class="progress-ring"
            width="100%"
            height="100%"
            viewBox="0 0 42 42"
          >
            <circle
              cx="21"
              cy="21"
              r="19"
              fill="transparent"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="119.38"
              stroke-dashoffset="0"
              opacity="0.2"
            />
            <!-- Progress circle -->
            <circle
              v-if="isAutoplayPlaying"
              class="progress-ring-circle"
              cx="21"
              cy="21"
              r="19"
              fill="transparent"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="119.38"
              stroke-dashoffset="119.38"
            />
          </svg>
        </UiButton>
      </div>

      <div v-if="dots" class="CarouselDots">
        <button
          v-for="(_, index) in scrollSnaps"
          :key="index"
          :aria-label="`${index + 1}/${scrollSnaps.length}`"
          class="CarouselDot"
          :class="{ active: selectedIndex === index }"
          :data-state="selectedIndex === index ? 'active' : undefined"
          @click="scrollTo(index)"
        />
      </div>
    </div>
  </primitive>
</template>

<script setup lang="ts">
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from 'embla-carousel'
import type { AutoplayOptionsType } from 'embla-carousel-autoplay'
import type { FadeOptionsType } from 'embla-carousel-fade'
import type { WheelGesturesPluginOptions } from 'embla-carousel-wheel-gestures'
import useEmblaCarousel from 'embla-carousel-vue'
import { useForwardProps } from 'reka-ui'

defineOptions({ name: 'UiCarousel' })

const props = withDefaults(defineProps<CarouselProps>(), {
  slidesPerView: 1,
  arrows: false,
  dots: false,
  spacing: '8px',
  // Embla Options
  active: true,
  loop: false,
  align: 'start',
  breakpoints: () => ({}),
  containScroll: 'trimSnaps',
  dragFree: false,
  dragThreshold: 10,
  duration: 25,
  inViewThreshold: 0,
  skipSnaps: false,
  slidesToScroll: 'auto',
  startIndex: 0,
  watchDrag: true,
  watchResize: true,
  watchSlides: true,
  watchFocus: true,
  // Embla Plugins
  fade: false,
  wheelGestures: false,
  autoPlayControls: false,
})

const emits = defineEmits<{
  (e: 'select', index: number): void
}>()

interface CarouselProps<T = any> {
  items: T[]
  slidesPerView?: number | { [key: string]: number }
  spacing?: string
  loop?: boolean
  align?: 'start' | 'center' | 'end'
  containScroll?: false | 'trimSnaps' | 'keepSnaps'
  slidesToScroll?: 'auto' | number
  arrows?: boolean
  dots?: boolean
  active?: boolean
  breakpoints?: EmblaOptionsType['breakpoints']
  dragFree?: boolean
  dragThreshold?: number
  duration?: number
  inViewThreshold?: number
  skipSnaps?: boolean
  startIndex?: number
  watchDrag?: boolean
  watchResize?: boolean
  watchSlides?: boolean
  watchFocus?: boolean
  fade?: boolean | FadeOptionsType
  wheelGestures?: boolean | WheelGesturesPluginOptions
  autoPlay?: boolean | AutoplayOptionsType
  autoPlayControls?: boolean
}

const rootProps = useForwardProps(reactivePick(props, 'active', 'align', 'breakpoints', 'containScroll', 'dragFree', 'dragThreshold', 'duration', 'inViewThreshold', 'loop', 'skipSnaps', 'slidesToScroll', 'startIndex', 'watchDrag', 'watchResize', 'watchSlides', 'watchFocus'))

const options = computed<EmblaOptionsType>(() => ({
  ...rootProps.value,
}))

// const plugins = ref<EmblaPluginType[]>([WheelGesturesPlugin({ forceWheelAxis: 'x' })])
// const plugins = computedAsync<EmblaPluginType[]>(async () => {
//   const plugins = []

//   if (props.fade) {
//     const FadePlugin = await import('embla-carousel-fade').then(r => r.default)
//     plugins.push(FadePlugin(typeof props.fade === 'boolean' ? {} : props.fade))
//   }

//   if (props.wheelGestures) {
//     const { WheelGesturesPlugin } = await import('embla-carousel-wheel-gestures')
//     plugins.push(WheelGesturesPlugin(typeof props.wheelGestures === 'boolean' ? {} : props.wheelGestures))
//   }

//   return plugins
// })

const plugins = ref<EmblaPluginType[]>([])
const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins.value)
const autoplayApi = ref<any>(null)

onMounted(async () => {
  const activePlugins = []

  if (props.autoPlay) {
    const AutoplayPlugin = await import('embla-carousel-autoplay').then(m => m.default)
    const autoplayPluginInstance = AutoplayPlugin(typeof props.autoPlay === 'boolean' ? {} : props.autoPlay)
    activePlugins.push(autoplayPluginInstance)
    autoplayApi.value = autoplayPluginInstance
  }

  if (props.fade) {
    const FadePlugin = await import('embla-carousel-fade').then(m => m.default)
    activePlugins.push(FadePlugin(typeof props.fade === 'boolean' ? {} : props.fade))
  }

  if (props.wheelGestures) {
    const { WheelGesturesPlugin } = await import('embla-carousel-wheel-gestures')
    activePlugins.push(WheelGesturesPlugin(typeof props.wheelGestures === 'boolean' ? {} : props.wheelGestures))
  }

  plugins.value = activePlugins
  // Reinitialize carousel with plugins
  if (emblaApi.value) {
    emblaApi.value.reInit(options.value, plugins.value)
  }
})

watch([options, plugins], () => {
  emblaApi.value?.reInit(options.value, plugins.value)
})

const canScrollNext = ref(false)
const canScrollPrev = ref(false)
const selectedIndex = ref<number>(0)
const scrollSnaps = ref<number[]>([])
const isAutoplayPlaying = ref(false)
const progressAnimationDelay = ref(4000) // Default delay
const progressDuration = computed(() => `${progressAnimationDelay.value}ms`)

// Update the animation delay based on autoplay options
watch(() => props.autoPlay, (newVal) => {
  if (newVal && typeof newVal === 'object' && newVal.delay) {
    if (typeof newVal.delay === 'number') {
      progressAnimationDelay.value = newVal.delay
    }
    else {
      // If delay is a function, use default delay (could be enhanced to calculate based on function result)
      progressAnimationDelay.value = 4000
    }
  }
  else {
    progressAnimationDelay.value = 4000 // Default delay
  }
}, { immediate: true })

function onInit(api: EmblaCarouselType) {
  scrollSnaps.value = api?.scrollSnapList() || []
}

function onSelect(api: EmblaCarouselType) {
  canScrollNext.value = api?.canScrollNext() || false
  canScrollPrev.value = api?.canScrollPrev() || false
  selectedIndex.value = api?.selectedScrollSnap() || 0

  emits('select', selectedIndex.value)
}

function scrollPrev() {
  emblaApi.value?.scrollPrev()
}
function scrollNext() {
  emblaApi.value?.scrollNext()
}
function scrollTo(index: number) {
  emblaApi.value?.scrollTo(index)
}

function toggleAutoplay() {
  if (!autoplayApi.value || !emblaApi.value)
    return

  if (isAutoplayPlaying.value) {
    autoplayApi.value.stop()
  }
  else {
    autoplayApi.value.play()
  }
}

function onKeyDown(event: KeyboardEvent) {
  const prevKey = 'ArrowLeft'
  const nextKey = 'ArrowRight'
  const spaceKey = ' '

  if (event.key === prevKey) {
    event.preventDefault()
    scrollPrev()
    return
  }

  if (event.key === nextKey) {
    event.preventDefault()
    scrollNext()
    return
  }

  if (event.key === spaceKey && props.autoPlay && props.autoPlayControls) {
    event.preventDefault()
    toggleAutoplay()
  }
}

function onAutoplayPlay() {
  isAutoplayPlaying.value = true
}

function onAutoplayStop() {
  isAutoplayPlaying.value = false
}

onMounted(() => {
  if (!emblaApi.value) {
    return
  }
  emblaApi.value?.on('init', onInit)
  emblaApi.value?.on('init', onSelect)
  emblaApi.value?.on('reInit', onInit)
  emblaApi.value?.on('reInit', onSelect)
  emblaApi.value?.on('select', onSelect)

  // Add autoplay event listeners if autoplay is enabled
  if (props.autoPlay) {
    emblaApi.value?.on('autoplay:play', onAutoplayPlay)
    emblaApi.value?.on('autoplay:stop', onAutoplayStop)
    // Initialize autoplay state
    nextTick(() => {
      if (autoplayApi.value) {
        isAutoplayPlaying.value = autoplayApi.value.isPlaying()
      }
    })
  }
})

// Responsive slidesPerView
const { width } = useWindowSize()
const currentSlidesPerView = computed(() => {
  if (typeof props.slidesPerView === 'number')
    return props.slidesPerView

  if (typeof props.slidesPerView === 'object' && props.slidesPerView) {
    // Convert to sorted array once for better performance
    const sortedBreakpoints = Object.entries(props.slidesPerView)
      .map(([bp, val]) => [Number.parseInt(bp), val] as const)
      .sort((a, b) => b[0] - a[0]) // Sort by breakpoint size descending

    for (const [breakpoint, value] of sortedBreakpoints) {
      if (width.value > breakpoint)
        return value
    }

    // If no breakpoint matches, return the smallest breakpoint value
    return sortedBreakpoints[sortedBreakpoints.length - 1]?.[1] || 1
  }

  return 1 // fallback
})

const slideWidth = computed(() => `${100 / currentSlidesPerView.value}%`)

// Expose emblaRef and emblaApi to the parent component
// defineExpose({
//   emblaRef,
//   emblaApi,
// })
</script>

<style lang="postcss" scoped>
.UiCarousel {
  --slide-width: v-bind(slideWidth);
  --slide-spacing: v-bind(spacing);

  max-width: 100%;
  margin: auto var(--slide-spacing);
  outline: none;
}

.CarouselViewport {
  overflow: visible;
}

.CarouselContainer {
  display: flex;
  touch-action: pan-y pinch-zoom;
  margin-left: calc(var(--slide-spacing) * -1);
}

.CarouselSlide {
  transform: translate3d(0, 0, 0);
  flex: 0 0 var(--slide-width); /* Fixed slide size or flex: 0 0 auto; to adapt to the slide content */
  min-width: 0;
  max-width: 100%;
  padding-left: var(--slide-spacing); /* we need to keep this padding for the spacing to work */
}

.CarouselControls {
  display: grid;
  grid-template-columns: auto 1fr;
  justify-content: space-between;
  gap: 10px;
  margin-top: var(--app-padding);
}

.CarouselButtons {
  display: flex;
  gap: 4px;
}

.CarouselDots {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.CarouselDot {
  touch-action: manipulation;
  display: flex;
  text-decoration: none;
  cursor: pointer;
  width: 28px;
  height: 32px;
  align-items: center;
  justify-content: center;
}

.CarouselDot:after {
  content: '';
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--ui-neutral-text);
  transition: background-color 0.2s ease;
  opacity: 0.1;
}

.CarouselDot:hover:after {
  opacity: 0.2;
}

.CarouselDot.active:after {
  border-color: var(--ui-neutral-text);
  opacity: 1;
}

/* Autoplay Button Progress Ring */
:deep(.autoplay-button) {
  --progress-duration: v-bind(progressDuration);
  position: relative;
  overflow: visible;
}

.progress-ring {
  position: absolute;
  top: -1px;
  left: -1px;
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  pointer-events: none;
  transform: rotate(-90deg); /* Start from top */
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.3s ease;
}

.autoplay-button.is-playing .progress-ring-circle {
  animation: autoplay-progress var(--progress-duration) linear infinite;
}

@keyframes autoplay-progress {
  0% {
    stroke-dashoffset: 119.38; /* Full circle (2πr where r=19) */
  }
  100% {
    stroke-dashoffset: 0; /* Complete circle */
  }
}
</style>
