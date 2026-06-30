import type { Activity, Institution, Page, Project } from '#shared/types/api'
import type { SitemapEntry } from './types'
import { api, type PaginationResult } from '../apiFetch'
import { localizedDetailPaths, pathsToSitemapEntries } from './buildUrls'

const CMS_LOCALE = 'en'

const INSTITUTION_CATEGORY_SLUGS: Record<'en' | 'it', string>[] = [
  { en: 'lead-institution', it: 'istituzione-principale' },
  { en: 'project-partner', it: 'partner-di-progetto' },
  { en: 'associate-member', it: 'membro-associato' },
]

async function fetchPublishedPages(): Promise<Page[]> {
  const items: Page[] = []
  let page = 1
  let lastPage = 1

  do {
    const response = await api<PaginationResult<Page>>(
      `/v1/pages?status=published&per_page=100&page=${page}`,
    )
    items.push(...response.data)
    lastPage = response.meta?.last_page ?? page
    page += 1
  } while (page <= lastPage)

  return items
}

async function fetchInstitutions(locale: 'en' | 'it'): Promise<Institution[]> {
  const batches = await Promise.all(
    INSTITUTION_CATEGORY_SLUGS.map(category =>
      api<PaginationResult<Institution>>(
        `/v1/institutions?locale=${locale}&status=published&category_slug=${category[locale]}&all=true`,
      ),
    ),
  )

  const byId = new Map<number, Institution>()
  for (const batch of batches) {
    for (const institution of batch.data ?? [])
      byId.set(institution.id, institution)
  }

  return [...byId.values()]
}

function cmsPagePaths(page: Page): string[] {
  const enSlug = page.translations?.slug?.en?.trim() || page.slug?.trim()

  if (!enSlug)
    return []

  return [`/${encodeURIComponent(enSlug)}`]
}

/** URL CMS pubblicate (progetti, attività, istituzioni, pagine statiche CMS). Hub `/people` in pages.xml. */
export async function fetchCmsSitemapEntries(): Promise<SitemapEntry[]> {
  const paths: string[] = []

  const [projects, activities, pages, institutions] = await Promise.all([
    api<PaginationResult<Project>>(
      `/v1/projects?locale=${CMS_LOCALE}&status=published&all=true`,
    ),
    api<PaginationResult<Activity>>(
      `/v1/activities?locale=${CMS_LOCALE}&status=published&all=true`,
    ),
    fetchPublishedPages(),
    fetchInstitutions('en'),
  ])

  for (const project of projects.data ?? []) {
    if (project.status !== 'published')
      continue
    paths.push(...localizedDetailPaths('projects', project))
  }

  for (const activity of activities.data ?? []) {
    if (activity.status !== 'published')
      continue
    paths.push(...localizedDetailPaths('activities', activity))
  }

  for (const institution of institutions) {
    if (institution.status !== 'published')
      continue
    paths.push(...localizedDetailPaths('institutions', institution))
  }

  for (const page of pages)
    paths.push(...cmsPagePaths(page))

  return pathsToSitemapEntries([...new Set(paths)])
}
