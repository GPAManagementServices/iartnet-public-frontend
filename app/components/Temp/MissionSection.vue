<template>
  <section class="mission-section">
    <!-- optional hero cover from CMS /curator/media (signed via AppResponsiveImage) -->
    <ClientOnly>
      <UiCarousel
        v-slot="{ item }"
        class="gallery-carousel"
        spacing="0"
        :fade="true"
        :arrows="false"
        :dots="true"
        :auto-play="true"
        :auto-play-controls="true"
        :items="missionGallery"
        align="start"
        slides-to-scroll="auto"
        fit="cover"
        :slides-per-view="1"
      >
        <AppResponsiveImage
          v-if="item.mediaPath"
          :path="item.mediaPath"
          :alt="item.alt"
          :fallback-src="item.src"
          :widths="[640, 960, 1200]"
          fm="webp"
          fit="max"
          sizes="(max-width: 768px) 100vw, min(100vw, 1400px)"
          img-class="gallery-item"
        />
        <img
          v-else
          loading="lazy"
          :src="item.src"
          :alt="item.alt"
          class="gallery-item"
        >
      </UiCarousel>
    </ClientOnly>

    <h3 class="intro">
      Bringing together artistic research and cultural heritage at Italian higher arts and music education institutions, IartNET envisions a connected ecosystem in which data is fully accessible, interoperable, and positioned within global conversations on art, culture, and education.
    </h3>

    <!-- <UiAccordion
      class="section-content"
      :items="ourMissionItems.map(item => ({
        value: String(item.title),
        title: item.title,
        content: item.description,
      }))"
      type="multiple"
    /> -->
  </section>
</template>

<script lang="ts" setup>
import { normalizeCmsMediaPath } from '#shared/utils/cmsMedia'
import { resolveIiifServiceUrl } from '#shared/utils/iiif'
import { isAbsoluteHttpUrl } from '#shared/utils/narrativeHeroImage'

/* const ourMissionItems: { id: string, title: string, description: string }[] = [
  {
    id: '1',
    title: 'Artistic Practice',
    description: 'Lorem ipsum dolor about amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent auctor purus luctus.',
  },
  {
    id: '2',
    title: 'Research Hub',
    description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    id: '3',
    title: 'Cultural Heritage',
    description: 'Lorem ipsum dolor about amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent auctor purus luctus.',
  },
  ] */

const config = useRuntimeConfig()
const missionCoverPaths = [
  '/curator/media/scuola-artefici.webp',
  '/curator/media/b88a04f0-c24e-42f8-8b59-69061d1300d4.jpg',
  '/iiif/2/36263040-7801-48aa-9dfc-31f774dfe831.jpg/full/pct:50/0/default.jpg',
  '/curator/media/75791c37-3c69-46f8-8fd3-8a22738e0128.jpg',
] as const

function resolveMissionCoverSrc(coverPath: string): string {
  const base = String(config.public.baseUrl || '').replace(/\/$/, '')
  const iiifSrc = resolveIiifServiceUrl(coverPath, String(config.public.baseIIIFUrl || ''))
  if (iiifSrc)
    return iiifSrc
  if (isAbsoluteHttpUrl(coverPath))
    return coverPath

  const mediaPath = normalizeCmsMediaPath(coverPath)
  if (mediaPath)
    return `${base}/curator/${mediaPath}`

  return `${base}${coverPath}`
}

const missionGallery = computed(() => {
  return missionCoverPaths.map((coverPath) => {
    const mediaPath = normalizeCmsMediaPath(coverPath)
    return {
      coverPath,
      src: resolveMissionCoverSrc(coverPath),
      mediaPath,
      alt: 'Lorem ipsum dolor sit amet',
    }
  })
})
</script>

<style lang="postcss">
.mission-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 24px;

  .cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    grid-column: 3 / 5;
  }
  .gallery-carousel {
    position: relative;
    grid-column: 3 / 5;
    height: auto;
    overflow: hidden;

    .gallery-item {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: var(--ui-radius-large);
    }
  }
  .intro {
    font-size: var(--title);
    grid-column: 3 / 5;
    margin: 36px 0;
  }
  .section-content {
    grid-column: 3 / 5;
  }

  @media (max-width: 767px) {
    display: block;
  }
}
</style>
