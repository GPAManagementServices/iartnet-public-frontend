<template>
  <Primitive :as class="MarqueeWrapper" :class="{ 'feather-edges': featherEdges }">
    <div
      v-for="i in repeat"
      :key="i"
      class="Marquee"
      :class="{ reverse }"
    >
      <slot />
    </div>
  </Primitive>
</template>

<script lang="ts">
export interface MarqueeProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  /**
   * Reverse the direction of the marquee.
   * @defaultValue false
   */
  reverse?: boolean
  /**
   * The number of times the marquee should repeat.
   * @defaultValue 4
   */
  repeat?: number

  /**
   * Apply fade effect to the edges of the marquee
   * @defaultValue false
   */
  featherEdges?: boolean
}

export interface MarqueeSlots {
  default: (props?: object) => any
}
</script>

<script setup lang="ts">
withDefaults(defineProps<MarqueeProps>(), {
  repeat: 4,
})
defineSlots<MarqueeSlots>()
</script>

<style lang="postcss">
.MarqueeWrapper {
  --gap: 32px;
  --duration: 20s;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--gap);
  overflow: hidden;
}

.Marquee {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  gap: var(--gap);
  width: 100%;
  min-width: max-content;
  backface-visibility: hidden;
  animation: marquee var(--duration) linear infinite;
  &:dir(rtl) {
    animation: marquee-rtl var(--duration) linear infinite;
  }

  &.reverse {
    animation-direction: reverse !important;
  }
}

.feather-edges {
  mask:
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 5%,
      rgba(255, 255, 255, 1) 10%,
      rgba(255, 255, 255, 1) 90%,
      rgba(255, 255, 255, 0) 95%
    ),
    alpha;
}

@keyframes marquee {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(calc(-100% - var(--gap)), 0, 0);
  }
}
@keyframes marquee-rtl {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(calc(100% + var(--gap)), 0, 0);
  }
}
</style>
