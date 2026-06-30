<template>
  <aside class="manifest">
    <div class="manifest__body">
      <div v-for="(value, key) in manifestData" :key="key" class="manifest__item">
        <div class="manifest__label">
          {{ translateManifestLabel(String(key)) }}
        </div>
        <div class="manifest__value">
          {{ value }}
        </div>
      </div>
      <div v-if="notesTrimmed" class="manifest__notes">
        <div class="manifest__label">
          {{ translateManifestLabel('Note') }}
        </div>
        <div class="manifest__notesBody">
          <p class="manifest__notesText" v-html="notesHtml" />
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import hideManifestIcon from '@/assets/icons/osd-hide-metadata.svg'

const props = defineProps({
  manifestData: { type: Object, required: true },
  /** HTML della nota per la pagina galleria corrente (stesso contenuto dell’ex OsdGalleryNotes). */
  notesHtml: { type: String, default: '' },
})
defineEmits(['close'])
const OSD_PREFIX_RE = /^OSD-/i
const MANIFEST_KEY_SPLIT_RE = /[-_\s]+/

const { t } = useI18n()

/**
 * Converte la chiave grezza in PascalCase (segmenti da `-`, `_`, spazio) e traduce `OSD-{Pascal}`.
 * Esempi: `autore` → `OSD-Autore`, `tecnica_e_supporto` → `OSD-TecnicaESupporto`.
 */
function manifestKeyToPascalCase(raw: string): string {
  const trimmed = raw.trim().replace(OSD_PREFIX_RE, '')
  return trimmed
    .split(MANIFEST_KEY_SPLIT_RE)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
}

function translateManifestLabel(key: string): string {
  return t(`OSD-${manifestKeyToPascalCase(key)}`)
}

const notesTrimmed = computed(() => typeof props.notesHtml === 'string' && props.notesHtml.trim().length > 0)
</script>

<style lang="postcss" scoped>
.manifest {
  flex-shrink: 0;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  overflow-y: auto;
  background-color: white;
  border-left: 1px solid var(--color-border, #e0e0e0);
}

.manifest__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
}

.manifest__title {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  height: 58px;
  padding-top: 13px;
}

.manifest__closeBtn {
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

.manifest__closeBtn:hover {
  background: rgba(0 0 0 / 0.06);
}

.manifest__closeBtn img {
  width: 18px;
  height: 18px;
  display: block;
}

.manifest__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.manifest__item {
  display: flex;
  flex-direction: column;

  border-bottom: 1px solid var(--color-border, #e0e0e0);
  gap: 8px;

  padding-top: 8px;
  padding-right: 12px;
  padding-bottom: 16px;
}
.manifest__label {
  font-weight: 700;
  font-style: Bold;
  font-size: 12px;
  line-height: 100%;
  letter-spacing: 0%;
  text-transform: uppercase;
  color: rgba(143, 143, 143, 1);
}

.manifest__value {
  font-weight: 400;
  font-style: normal;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: 0%;
  color: rgba(0, 0, 0, 1);
}

.manifest__value:last-child {
  margin-bottom: 0;
}

.manifest__notes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
  padding-top: 8px;
  padding-right: 12px;
  padding-bottom: 16px;
}

.manifest__notesText {
  margin: 0;
  font-weight: 400;
  font-size: 14px;
  line-height: 140%;
  color: rgba(0, 0, 0, 1);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
