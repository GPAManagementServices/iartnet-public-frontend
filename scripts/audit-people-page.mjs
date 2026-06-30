#!/usr/bin/env node
/**
 * GET-only audit for the public People page (no credentials, no repo writes).
 *
 * Usage:
 *   node scripts/audit-people-page.mjs --base-url https://iartnet.it --locale en
 */
import { parseArgs } from 'node:util'

const { values } = parseArgs({
  options: {
    'base-url': { type: 'string', default: 'https://iartnet.it' },
    locale: { type: 'string', default: 'en' },
    category: { type: 'string', default: 'internal' },
  },
})

const baseUrl = String(values['base-url']).replace(/\/$/, '')
const locale = String(values.locale)
const category = String(values.category)

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' })
  const text = await res.text()
  return { res, text, bytes: Buffer.byteLength(text, 'utf8') }
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length
}

const peoplePath = locale === 'en' ? '/people' : `/${locale}/people`
const pageUrl = `${baseUrl}${peoplePath}`
const apiUrl = `${baseUrl}/api/people?locale=${encodeURIComponent(locale)}`

const [page, api] = await Promise.all([
  fetchText(pageUrl),
  fetchText(apiUrl).catch((err) => ({ error: String(err) })),
])

const hrefs = [...page.text.matchAll(/<a[^>]*href=["']([^"']*)["']/gi)].map(m => m[1])
const externalOrigins = new Set()
for (const href of hrefs) {
  if (/^https?:\/\//i.test(href)) {
    try {
      const u = new URL(href)
      if (!u.hostname.endsWith('iartnet.it'))
        externalOrigins.add(u.origin)
    }
    catch { /* ignore */ }
  }
}

const report = {
  page_url: pageUrl,
  page_status: page.res?.status,
  page_bytes: page.bytes,
  anchor_count: countMatches(page.text, /<a\b/gi),
  href_empty: countMatches(page.text, /href=""/g),
  href_hash: countMatches(page.text, /href="#"/g),
  stretched_link: countMatches(page.text, /stretched-link/g),
  shortbio_in_html: countMatches(page.text, /shortbio/gi),
  iframe_count: countMatches(page.text, /<iframe/gi),
  external_link_origins: [...externalOrigins],
  people_slug_links: countMatches(page.text, /\/people\/[a-z0-9-]+/gi),
  api_url: apiUrl,
  api_bytes: api.bytes ?? null,
  api_error: api.error ?? null,
}

console.log(JSON.stringify(report, null, 2))
