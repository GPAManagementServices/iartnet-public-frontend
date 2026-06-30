<template>
  <aside class="gallery">
    <div class="gallery__track">
      <button
        v-for="(thumbUrl, index) in thumbUrls"
        :key="index"
        type="button"
        class="gallery__thumb"
        :class="{ 'gallery__thumb--active': index === selectedIndex }"
        :aria-label="$t('OSD-GalleryThumbAria', { n: index + 1 })"
        @click="$emit('selectPage', index)"
      >
        <img :src="thumbUrl" :alt="$t('OSD-GalleryThumbAlt', { n: index + 1 })">
      </button>
    </div>
  </aside>
</template>

<script setup>
import hideGalleryIcon from '@/assets/icons/osd-hide-gallery.svg'

defineProps({
  thumbUrls: { type: Array, default: () => [] },
  selectedIndex: { type: Number, default: 0 },
})

defineEmits(['selectPage', 'close'])
</script>

<style lang="postcss" scoped>
.gallery {
  flex-shrink: 0;
  width: 240px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  min-height: 0;
  background-color: white;
  border-left: 1px solid var(--color-border, #e0e0e0);
}

.gallery__track {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.gallery__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
}

.gallery__title {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  height: 58px;
  padding-top: 13px;
}

.gallery__closeBtn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--ui-radius, 4px);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery__closeBtn:hover {
  background: rgba(0 0 0 / 0.06);
}

.gallery__closeBtn img {
  width: 18px;
  height: 18px;
  display: block;
}

.gallery__thumb {
  flex-shrink: 0;
  width: 216px;
  height: 153px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--ui-radius, 8px);
  border: 1px solid rgba(216, 216, 216, 1);
  background: transparent;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  background-color: var(--black-a2);
}

.gallery__thumb img {
  width: 111px !important;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  margin: auto;
}

.gallery__thumb:hover {
  border-color: var(--gray-5, #474747);
  box-shadow: 0 0 0 1px var(--gray-5, #474747);
}

.gallery__thumb--active {
  border-color: var(--gray-12, #333);
  box-shadow: 0 0 0 1px var(--gray-12, #333);
}

@media (max-width: 768px) {
  .gallery {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-height: 50px;
    min-height: 0;
    padding: 2px 4px;
    overflow-x: auto;
    overflow-y: hidden;
    border: none;
    -webkit-overflow-scrolling: touch;
    background: transparent;
    background-color: transparent;
  }

  .gallery__track {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: max-content;
    min-height: 0;
    max-height: 50px;
  }

  .gallery__header {
    position: absolute;
    left: 0;
    top: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    padding: 0;
    border: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }

  .gallery__title {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .gallery__closeBtn {
    display: none;
  }

  .gallery__thumb {
    width: auto;
    min-width: 40px;
    max-width: 56px;
    height: 32px;
    border-radius: var(--ui-radius, 4px);
    background: transparent;
    background-color: transparent;
  }

  .gallery__thumb img {
    width: 100% !important;
    min-width: 0;
    max-height: 100%;
  }
}
</style>
