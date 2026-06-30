import type { CSSProperties } from 'vue'

/** Dimensioni massime del logo nel marquee (slide 480×320); matching sul nome file nell’URL. */
export interface MarqueeLogoSizeOverride {
  maxWidth?: string
  maxHeight?: string
}

/**
 * Chiave: basename del file in minuscolo (es. `partner-acme.svg`).
 * Aggiungi qui gli override necessari.
 */
export const MARQUEE_LOGO_SIZE_BY_FILENAME: Record<string, MarqueeLogoSizeOverride> = {
  // es.: 'logo-example.svg': { maxWidth: '280px', maxHeight: '160px' },
  '2a34ad51-bf06-4fd8-8ac2-ed81ca803a95.svg': { maxWidth: '300px', maxHeight: '91px' },
  '52770118-29d5-4319-875b-c82e83ab99cd.jpg': { maxWidth: '379px', maxHeight: '201px' },
  '0c5441f0-5813-416b-a688-be0d415dd16f.jpg': { maxWidth: '253px', maxHeight: '150px' },
  '424e2a8c-b74f-43da-96a2-c793537cbe81.jpg': { maxWidth: '480px' },
  'aa22d527-40bf-4695-8476-10f11293cf8f.png': { maxWidth: '271px', maxHeight: '131px' },
  '54f73fa5-111b-4de1-980b-8222b37aa807.png': { maxWidth: '320px', maxHeight: '102px' },
}

const DUMMY_ORIGIN = 'http://local.invalid'

/** Ultimo segmento del path dell’URL, decodificato e in minuscolo. */
export function logoFilenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url.trim(), DUMMY_ORIGIN).pathname
    const base = pathname.split('/').pop() ?? ''
    return decodeURIComponent(base).toLowerCase()
  }
  catch {
    return ''
  }
}

/** Stili inline da unire a quelli del marquee; vuoto se il file non è in mappa. */
export function marqueeLogoInlineStyle(url: string): CSSProperties {
  const key = logoFilenameFromUrl(url)
  const override = MARQUEE_LOGO_SIZE_BY_FILENAME[key]
  if (!override)
    return {}
  return {
    maxWidth: override.maxWidth ?? undefined,
    maxHeight: override.maxHeight ?? undefined,
  }
}
