import type { ComputedRef, InjectionKey } from 'vue'

/** Master switch: barre sezione + bordi layout in narratives-dev. */
export const STORY_SECTION_DEBUG_ENABLED = false

export const storySectionLayoutDebugKey: InjectionKey<ComputedRef<boolean>> = Symbol('storySectionLayoutDebug')
