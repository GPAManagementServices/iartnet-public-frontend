/**
 * URL assoluto per `href` esterno (aggiunge https:// se manca lo schema).
 */
export function institutionWebsiteHref(raw: string | null | undefined): string {
  const t = (raw ?? '').trim()
  if (!t)
    return ''
  return /^https?:\/\//i.test(t) ? t : `https://${t}`
}

/**
 * Etichetta compatta sotto il titolo istituzione: solo host, senza schema, senza `www.` iniziale, senza path/query.
 */
export function institutionWebsiteDisplayHost(raw: string | null | undefined): string {
  const href = institutionWebsiteHref(raw)
  if (!href)
    return ''
  try {
    const u = new URL(href)
    let h = u.hostname
    if (h.toLowerCase().startsWith('www.'))
      h = h.slice(4)
    return h
  }
  catch {
    return (raw ?? '')
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]
      ?.replace(/\/$/, '') ?? ''
  }
}
