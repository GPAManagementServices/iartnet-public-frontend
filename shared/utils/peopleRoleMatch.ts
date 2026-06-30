/**
 * Allineamento chiavi ruolo API (snake_case) ↔ chiavi i18n / titoli inglesi usati in pagina People.
 */
export const APP_ROLE_TITLE_TO_API_KEY: Record<string, string> = {
  'Academic Coordinator': 'academic_coordinator',
  'Academic Team Member': 'academic_team_member',
  'Research Unit Lead': 'research_unit_lead',
  'Chief Information Officer': 'chief_information_officer',
  'Digital Collections Curator': 'digital_collections_curator',
  'General Advisor': 'general_advisor',
  'Project Manager': 'project_manager',
  'Project Staff': 'project_staff',
  'Research Coordinator and Communication': 'research_coordinator_and_communication',
  'Research Office Manager': 'research_office_manager',
  'Research Staff': 'research_staff',
  'Research Group Coordinator': 'research_group_coordinator',
  'Student Collaborator': 'student_collaborator',
  'External Consultant': 'external_consultant',
}

/**
 * Slug `people_role.slug` da API (a volte plurale) → snake_case usato in `role_key`.
 */
const PEOPLE_ROLE_SLUG_TO_SNAKE: Record<string, string> = {
  academic_coordinator: 'academic_coordinator',
  academic_team_members: 'academic_team_member',
  research_unit_lead: 'research_unit_lead',
  general_advisor: 'general_advisor',
  research_staff: 'research_staff',
  project_staff: 'project_staff',
  student_collaborators: 'student_collaborator',
  external_consultant: 'external_consultant',
  project_manager: 'project_manager',
  research_coordinator_and_communication: 'research_coordinator_and_communication',
  digital_collections_curator: 'digital_collections_curator',
  research_office_manager: 'research_office_manager',
  chief_information_officer: 'chief_information_officer',
  research_group_coordinator: 'research_group_coordinator',
  general_consultant: 'general_consultant',
}

export interface PersonLike {
  role?: string
  role_key?: string
  people_role?: { slug?: string }
}

/**
 * True se `p` corrisponde al ruolo.
 * L’API espesso invia `role` in inglese mentre `t(title)` è localizzato: si confronta anche con `englishTitle` e con `people_role.slug`.
 */
export function matchesAppRoleTitle(
  p: PersonLike,
  englishTitle: string,
  translatedLabel: string,
): boolean {
  const snake = APP_ROLE_TITLE_TO_API_KEY[englishTitle]
  if (snake && p.role_key === snake)
    return true
  if (snake && p.people_role?.slug) {
    const fromSlug = PEOPLE_ROLE_SLUG_TO_SNAKE[p.people_role.slug]
    if (fromSlug === snake)
      return true
  }
  const role = (p.role ?? '').trim()
  if (role === translatedLabel)
    return true
  if (role === englishTitle)
    return true
  return false
}

const STUDENT_ROLE_KEY = 'student_collaborator'
const ENGLISH_STUDENT_COLLABORATOR = 'Student Collaborator'
const WHITESPACE_RUN = /\s+/g

/**
 * True se la persona ha ruolo student / student collaborator (API, slug o testo, IT/EN e case).
 * Usa `translatedLabel` = `t('Student Collaborator')` dalla pagina.
 */
export function isStudentRole(
  p: PersonLike,
  translatedLabel: string,
): boolean {
  if (p.role_key === STUDENT_ROLE_KEY)
    return true
  if (p.people_role?.slug) {
    const fromSlug = PEOPLE_ROLE_SLUG_TO_SNAKE[p.people_role.slug]
    if (fromSlug === STUDENT_ROLE_KEY)
      return true
  }
  if (matchesAppRoleTitle(p, ENGLISH_STUDENT_COLLABORATOR, translatedLabel))
    return true
  const role = (p.role ?? '').trim().toLowerCase().replace(WHITESPACE_RUN, ' ')
  if (!role)
    return false
  if (role === 'student' || role === 'students')
    return true
  if (role.includes('student') && (role.includes('collaborat') || role.includes('collaborator')))
    return true
  return false
}
