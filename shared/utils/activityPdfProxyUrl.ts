/**
 * URL da passare a PDF.js (`getDocument`) dal browser.
 * Se il PDF è su un’origine diversa dal sito, usa il proxy Nuxt per evitare errori CORS ("Failed to fetch").
 * Link diretti di download devono usare l’URL originale dall’API, non questo valore.
 */
export function activityPdfFetchUrl(publicUrl: string): string {
  const u = publicUrl.trim()
  if (!u)
    return u
  if (import.meta.server)
    return u
  let absolute: URL
  try {
    absolute = new URL(u, window.location.origin)
  }
  catch {
    return u
  }
  if (absolute.origin === window.location.origin)
    return absolute.href
  return `/api/activity-attachment-file?src=${encodeURIComponent(u)}`
}
