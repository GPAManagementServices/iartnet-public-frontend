<template>
  <div v-if="showAboutBlock" class="osdAbout">
    <div class="field">
      <span class="label">{{ $t('OSD-Biografia') }}</span>
      <OsdMetaField
        :label="$t('OSD-Biografia')"
        :value="props.data.about"
        campo-aggiuntivo  
        do-not-show-label
        :do-not-show-if-empty="doNotShowAboutIfEmpty"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { INTERVIEW_AboutTheWorkDataTarget } from '~/utils/AboutTheWorkData'
import { GetDataUtils } from '@/utils/GetDataUtils'
import OsdMetaField from '../OsdMetaField/OsdMetaField.vue'

interface OsdAboutProps {
  data: INTERVIEW_AboutTheWorkDataTarget
}
const props = defineProps<OsdAboutProps>()

/** Stessa regola di visibilità di OsdMetaField (`doNotShowIfEmpty` + valore vuoto / NO_DATA). */
const doNotShowAboutIfEmpty = true

const showAboutBlock = computed(() => {
  if (!doNotShowAboutIfEmpty)
    return true
  const v = props.data.about
  const empty = !v?.trim() || v.toUpperCase() === GetDataUtils.NO_DATA.toUpperCase()
  return !empty
})
</script>

<style lang="postcss" scoped>
.osdAbout {
  width: calc(100% - 100px);
  margin-left: 50px;
  margin-right: 50px;

  .field {
    width: 100%;
    display: flex;

    .label {
      font-weight: 600;
      font-style: SemiBold;
      font-size: 32px;
      line-height: 100%;
      letter-spacing: 0%;
      color: var (--ui-neutral-border);
    }

    .field {
      width: calc(100% - 300px) !important;
      margin-left: auto;
      white-space: pre-wrap;
      font-weight: 400;
      font-style: normal;
      font-size: 32px;
      line-height: 140%;
      letter-spacing: 0%;
      color: #000;
    }
  }
}

@media (max-width: 768px) {
  .osdAbout {
    width: 100%;
    margin-left: 10px;
    margin-right: 0;
    padding: 0 1rem;
  }
  .osdAbout .field {
    flex-direction: column;
  }
  .osdAbout .field .label {
    font-size: 24px;
  }
  .osdAbout .field .field {
    width: 100% !important;
  }
  .osdAbout :deep(.field) {
    --osd-meta-value-fs: 18px;
  }
}
</style>