<template>
  <div
    ref="containerRef"
    class="story-section-video-player"
    :class="{ 'story-section-video-player--fill': fill }"
  >
    <ClientOnly>
      <component
        :is="VimeoPlayer"
        v-if="vimeoEmbed"
        class="story-section-video-player__embed"
        :video-id="'videoId' in vimeoEmbed ? vimeoEmbed.videoId : ''"
        :video-url="'videoUrl' in vimeoEmbed ? vimeoEmbed.videoUrl : ''"
        :player-width="playerW"
        :player-height="playerH"
        :controls="true"
        :options="playerOptions"
      />
      <template #fallback>
        <div
          v-if="vimeoEmbed"
          class="story-section-video-player__placeholder"
          aria-hidden="true"
        />
      </template>
    </ClientOnly>
    <iframe
      v-if="youtubeEmbedUrl"
      class="story-section-video-player__embed story-section-video-player__iframe"
      :src="youtubeEmbedUrl"
      :title="title"
      :width="playerW"
      :height="playerH"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    />
    <video
      v-else-if="!youtubeEmbedUrl && !vimeoEmbed && sourceUrl"
      class="story-section-video-player__native"
      :src="sourceUrl"
      controls
      playsinline
      preload="metadata"
    />
  </div>
</template>

<script setup lang="ts">
import type { VimeoEmbedSource } from '~/utils/vimeoUtils'
import { useElementSize } from '@vueuse/core'
import { defineAsyncComponent } from 'vue'

const props = withDefaults(
  defineProps<{
    sourceUrl?: string | null
    vimeoEmbed?: VimeoEmbedSource | null
    youtubeEmbedUrl?: string | null
    title?: string
    fill?: boolean
  }>(),
  {
    sourceUrl: null,
    vimeoEmbed: null,
    youtubeEmbedUrl: null,
    title: 'Video',
    fill: false,
  },
)

const VimeoPlayer = defineAsyncComponent(async () => {
  const mod = await import('vue-vimeo-player')
  return mod.vueVimeoPlayer
})

const containerRef = ref<HTMLElement | null>(null)
defineExpose({ containerRef })

const { width, height } = useElementSize(containerRef, undefined, { box: 'content-box' })

const playerW = computed(() => {
  const w = Math.floor(width.value)
  return w > 0 ? Math.max(320, w) : 640
})

const playerH = computed(() => {
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

<style scoped>
.story-section-video-player {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  position: relative;
}

.story-section-video-player:not(.story-section-video-player--fill) {
  aspect-ratio: 16 / 9;
}

.story-section-video-player--fill {
  width: 100%;
  height: 100%;
  min-height: 0;
  aspect-ratio: unset;
}

.story-section-video-player__embed,
.story-section-video-player__native {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: 100%;
}

.story-section-video-player--fill .story-section-video-player__embed,
.story-section-video-player--fill .story-section-video-player__native,
.story-section-video-player--fill .story-section-video-player__iframe {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.story-section-video-player--fill .story-section-video-player__native {
  object-fit: cover;
  object-position: center;
}

.story-section-video-player__iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.story-section-video-player:not(.story-section-video-player--fill) .story-section-video-player__iframe {
  aspect-ratio: 16 / 9;
  height: auto;
}

.story-section-video-player__placeholder {
  width: 100%;
  height: 100%;
  min-height: 180px;
  background-color: rgba(0, 0, 0, 0.08);
}

.story-section-video-player__embed :deep(iframe) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
