<template>
  <img
    v-if="resolvedImageSrc"
    :src="resolvedImageSrc"
    :alt="alt"
    class="catalogo-opere-citate-item-image"
  >
</template>

<script setup lang="ts">
import { IiifImageSize, iiifImageUrl } from '#shared/utils/iiif'
import { isAbsoluteHttpUrl } from '#shared/utils/narrativeHeroImage'

const props = defineProps<{
  image?: string | null
  alt?: string
  cacheKey: string
}>()

const rawImage = computed(() => {
  if (typeof props.image !== 'string')
    return ''

  return props.image.trim()
})

const syncImageSrc = computed(() => {
  const image = rawImage.value
  if (!image)
    return ''
  if (isAbsoluteHttpUrl(image))
    return image
  if (image.includes('/'))
    return iiifImageUrl(image, IiifImageSize.OpereCitate)
  return ''
})

const cardId = computed(() => {
  if (!rawImage.value || syncImageSrc.value)
    return null
  return rawImage.value
})

const { resolvedImageUrl } = useResolvedNarrativeCardImage(
  cardId,
  computed(() => `${props.cacheKey}-${cardId.value ?? 'empty'}`),
  IiifImageSize.OpereCitate,
)

const resolvedImageSrc = computed(() => syncImageSrc.value || resolvedImageUrl.value || '')
</script>

<style scoped>
/* —— Mobile —— */
@media (max-width: 767px) {
  .catalogo-opere-citate-item-image {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    margin-inline: auto;
    object-fit: contain;
    object-position: center;
  }
}

/* —— Desktop —— */
@media (min-width: 768px) {
  .catalogo-opere-citate-item-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
