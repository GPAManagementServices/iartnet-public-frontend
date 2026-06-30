import type { Person } from '../types/api'
import {
  buildRoleAliasSet,
  localizedGroupLabel,
  normalizeLabel,
  roleMatches,
  sortPeopleByName,
} from './detailPage'

export interface PeopleGroupForPartition {
  label: string | null
  label_translations: { en: string | null, it: string | null }
  people: Person[]
}

export interface PeopleRoleBuckets {
  /** Lasciare `[]`: l’ordine editoriale è tutto in `label2Roles`. */
  label1Roles: string[]
  label2Roles: string[]
  label1Synonyms: Record<string, string[]>
  label2Synonyms: Record<string, string[]>
}

export interface PartitionedPeopleGroups {
  label1: Array<{ key: string, label: string, people: Person[] }>
  label2: Array<{ key: string, label: string, people: Person[] }>
  backup: Array<{ label: string, people: Person[] }>
}

/** Gerarchia ruoli pagina Activity: ordine unico in `label2Roles` (+ sinonimi per etichette API). */
export const ACTIVITY_PEOPLE_BUCKETS: PeopleRoleBuckets = {
  label1Roles: [],
  label2Roles: [
    'academic coordinator',
    'curator',
    'expert',
    'lecturer',
    'panel chair',
    'conductor',
    'visiting scholar',
    'speaker',
    'participating artist',
    'performer',
    'project collaborator',
    'participant',
  ],
  label1Synonyms: {},
  label2Synonyms: {
    'academic coordinator': [
      'academic coordinators',
      'academic coordination',
      'coordination of academic activities',
      'coordinatore scientifico',
      'coordinatori scientifici',
      'coordinamento scientifico',
    ],
    'curator': [
      'curators',
      'curatore',
      'curatrice',
      'curatorial',
      'curatorship',
    ],
    'expert': ['experts', 'esperto', 'esperti', 'subject matter expert', 'subject matter experts'],
    'lecturer': ['lecturers', 'docente', 'docenti', 'lecturing', 'guest lecturer', 'guest lecturers'],
    'panel chair': ['panel chairs', 'moderatore', 'moderatori', 'panel moderator', 'panel moderators'],
    'conductor': ['conductors', 'conduttore', 'conduttori', 'conductor', 'conductors'],
    'visiting scholar': ['visiting scholars', 'visiting research scholar', 'visiting research scholars'],
    'speaker': ['speakers', 'relatore', 'relatori', 'keynote speaker', 'keynote speakers', 'invited speaker', 'invited speakers'],
    'participating artist': [
      'participating artists',
      'artist',
      'artists',
      'artista',
      'artisti',
      'performing artist',
      'performing artists',
      'musician',
      'musicians',
      'musicista',
      'musicisti',
    ],
    'performer': ['performers', 'performer', 'esecutore', 'esecutori'],
    'project collaborator': [
      'project collaborators',
      'project collaboration',
      'collaborator',
      'collaborators',
      'collaboratore',
      'collaboratori',
      'collaboration on the project',
    ],
    'participant': [
      'participants',
      'visiting participant',
      'visiting participants',
      'partecipante',
      'partecipanti',
      'attendee',
      'attendees',
    ],
  },
}

/** Gerarchia ruoli pagina Project: ordine unico in `label2Roles`. */
export const PROJECT_PEOPLE_BUCKETS: PeopleRoleBuckets = {
  label1Roles: [],
  label2Roles: [
    'research group coordinator',
    'academic team member',
    'research staff',
    'project staff',
    'student collaborators',
    'external consultant',
    'research unit',
  ],
  label1Synonyms: {},
  label2Synonyms: {
    'research group coordinator': [
      'research group coordinators',
      'academic supervision',
      'academic supervisor',
      'academic supervisors',
      'supervision of research',
      'coordinatore del gruppo di ricerca',
      'coordinatori del gruppo di ricerca',
      'supervisione accademica',
      'supervisore accademico',
      'supervisori accademici',
    ],
    /** Ex coordinatori di dettaglio (CMS) → stesso bucket. */
    'academic team member': [
      'academic team members',
      'membro del team accademico',
      'membri del team accademico',
      'membro del gruppo accademico',
      'membri del gruppo accademico',
      'artistic research activities coordinator',
      'artistic research activities coordinators',
      'coordinator of artistic research activities',
      'coordinators of artistic research activities',
      'coordination of artistic research activities',
      'coordinatore delle attività di ricerca artistica',
      'coordinatori delle attività di ricerca artistica',
      'coordinamento attività di ricerca artistica',
      'archiving and digitization of heritage coordinator',
      'archiving and digitization of heritage coordinators',
      'coordinator of archiving and digitization of heritage',
      'coordinators of archiving and digitization of heritage',
      'coordinator of archiving and digitisation of heritage',
      'coordinators of archiving and digitisation of heritage',
      'archiving and digitization of heritage',
      'archiving and digitisation of heritage',
      'coordination of archiving and digitization of heritage',
      'coordination of archiving and digitisation of heritage',
      'coordinatore archiviazione e digitalizzazione del patrimonio',
      'coordinatori archiviazione e digitalizzazione del patrimonio',
      'archiviazione e digitalizzazione del patrimonio',
      'audiovisual content production coordinator',
      'audiovisual content production coordinators',
      'coordinator of audiovisual content production',
      'coordinators of audiovisual content production',
      'coordination of audiovisual content production',
      'coordinatore della produzione di contenuti audiovisivi',
      'coordinatori della produzione di contenuti audiovisivi',
      'coordinamento produzione contenuti audiovisivi',
      'social media communication assistant',
      'social media communication assistants',
      'assistente comunicazione social media',
      'assistenti comunicazione social media',
      'social media assistant',
      'social media assistants',
      'wp3 and wp4 activities coordinator',
      'wp3 and wp4 activities coordinators',
      'coordinator of wp3 and wp4 activities',
      'coordinators of wp3 and wp4 activities',
      'coordination of wp3 and wp4 activities',
      'coordinatore attività wp3 e wp4',
      'coordinatori attività wp3 e wp4',
      'coordinamento attività wp3 e wp4',
    ],
    'research staff': [
      'membro del personale di ricerca',
      'personale di ricerca',
      'research personnel',
      'ricercatore',
      'ricercatori',
    ],
    'project staff': [
      'staff di progetto',
      'membro dello staff di progetto',
      'project personnel',
      'personale di progetto',
    ],
    'student collaborators': [
      'student collaborator',
      'students collaborators',
      'studente collaboratore',
      'studenti collaboratori',
      'collaboratore studentesco',
      'collaboratori studenteschi',
      'student collaboration',
      'student collaborations',
    ],
    'external consultant': [
      'external consultants',
      'consulente esterno',
      'consulenti esterni',
    ],
    'research unit': [
      'research units',
      'unità di ricerca',
      'unita di ricerca',
      'istituzione promotrice',
      'istituzioni promotrici',
      'promoting institution',
      'promoting institutions',
    ],
  },
}

export function partitionPeopleGroupsByRoleBuckets(
  groups: PeopleGroupForPartition[] | null | undefined,
  buckets: PeopleRoleBuckets,
  locale: string,
): PartitionedPeopleGroups {
  const list = groups ?? []
  const label1: PartitionedPeopleGroups['label1'] = []
  const label2: PartitionedPeopleGroups['label2'] = []
  const backup: PartitionedPeopleGroups['backup'] = []

  const normalizedLabel1 = buildRoleAliasSet(buckets.label1Roles)
  const normalizedLabel2 = buildRoleAliasSet(buckets.label2Roles)

  for (const group of list) {
    let label = localizedGroupLabel(group.label, group.label_translations, locale)
    const people = sortPeopleByName(group.people ?? [])
    if (!people.length)
      continue
    if (!label.trim())
      label = '—'
    const key = normalizeLabel(label)
    if (roleMatches(label, normalizedLabel1, buckets.label1Synonyms))
      label1.push({ key, label, people })
    else if (roleMatches(label, normalizedLabel2, buckets.label2Synonyms))
      label2.push({ key, label, people })
    else
      backup.push({ label, people })
  }

  return { label1, label2, backup }
}
