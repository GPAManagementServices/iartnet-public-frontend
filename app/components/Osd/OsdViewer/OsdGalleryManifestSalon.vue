<template>
  <aside class="manifest manifest--salon">
    <div class="manifest__body">
      <template v-if="studenti.length">
        <article
          v-for="(studente, index) in studenti"
          :key="index"
          class="manifest__student"
        >
          <p
            v-if="formatStudentHeader(studente)"
            class="manifest__studentHeader"
          >
            <template v-if="formatNomeCognome(studente)">
              <strong>{{ formatNomeCognome(studente) }}</strong>
              <template v-if="studente.data.trim()">
                · {{ studente.data.trim() }}
              </template>
            </template>
            <template v-else>
              {{ studente.data.trim() }}
            </template>
          </p>

          <div class="manifest__fields">
            <template
              v-for="field in fieldsForStudente(studente)"
              :key="field.key"
            >
              <div class="manifest__label">
                {{ $t(field.labelKey) }}
              </div>
              <div class="manifest__value">
                {{ field.value }}
              </div>
            </template>
          </div>
        </article>
      </template>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SALON_Studente } from '~/utils/SalonArray'

const props = defineProps<{
  studenti: SALON_Studente[]
}>()

defineEmits(['close'])

interface StudentField {
  key: string
  labelKey: string
  value: string
}

function formatNomeCognome(studente: SALON_Studente): string {
  return [studente.nome, studente.cognome].filter(v => v.trim().length > 0).join(' ')
}

function formatStudentHeader(studente: SALON_Studente): string {
  const parts = [formatNomeCognome(studente), studente.data.trim()].filter(v => v.length > 0)
  return parts.join(' · ')
}

function fieldsForStudente(studente: SALON_Studente): StudentField[] {
  const fields: Array<{ key: string, labelKey: string, getValue: () => string }> = [
    { key: 'scuola', labelKey: 'OSD-ScuolaData', getValue: () => studente.scuola },
    { key: 'tipoOggetto', labelKey: 'OSD-StTipoOggetto', getValue: () => studente.tipoOggetto },
    { key: 'titolo', labelKey: 'OSD-Titolo', getValue: () => studente.titolo },
    { key: 'professore', labelKey: 'OSD-StProfessore', getValue: () => studente.professore },
    { key: 'tecnica', labelKey: 'OSD-StTecnica', getValue: () => studente.tecnica },
    { key: 'dimensione', labelKey: 'OSD-StDimensione', getValue: () => studente.dimensione },
  ]

  return fields
    .map(field => ({ key: field.key, labelKey: field.labelKey, value: field.getValue().trim() }))
    .filter(field => field.value.length > 0)
}

const studenti = computed(() => props.studenti ?? [])
</script>

<style lang="postcss" scoped>
.manifest {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  overflow-y: auto;
  background-color: white;
  border-left: 1px solid var(--color-border, #e0e0e0);
}

.manifest__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.manifest__student {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
}

.manifest__student:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.manifest__studentHeader {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 400;
  line-height: 140%;
  color: rgba(0, 0, 0, 1);
}

.manifest__studentHeader strong {
  font-weight: 700;
}

.manifest__fields {
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 12px;
  row-gap: 2px;
  align-items: baseline;
  padding-right: 12px;
}

.manifest__label {
  font-weight: 700;
  font-size: 11px;
  line-height: 140%;
  text-transform: uppercase;
  color: rgba(143, 143, 143, 1);
  white-space: nowrap;
  text-align: left;
}

.manifest__value {
  font-weight: 400;
  font-size: 14px;
  line-height: 140%;
  color: rgba(0, 0, 0, 1);
  word-break: break-word;
  text-align: left;
}
</style>
