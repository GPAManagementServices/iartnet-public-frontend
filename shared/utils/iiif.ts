import type { PixelRect } from './pixelRect'
import { isValidPixelRect } from './pixelRect'

export enum IiifImageSize {
  Max = 'full',
  Large = '720,',
  Gallery = '120,',
  OpereCitate = '100,',
  SearchThumb = '300,',
}

const TRAILING_SLASH_SUFFIX = /\/$/
const IIIF_INFO_JSON_SUFFIX = /\/info\.json$/i
const IIIF_SIZE_SEGMENT = /\/full\/[^/]+/i
const IIIF_SERVICE_PATH_PREFIX = /^\/iiif\//i
const IIIF_SERVICE_PATH_IN_URL = /\/iiif\//i

/** Risolve path/URL IIIF usando `baseIIIFUrl` (es. gpams in dev, iartnet in prod). */
export function resolveIiifServiceUrl(input: string, baseIIIFUrl: string): string | null {
  const raw = String(input).trim()
  if (!raw)
    return null

  const base = String(baseIIIFUrl).trim().replace(TRAILING_SLASH_SUFFIX, '')
  if (!base)
    return null

  if (IIIF_SERVICE_PATH_PREFIX.test(raw))
    return `${base}${raw}`

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const url = new URL(raw)
      if (IIIF_SERVICE_PATH_IN_URL.test(url.pathname))
        return `${base}${url.pathname}${url.search}`
    }
    catch {
      return null
    }
  }

  return null
}

export function iiifImageUrl(input: string, size: IiifImageSize = IiifImageSize.Max): string {
  const url = String(input).trim().replace(TRAILING_SLASH_SUFFIX, '')

  if (IIIF_INFO_JSON_SUFFIX.test(url)) {
    const base = url.replace(IIIF_INFO_JSON_SUFFIX, '')
    return `${base}/full/${size}/0/default.jpg`
  }

  if (IIIF_SIZE_SEGMENT.test(url))
    return url.replace(IIIF_SIZE_SEGMENT, `/full/${size}`)

  return `${url}/full/${size}/0/default.jpg`
}

/** URL info.json IIIF Image API 2 a partire dalla BaseURI del servizio. */
export function iiifInfoJsonUrl(baseUri: string): string {
  const base = String(baseUri).trim().replace(TRAILING_SLASH_SUFFIX, '')
  if (IIIF_INFO_JSON_SUFFIX.test(base))
    return base
  return `${base}/info.json`
}

export interface IiifImageDimensions {
  width: number
  height: number
}

/** Risolve width/height da info.json quando non presenti nel payload. */
export async function fetchIiifImageDimensions(baseUri: string): Promise<IiifImageDimensions> {
  const url = iiifInfoJsonUrl(baseUri)
  const res = await fetch(url)
  if (!res.ok)
    throw new Error(`IIIF info.json failed (${res.status}): ${url}`)

  const info = await res.json() as { width?: number, height?: number }
  const width = info.width
  const height = info.height
  if (!Number.isFinite(width) || !Number.isFinite(height) || width! <= 0 || height! <= 0)
    throw new Error(`IIIF info.json missing width/height: ${url}`)

  return { width: width!, height: height! }
}

/**
 * Converte un rettangolo in pixel IIIF in coordinate viewport OpenSeadragon.
 * In OSD la larghezza dell'immagine occupa x ∈ [0, 1]; y usa la stessa unità (÷ width),
 * quindi l'altezza in viewport è imageHeight / imageWidth (non normalizzata su [0, 1]).
 */
export function iiifPixelRectToViewport(
  rect: PixelRect,
  imageWidth: number,
  _imageHeight: number,
): PixelRect {
  return {
    x: rect.x / imageWidth,
    y: rect.y / imageWidth,
    width: rect.width / imageWidth,
    height: rect.height / imageWidth,
  }
}

/** Rettangolo annotazione valido per zoom IIIF (area > 0). */
export function isValidIiifAnnotationRect(
  rect: PixelRect | null | undefined,
): rect is PixelRect {
  return isValidPixelRect(rect)
}
