<template>
  <div
    ref="containerRef"
    class="json-vimeo-stage"
    :class="{ 'json-vimeo-stage--search': variant === 'search' }"
  >
    <div class="json-vimeo-stage__inner">
      <VimeoPlayer
        v-if="embed && playerMountable"
        class="json-vimeo-stage__player"
        :video-id="'videoId' in embed ? embed.videoId : ''"
        :video-url="'videoUrl' in embed ? embed.videoUrl : ''"
        :player-width="playerW"
        :player-height="playerH"
        :controls="true"
        :options="playerOptions"
      />
      <iframe
        v-else-if="youtubeEmbedUrl"
        class="json-vimeo-stage__player json-vimeo-stage__iframe"
        :src="youtubeEmbedUrl"
        title="Video"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VimeoEmbedSource } from '~/utils/vimeoUtils'
import { useElementSize } from '@vueuse/core'
import { vueVimeoPlayer as VimeoPlayer } from 'vue-vimeo-player'

const props = withDefaults(
  defineProps<{
    embed?: VimeoEmbedSource | null
    youtubeEmbedUrl?: string | null
    /** `search`: anteprima lista (altezza fissa). `card`: scheda dettaglio. */
    variant?: 'card' | 'search'
  }>(),
  {
    embed: null,
    youtubeEmbedUrl: null,
    variant: 'card',
  },
)

const containerRef = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(containerRef, undefined, { box: 'content-box' })

const playerMountable = computed(() => {
  if (props.variant === 'search')
    return true
  return width.value > 0
})

const playerW = computed(() => {
  if (props.variant === 'search')
    return Math.max(280, Math.floor(width.value) || 300)
  const w = Math.floor(width.value)
  return w > 0 ? Math.max(320, w) : 640
})
const playerH = computed(() => {
  if (props.variant === 'search')
    return 260
  const h = Math.floor(height.value)
  if (h > 0)
    return Math.max(180, h)
  const w = Math.floor(width.value)
  return w > 0 ? Math.max(180, Math.round((w * 9) / 16)) : 360
})

const playerOptions = {
  responsive: true,
  dnt: true,
} as Record<string, unknown>
</script>

<style lang="postcss" scoped>
/*
 * Scheda card: niente guscio grigio tipo osdViewer (bordo/bg/overflow:hidden),
 * così il player Vimeo resta responsivo e i controlli non vengono tagliati.
 * Area ~ come prima: larghezza contenuto, altezza max ~80vh con proporzione 16:9.
 */
.json-vimeo-stage:not(.json-vimeo-stage--search) {
  position: relative;
  margin: 0 auto;
  width: min(calc(100% - 100px), calc(80vh * 16 / 9));
  max-width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 80vh;
  box-sizing: border-box;
}

.json-vimeo-stage__inner {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

.json-vimeo-stage__player {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: 0;
}

.json-vimeo-stage__player :deep(iframe),
.json-vimeo-stage__iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

@media (max-width: 768px) {
  .json-vimeo-stage:not(.json-vimeo-stage--search) {
    width: min(100%, calc(80vh * 16 / 9));
    margin-inline: 0;
    max-height: 80vh;
    padding-inline: env(safe-area-inset-left, 0px) env(safe-area-inset-right, 0px);
  }
}

.json-vimeo-stage--search {
  width: 100%;
  height: 100%;
  margin: 0;
  aspect-ratio: unset;
  max-height: none;
  border-radius: 8px;
}

.json-vimeo-stage--search .json-vimeo-stage__inner {
  padding: 8px;
}
</style>
