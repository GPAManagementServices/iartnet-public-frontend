/** Whitelist allineata al backend Glide / `GET /api/v1/media/sign`. */
export const SIGNED_MEDIA_FIT = ['contain', 'max', 'fill', 'stretch', 'crop'] as const
export type SignedMediaFit = (typeof SIGNED_MEDIA_FIT)[number]

export const SIGNED_MEDIA_FM = ['webp', 'png', 'jpg'] as const
export type SignedMediaFm = (typeof SIGNED_MEDIA_FM)[number]

export interface SignedMediaUrlInput {
  /** Path Curator così come restituito dall'API (es. `media/…`). */
  path: string | null | undefined
  w?: number | null | undefined
  h?: number | null | undefined
  fit?: SignedMediaFit | null | undefined
  fm?: SignedMediaFm | null | undefined
}

/** Query validata per `GET /api/media/sign` (proxy Nitro → backend). */
export type SignedMediaQuery = Record<string, string> & { path: string }

export interface SignedMediaSignResponse {
  url: string
}
