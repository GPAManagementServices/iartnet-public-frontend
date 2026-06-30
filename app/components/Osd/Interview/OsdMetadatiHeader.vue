<template>
  <div class="osdMetadatiHeader">
    <OsdMetaField
      :label="$t('OSD-Datazione')"
      :value="props.data.date"
      use-stacked
      hide-if-empty
      :do-not-show-if-empty="false"
    />
    <OsdMetaField
      :label="$t('OSD-Type')"
      :value="props.data.type"
      use-stacked
      :do-not-show-if-empty="false"
    />

  </div>
</template>

<script setup lang="ts">
import type { INTERVIEW_HeaderDataTarget } from '~/utils/HeaderData'
import OsdMetaField from '../OsdMetaField/OsdMetaField.vue'

interface OsdMetadatiHeaderProps {
  data: INTERVIEW_HeaderDataTarget
}

const props = defineProps<OsdMetadatiHeaderProps>()
</script>

<style lang="postcss" scoped>
.osdMetadatiHeader {
  width: calc(100% - 500px);
  gap: 12px;
  margin-left: auto;
  margin-right: 50px;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 1024px) {
  .osdMetadatiHeader {
    width: 100%;
    margin-left: 50px;
    margin-right: 50px;
  }
}

@media (max-width: 768px) {
  .osdMetadatiHeader {
    grid-template-columns: 1fr;
    margin-left: 1rem;
    margin-right: 1rem;
  }
}
</style>
