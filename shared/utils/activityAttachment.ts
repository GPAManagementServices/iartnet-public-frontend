import type { ActivityAttachment } from '#shared/types/api'

/** Etichetta per UI/viewer: `title` se valorizzato, altrimenti nome file da `path` o `url`. */
export function activityAttachmentDisplayLabel(a: {
  title: string | null
  path: string
  url: string
}): string {
  const trimmed = a.title?.trim()
  if (trimmed)
    return trimmed
  const fromPath = a.path.split('/').pop()?.trim()
  if (fromPath)
    return decodeURIComponent(fromPath)
  try {
    const u = new URL(a.url)
    const seg = u.pathname.split('/').filter(Boolean).pop()
    if (seg)
      return decodeURIComponent(seg)
  }
  catch {
    /* ignore invalid URL */
  }
  return 'Document'
}

/** Nome file consigliato per `download` (estensione .pdf se mancante). */
export function activityAttachmentDownloadFilename(a: {
  title: string | null
  path: string
  url: string
}): string {
  const base = activityAttachmentDisplayLabel(a).replace(/[/\\?%*:|"<>]/g, '-').trim() || 'document'
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`
}

/** Solo allegati PDF con URL utilizzabile. Il campo legacy `attachment` non viene usato. */
export function activityPdfAttachments(list: ActivityAttachment[] | undefined): ActivityAttachment[] {
  if (!list?.length)
    return []
  return list.filter(
    a => a.mimeType === 'application/pdf' && typeof a.url === 'string' && a.url.length > 0,
  )
}
