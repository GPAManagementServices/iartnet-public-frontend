/**
 * Validates HTTP/HTTPS external URLs for People website links.
 */
const TRIM_UNSAFE_CHARS_RE = /[\r\n\0]/g
const HTTP_SCHEME_RE = /^https?:\/\//i
const BARE_HOSTNAME_RE = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::\d+)?(?:\/.*)?$/i

function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code <= 0x1F || code === 0x7F)
      return true
  }

  return false
}

export function normalizeHttpExternalUrl(value: string | null | undefined): string | null {
  if (value == null)
    return null

  const trimmed = value.replace(TRIM_UNSAFE_CHARS_RE, '').trim()
  if (!trimmed)
    return null

  if (hasControlChars(trimmed))
    return null

  const lower = trimmed.toLowerCase()
  const blocked = ['javascript:', 'data:', 'vbscript:', 'file:', 'mailto:', 'ftp:']
  if (blocked.some(scheme => lower.startsWith(scheme)))
    return null

  if (lower.startsWith('//'))
    return null

  let candidate = trimmed
  if (!HTTP_SCHEME_RE.test(candidate)) {
    if (!BARE_HOSTNAME_RE.test(candidate))
      return null
    candidate = `https://${candidate}`
  }

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:')
      return null
    if (url.username || url.password)
      return null
    if (!url.hostname)
      return null

    const host = url.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '0.0.0.0')
      return null

    return url.href
  }
  catch {
    return null
  }
}
