<template>
  <div class="osdNavigator">
    <div class="osdNavigator__sideButtons">
      <div id="osdMetadata">
        <button
          id="osdShowMetadata"
          type="button"
          class="osdInfo__btn"
          :aria-label="metadataVisible ? $t('OSD-HideMetadata') : $t('OSD-ShowMetadata')"
          @click="$emit('toggleMetadata')"
        >
          {{ metadataVisible ? $t('OSD-MetadataToggleHide') : $t('OSD-MetadataToggleShow') }}
        </button>
      </div>
    </div>
    <div v-if="hasMultiplePages" class="osdNavigator__counter" aria-live="polite">
      <button
        type="button"
        class="osdNavigator__counterBtn"
        :disabled="selectedPageIndex <= 0"
        :aria-label="$t('OSD-PreviousImage')"
        @click="$emit('goToPage', selectedPageIndex - 1)"
      >
        <img :src="precImg" alt="">
      </button>
      <span class="osdNavigator__counterText">{{ selectedPageIndex + 1 }} / {{ totalPages }}</span>
      <button
        type="button"
        class="osdNavigator__counterBtn"
        :disabled="selectedPageIndex >= totalPages - 1"
        :aria-label="$t('OSD-NextImage')"
        @click="$emit('goToPage', selectedPageIndex + 1)"
      >
        <img :src="nextImg" alt="">
      </button>
    </div>
    <div class="osdNavigator__navButtons">
      <div id="osdZoomOut" class="osdNavigator__btn">
        <img :src="zoomOut" :alt="$t('OSD-ZoomOutAlt')">
      </div>
      <div id="osdZoomIn" class="osdNavigator__btn">
        <img :src="zoomIn" :alt="$t('OSD-ZoomInAlt')">
      </div>
      <div id="osdFulls" class="osdNavigator__btn">
        <img :src="zoomFullscreen" :alt="$t('OSD-FullscreenAlt')">
      </div>
      <button
        v-if="hasMultiplePages"
        id="osdShowGallery"
        type="button"
        class="osdGallery__btn"
        :aria-label="galleryVisible ? $t('OSD-HideGallery') : $t('OSD-ShowGallery')"
        @click="$emit('toggleGallery')"
      >
        {{ galleryVisible ? $t('OSD-GalleryToggleHide') : $t('OSD-GalleryToggleShow') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import nextImg from '@/assets/icons/osd-next-img.svg'
import precImg from '@/assets/icons/osd-prec-img.svg'
import zoomFullscreen from '@/assets/icons/osd-zoom-fullscreen.svg'
import zoomIn from '@/assets/icons/osd-zoom-in.svg'
import zoomOut from '@/assets/icons/osd-zoom-out.svg'

defineProps({
  hasMultiplePages: { type: Boolean, default: false },
  selectedPageIndex: { type: Number, default: 0 },
  totalPages: { type: Number, default: 0 },
  metadataVisible: { type: Boolean, default: false },
  galleryVisible: { type: Boolean, default: true },
})

defineEmits(['toggleMetadata', 'toggleGallery', 'goToPage'])
</script>

<style lang="postcss" scoped>
.osdNavigator {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  width: 100%;
  height: 50px;
  background-color: var(--gray-2);
  border-bottom-left-radius: var(--ui-radius-large);
  border-bottom-right-radius: var(--ui-radius-large);
}

.osdNavigator__sideButtons {
  grid-column: 1;
  margin-left: 10px;
  display: flex;
  align-items: center;
  height: 40px;
  border-radius: var(--ui-radius-large);
  gap: 8px;
  opacity: 1;
  top: 5px;
  padding: 4px 8px;
}

#osdMetadata {
  display: flex;
}

.osdNavigator__counter {
  grid-column: 2;
  justify-self: end;
  margin-right: 8px;
  box-sizing: border-box;
  width: auto;
  min-width: 120px;
  max-width: 100%;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 8px;
  color: var(--gray-12);
  background-color: var(--white-a11);
  border-radius: var(--ui-radius, 4px);
}

.osdNavigator__counterBtn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: var(--ui-radius, 4px);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.osdNavigator__counterBtn:hover:not(:disabled) {
  background: rgba(255 255 255 / 0.15);
}

.osdNavigator__counterBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.osdNavigator__counterBtn img {
  width: 16px;
  height: 16px;
  display: block;
}

.osdNavigator__counterText {
  flex: 1 1 0;
  min-width: 0;
  font-size: var(--ui-text-small, 0.875rem);
  font-weight: var(--medium, 500);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.osdNavigator__navButtons {
  margin-left: auto;
  display: flex;
  height: 40px;
  border-radius: var(--ui-radius-large);
  gap: 8px;
  opacity: 1;
  top: 5px;
  padding: 4px 8px;
}

.osdNavigator__btn {
  width: 34px;
  height: 34px;
  border-radius: var(--ui-radius);
  padding: 8px;
  gap: 10px;
  opacity: 1;
  background-color: var(--white-a11);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.osdNavigator__btn img {
  width: 18px;
  height: 18px;
}

.osdInfo__btn {
  width: 80px;
  height: 34px;
  border-radius: var(--ui-radius);
  padding: 8px;
  gap: 10px;
  opacity: 1;
  color:white;
  background: #e95298;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.osdGallery__btn {
  width: 100px;
  height: 34px;
  border-radius: var(--ui-radius);
  padding: 8px;
  gap: 10px;
  opacity: 1;
  color:white;
  background: #e95298;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .osdNavigator__counter {
    display: none;
  }
}
</style>
