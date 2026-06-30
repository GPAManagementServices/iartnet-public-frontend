<template>
  <div
    class="story-header-root"
    :class="layoutClass"
    :style="backgroundStyle"
  >
    <div
      v-if="showHeroImage"
      class="story-header-hero-image-wrap"
    >
      <img
        class="story-header-hero-image"
        :src="backgroundImageUrl!"
        alt=""
      >
    </div>
    <div
      class="story-header-overlay"
      :class="{ 'story-header-overlay--split': isSplitLayout }"
    >
      <div
        class="story-header-headings"
        :class="{ 'story-header-headings--themed': !!fontColor }"
        :style="headingsStyle"
      >
        <div v-if="Chip" class="story-header-chip-wrap">
          <span class="story-header-chip">{{ Chip }}</span>
        </div>
        <h1
          v-if="Title"
          class="story-header-title"
          v-html="Title"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TStoryHeaderType } from '#shared/types/api'
import { computed } from 'vue'

const props = defineProps<TStoryHeaderType>()

const TEXT_LEFT_LAYOUTS: TStoryHeaderType['Layout'][] = [
  'ImageBackground Text Left',
  'ImageRight',
  'None',
]

const backgroundImageUrl = computed(() => {
  const url = props.Image?.URL?.trim()
  return url || null
})

const isBackgroundLayout = computed(() =>
  props.Layout === 'ImageBackground Text Left'
  || props.Layout === 'ImageBackground Text Right',
)

const isSplitLayout = computed(() =>
  props.Layout === 'ImageLeft' || props.Layout === 'ImageRight',
)

const showHeroImage = computed(() =>
  !!backgroundImageUrl.value && (isSplitLayout.value || isBackgroundLayout.value),
)

const isTextLeft = computed(() => TEXT_LEFT_LAYOUTS.includes(props.Layout))

const layoutClass = computed(() => {
  const classes = [
    isTextLeft.value ? 'story-header--text-left' : 'story-header--text-right',
  ]

  if (isBackgroundLayout.value)
    classes.push('story-header--media-background')
  else if (props.Layout === 'ImageLeft')
    classes.push('story-header--media-split-left')
  else if (props.Layout === 'ImageRight')
    classes.push('story-header--media-split-right')
  else if (props.Layout === 'None')
    classes.push('story-header--media-none')

  if (isSplitLayout.value || props.Layout === 'None')
    classes.push('story-header--on-light')

  return classes
})

const backgroundStyle = computed(() => {
  if (!isBackgroundLayout.value || !backgroundImageUrl.value)
    return undefined
  return { backgroundImage: `url(${backgroundImageUrl.value})` }
})

const fontColor = computed(() => props.FontColor?.trim() || null)

const headingsStyle = computed(() => {
  if (!fontColor.value)
    return undefined
  return { '--story-header-font': fontColor.value }
})
</script>

<style lang="postcss" scoped>
.story-header-root {
  --sh-text: #fff;
  --sh-chip-border: #000;
  --sh-gutter: clamp(1.5rem, 5vw, 4rem);
  --sh-offset-x: 48px;
  --sh-bottom: max(50px, env(safe-area-inset-bottom, 0px));
  --sh-viewport: 100dvh;

  position: relative;
  min-height: var(--sh-viewport);
  width: 100%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.story-header-overlay {
  display: block;
  background: transparent;
}

.story-header-headings {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  width: 100%;
  max-width: min(50%, 42rem);
}

.story-header-chip-wrap {
  padding: 8px;
}

.story-header-chip {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  width: fit-content;
  max-width: 100%;
  min-height: 28px;
  padding: 4px 16px;
  border: 1px solid var(--story-header-font, var(--sh-chip-border));
  border-radius: 16px;
  color: var(--story-header-font, var(--sh-text));
  font-weight: 400;
  font-style: normal;
  font-size: 18px;
  line-height: 120%;
  letter-spacing: 0;
  text-transform: uppercase;
}

.story-header-title {
  width: 100%;
  margin: 0;
  color: var(--story-header-font, var(--sh-text));
  font-weight: 700;
  font-style: normal;
  font-size: 48px;
  line-height: 110%;
  letter-spacing: 0.25%;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

.story-header-headings--themed .story-header-title {
  text-shadow: none;
}

.story-header-hero-image {
  display: block;
  width: 100%;
  object-fit: cover;
  object-position: left center;
}

/* —— Mobile: chip → titolo → immagine —— */
@media (max-width: 767px) {
  .story-header-root {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    min-height: auto;
    padding: clamp(5.5rem, 24vh, 9rem) 8px 0;
    background-image: none !important;
  }

  .story-header--media-background .story-header-hero-image-wrap {
    display: block;
  }

  .story-header-overlay,
  .story-header-overlay--split {
    position: relative;
    order: 1;
    z-index: 2;
    flex: 0 0 auto;
    width: 100%;
    min-height: 0;
    padding: 0;
    background: transparent;
  }

  .story-header-headings {
    --sh-text: #000;
    --sh-chip-border: #000;
    --story-header-font: #000;

    position: static;
    left: auto;
    right: auto;
    bottom: auto;
    width: 100%;
    max-width: 100%;
    gap: 16px;
    padding: 0;
  }

  .story-header-chip-wrap {
    width: 100%;
    margin-top: 0;
    padding: 8px;
    box-sizing: border-box;
  }

  .story-header-chip {
    min-height: 28px;
    height: auto;
    padding: 4px 16px;
    font-weight: 400;
    font-style: normal;
    font-size: 13px;
    line-height: 19.6px;
    letter-spacing: 0.45px;
    text-transform: uppercase;
    color: #000;
    border-color: #000;
  }

  .story-header-title {
    box-sizing: border-box;
    width: calc(100% - 16px);
    max-width: calc(100% - 16px);
    margin-inline: 8px;
    padding: 0;
    font-weight: 700;
    font-style: normal;
    font-size: 32px;
    line-height: 110%;
    letter-spacing: 0.25%;
    color: #000;
    text-shadow: none;
  }

  .story-header-headings--themed .story-header-title {
    color: #000;
  }

  .story-header-headings--themed .story-header-chip {
    color: #000;
    border-color: #000;
  }

  .story-header-hero-image-wrap {
    order: 2;
    z-index: 1;
    flex: 0 0 auto;
    margin-inline: -8px;
    width: calc(100% + 16px);
    padding: 0 8px 8px;
    box-sizing: border-box;
  }

  .story-header-hero-image {
    display: block;
    width: 100%;
    max-width: 100%;
    height: clamp(220px, 52vw, 400px);
    min-height: 0;
    border-radius: 8px;
    object-fit: cover;
    object-position: left center;
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
  .story-header-root {
    height: var(--sh-viewport);
    max-height: var(--sh-viewport);
    min-height: var(--sh-viewport);
    overflow: hidden;
  }

  .story-header-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    box-sizing: border-box;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    padding: 2rem 2rem var(--sh-bottom);
    background: rgba(0, 0, 0, 0.25);
    overflow: visible;
  }

  .story-header--media-background.story-header--text-right .story-header-overlay {
    justify-content: flex-end;
  }

  .story-header-overlay--split,
  .story-header--media-none .story-header-overlay {
    position: relative;
    inset: unset;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 100%;
    min-height: 0;
    max-height: 100%;
    padding: 0 0 var(--sh-bottom);
    background: transparent;
    overflow: visible;
  }

  .story-header--media-background .story-header-hero-image-wrap {
    display: none;
  }

  .story-header-hero-image-wrap {
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .story-header-hero-image {
    width: 100%;
    height: 100%;
    min-height: 0;
    max-height: 100%;
    object-fit: cover;
    object-position: left center;
  }

  .story-header--text-left .story-header-headings,
  .story-header--text-right .story-header-headings {
    position: relative;
    flex-shrink: 0;
    margin: 0;
    box-sizing: border-box;
    text-align: left;
    max-width: none;
  }

  .story-header--media-background.story-header--text-left .story-header-headings {
    margin-left: calc(var(--sh-offset-x) - 2rem);
    width: calc(50% - var(--sh-offset-x));
    max-width: calc(50% - var(--sh-offset-x));
    padding-right: var(--sh-gutter);
  }

  .story-header--media-background.story-header--text-right .story-header-headings {
    margin-right: calc(var(--sh-offset-x) - 2rem);
    width: 50%;
    max-width: 50%;
    padding-right: var(--sh-gutter);
  }

  .story-header--media-split-left.story-header--text-right .story-header-headings {
    width: 100%;
    max-width: 100%;
    padding: 0 var(--sh-gutter) 0 var(--sh-offset-x);
  }

  .story-header--media-split-right.story-header--text-left .story-header-headings,
  .story-header--media-none.story-header--text-left .story-header-headings {
    margin-left: var(--sh-offset-x);
    width: calc(100% - var(--sh-offset-x));
    max-width: calc(100% - var(--sh-offset-x));
    padding-right: var(--sh-gutter);
  }

  .story-header--media-split-left,
  .story-header--media-split-right,
  .story-header--media-none {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    height: var(--sh-viewport);
    max-height: var(--sh-viewport);
    min-height: var(--sh-viewport);
  }

  .story-header--media-split-left .story-header-hero-image-wrap,
  .story-header--media-split-right .story-header-hero-image-wrap {
    min-height: 0;
  }

  .story-header--media-split-left .story-header-hero-image-wrap {
    grid-area: 1 / 1;
  }

  .story-header--media-split-left .story-header-overlay {
    grid-area: 1 / 2;
    min-height: 0;
  }

  .story-header--media-split-right .story-header-hero-image-wrap {
    grid-area: 1 / 2;
  }

  .story-header--media-split-right .story-header-overlay,
  .story-header--media-none .story-header-overlay {
    grid-area: 1 / 1;
    min-height: 0;
  }

  .story-header--on-light .story-header-headings:not(.story-header-headings--themed) {
    --sh-text: #1a1a1a;
    --sh-chip-border: #1a1a1a;
  }

  .story-header--on-light .story-header-headings:not(.story-header-headings--themed) .story-header-title {
    text-shadow: none;
  }
}
</style>
