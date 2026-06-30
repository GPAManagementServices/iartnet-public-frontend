/**
 * Sezioni People (chiavi ruolo in inglese, allineate a `APP_ROLE_TITLE_TO_API_KEY` e `data-role-key`)
 * che usano il badge orizzontale Figma (avatar | nome / istituzione / ruolo) senza titolo di gruppo.
 */
export const COMPACT_ROLE_BADGE_GROUP_KEYS = [
  'Academic Coordinator',
  'Research Unit Lead',
  'General Advisor',
] as const

export type CompactRoleBadgeGroupKey = (typeof COMPACT_ROLE_BADGE_GROUP_KEYS)[number]

const KEY_SET = new Set<string>(COMPACT_ROLE_BADGE_GROUP_KEYS)

export function isCompactRoleBadgeGroup(roleKey: string): boolean {
  return KEY_SET.has(roleKey)
}
