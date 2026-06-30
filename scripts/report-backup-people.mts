/**
 * Report: people shown in the on-page "Backup" section (groups whose role
 * labels do not map to Activity/Project role buckets).
 *
 * Requires the Nuxt app responding (same /api routes as the browser).
 *
 *   pnpm report:backup-people
 *   REPORT_SITE_URL=https://example.com pnpm report:backup-people --locale=it
 *   pnpm report:backup-people --out=report.txt
 */
import type { Activity, Project } from '../shared/types/api.ts'
import {
  ACTIVITY_PEOPLE_BUCKETS,
  partitionPeopleGroupsByRoleBuckets,
  PROJECT_PEOPLE_BUCKETS,
} from '../shared/utils/detailPageRoleBuckets.ts'

interface PaginationResult<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
  }
}

interface FetchFailure {
  category: 'Activities' | 'Projects'
  slug: string
  url: string
  message: string
}

interface BackupRow {
  role: string
  lastName: string
  firstName: string
}

interface BackupPageSection {
  slug: string
  title: string
  source: 'detail' | 'list-fallback'
  rows: BackupRow[]
}

const TRAILING_SLASH_RE = /\/$/
const FETCH_RETRIES = 2
const RETRY_MS = 600

function baseUrl(): string {
  const fromEnv = process.env.REPORT_SITE_URL ?? process.env.NUXT_SITE_URL ?? process.env.NUXT_PUBLIC_SITE_URL
  const fromArg = process.argv.find(a => a.startsWith('--base='))?.slice('--base='.length)
  return (fromArg ?? fromEnv ?? 'http://localhost:3000').replace(TRAILING_SLASH_RE, '')
}

/** API locale for labels/names (matches the site). Report copy is English. */
function locale(): string {
  const fromArg = process.argv.find(a => a.startsWith('--locale='))?.slice('--locale='.length)
  return (fromArg ?? process.env.REPORT_LOCALE ?? 'en').trim() || 'en'
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok)
    throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

async function fetchJsonWithRetry<T>(url: string): Promise<T> {
  let lastErr: unknown
  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
    try {
      if (attempt > 0)
        await sleep(RETRY_MS * attempt)
      return await fetchJson<T>(url)
    }
    catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

function activityTitle(a: Activity, loc: string): string {
  const lt = a.translations?.title?.[loc as 'en' | 'it']
  return (lt ?? a.title ?? '').trim() || (a.slug ?? '').trim()
}

function projectTitle(p: Project, loc: string): string {
  const lt = p.translations?.title?.[loc as 'en' | 'it']
  return (lt ?? p.title ?? '').trim() || (p.slug ?? '').trim()
}

function backupRowsFromPartition(
  backup: ReturnType<typeof partitionPeopleGroupsByRoleBuckets>['backup'],
): BackupRow[] {
  const rows: BackupRow[] = []
  for (const g of backup) {
    for (const p of g.people) {
      rows.push({
        role: g.label.trim(),
        lastName: (p.last_name ?? '').trim(),
        firstName: (p.first_name ?? '').trim(),
      })
    }
  }
  return rows
}

function columnWidth(rows: BackupRow[], key: keyof BackupRow): number {
  const headerLen = key === 'role' ? 12 : key === 'lastName' ? 9 : 10
  const dataMax = rows.reduce((m, r) => Math.max(m, (r[key] ?? '').length), 0)
  return Math.max(headerLen, dataMax, 8)
}

function padCell(s: string, w: number): string {
  const t = s.trim()
  return t.length >= w ? t : `${t}${' '.repeat(w - t.length)}`
}

function formatTable(rows: BackupRow[]): string[] {
  if (!rows.length)
    return []
  const wr = columnWidth(rows, 'role')
  const wl = columnWidth(rows, 'lastName')
  const wf = columnWidth(rows, 'firstName')
  const sep = `${'-'.repeat(wr)}  ${'-'.repeat(wl)}  ${'-'.repeat(wf)}`
  return [
    `${padCell('Role', wr)}  ${padCell('Last name', wl)}  ${padCell('First name', wf)}`,
    sep,
    ...rows.map(r => `${padCell(r.role, wr)}  ${padCell(r.lastName, wl)}  ${padCell(r.firstName, wf)}`),
    '',
    'TSV (spreadsheet paste):',
    ['Role', 'Last name', 'First name'].join('\t'),
    ...rows.map(r => [r.role, r.lastName, r.firstName].join('\t')),
  ]
}

async function collectPaginated<T>(pathWithQuery: (page: number) => string): Promise<T[]> {
  const out: T[] = []
  let page = 1
  while (true) {
    const url = `${baseUrl()}${pathWithQuery(page)}`
    const body = await fetchJson<PaginationResult<T>>(url)
    out.push(...(body.data ?? []))
    const last = body.meta?.last_page ?? 1
    if (page >= last)
      break
    page += 1
  }
  return out
}

async function main(): Promise<void> {
  const loc = locale()
  const base = baseUrl()
  const failures: FetchFailure[] = []
  const activitiesSections: BackupPageSection[] = []
  const projectsSections: BackupPageSection[] = []

  const activitySummaries = await collectPaginated<Activity>(
    p => `/api/activities?locale=${encodeURIComponent(loc)}&page=${p}`,
  )

  for (const summary of activitySummaries) {
    const slug = (summary.slug ?? '').trim()
    if (!slug)
      continue

    const detailUrl = `${base}/api/activities/${encodeURIComponent(slug)}?locale=${encodeURIComponent(loc)}`
    let detail: Activity | null = null
    let source: BackupPageSection['source'] = 'detail'

    try {
      detail = await fetchJsonWithRetry<Activity>(detailUrl)
    }
    catch (e) {
      if (summary.people_groups?.length) {
        detail = summary
        source = 'list-fallback'
      }
      else {
        failures.push({
          category: 'Activities',
          slug,
          url: detailUrl,
          message: e instanceof Error ? e.message : String(e),
        })
        continue
      }
    }

    const { backup } = partitionPeopleGroupsByRoleBuckets(detail.people_groups, ACTIVITY_PEOPLE_BUCKETS, loc)
    if (!backup.length)
      continue

    activitiesSections.push({
      slug,
      title: activityTitle(detail, loc),
      source,
      rows: backupRowsFromPartition(backup),
    })
  }

  const projectSummaries = await collectPaginated<Project>(
    p => `/api/projects?locale=${encodeURIComponent(loc)}&page=${p}`,
  )

  for (const summary of projectSummaries) {
    const slug = (summary.slug ?? '').trim()
    if (!slug)
      continue

    const detailUrl = `${base}/api/projects/${encodeURIComponent(slug)}?locale=${encodeURIComponent(loc)}`
    let detail: Project | null = null
    let source: BackupPageSection['source'] = 'detail'

    try {
      detail = await fetchJsonWithRetry<Project>(detailUrl)
    }
    catch (e) {
      if (summary.people_groups?.length) {
        detail = summary
        source = 'list-fallback'
      }
      else {
        failures.push({
          category: 'Projects',
          slug,
          url: detailUrl,
          message: e instanceof Error ? e.message : String(e),
        })
        continue
      }
    }

    const { backup } = partitionPeopleGroupsByRoleBuckets(detail.people_groups, PROJECT_PEOPLE_BUCKETS, loc)
    if (!backup.length)
      continue

    projectsSections.push({
      slug,
      title: projectTitle(detail, loc),
      source,
      rows: backupRowsFromPartition(backup),
    })
  }

  const actPages = activitiesSections.length
  const actPeople = activitiesSections.reduce((n, s) => n + s.rows.length, 0)
  const projPages = projectsSections.length
  const projPeople = projectsSections.reduce((n, s) => n + s.rows.length, 0)
  const failAct = failures.filter(f => f.category === 'Activities').length
  const failProj = failures.filter(f => f.category === 'Projects').length

  const lines: string[] = []

  lines.push('='.repeat(80))
  lines.push('BACKUP PEOPLE REPORT (roles not mapped to Label1 / Label2)')
  lines.push('='.repeat(80))
  lines.push(`API locale (labels/names): ${loc}`)
  lines.push(`Base URL: ${base}`)
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push('')

  lines.push('-'.repeat(80))
  lines.push('SUMMARY')
  lines.push('-'.repeat(80))
  lines.push(`  Activities — pages with backup: ${actPages} | people: ${actPeople} | fetch errors: ${failAct}`)
  lines.push(`  Projects   — pages with backup: ${projPages} | people: ${projPeople} | fetch errors: ${failProj}`)
  if (failAct + failProj > 0) {
    lines.push('')
    lines.push('  If an activity detail request fails, the script falls back to list payload `people_groups`')
    lines.push('  (names may be missing). See FETCH ERRORS at the end.')
  }
  lines.push('')

  lines.push('='.repeat(80))
  lines.push('ACTIVITIES — DETAIL')
  lines.push('='.repeat(80))
  if (!activitiesSections.length) {
    lines.push('  (no pages with backup people)')
    lines.push('')
  }
  else {
    for (const sec of activitiesSections) {
      lines.push(`▸ ${sec.slug}`)
      lines.push(`  Title: ${sec.title}`)
      if (sec.source === 'list-fallback')
        lines.push('  Source: list JSON (detail request failed)')
      lines.push('')
      lines.push(...formatTable(sec.rows).map(l => `  ${l}`))
      lines.push('')
    }
  }

  lines.push('='.repeat(80))
  lines.push('PROJECTS — DETAIL')
  lines.push('='.repeat(80))
  if (!projectsSections.length) {
    lines.push('  (no pages with backup people)')
    lines.push('')
  }
  else {
    for (const sec of projectsSections) {
      lines.push(`▸ ${sec.slug}`)
      lines.push(`  Title: ${sec.title}`)
      if (sec.source === 'list-fallback')
        lines.push('  Source: list JSON (detail request failed)')
      lines.push('')
      lines.push(...formatTable(sec.rows).map(l => `  ${l}`))
      lines.push('')
    }
  }

  if (failures.length) {
    lines.push('='.repeat(80))
    lines.push('FETCH ERRORS')
    lines.push('='.repeat(80))
    for (const f of failures) {
      lines.push(`  [${f.category}] ${f.slug}`)
      lines.push(`    URL: ${f.url}`)
      lines.push(`    ${f.message}`)
      lines.push('')
    }
  }
  else {
    lines.push('-'.repeat(80))
    lines.push('Fetch errors: none.')
    lines.push('')
  }

  const text = lines.join('\n')
  console.log(text)
  const outArg = process.argv.find(a => a.startsWith('--out='))?.slice('--out='.length)
  if (outArg) {
    const fs = await import('node:fs/promises')
    await fs.writeFile(outArg, text, 'utf8')
    console.error(`\nWritten: ${outArg}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
