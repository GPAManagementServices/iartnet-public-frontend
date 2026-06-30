import { storySectionLayoutDebugKey } from '#shared/constants/storySectionDebug'
import { computed, inject } from 'vue'

export function useStorySectionLayoutDebug() {
  return inject(storySectionLayoutDebugKey, computed(() => false))
}
