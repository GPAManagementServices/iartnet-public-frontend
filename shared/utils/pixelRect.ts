/** Rettangolo in pixel immagine (origine top-left). Usato da annotazioni IIIF, cover card, ecc. */
export interface PixelRect {
  x: number
  y: number
  width: number
  height: number
}

export interface Point2D {
  x: number
  y: number
}

export type Size2D = Pick<PixelRect, 'width' | 'height'>

export function isValidPixelRect(
  rect: PixelRect | null | undefined,
): rect is PixelRect {
  if (!rect)
    return false

  const { x, y, width, height } = rect
  return Number.isFinite(x)
    && Number.isFinite(y)
    && Number.isFinite(width)
    && Number.isFinite(height)
    && width > 0
    && height > 0
}

export function pixelRectCentroid(rect: PixelRect): Point2D {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  }
}

/** Per CSS object-position su object-fit: cover (percentuali 0–100). */
export function pixelRectToObjectPosition(
  rect: PixelRect,
  image: Size2D,
): string {
  const { x, y } = pixelRectCentroid(rect)
  const xPct = Math.max(0, Math.min(100, (x / image.width) * 100))
  const yPct = Math.max(0, Math.min(100, (y / image.height) * 100))
  return `${xPct}% ${yPct}%`
}
