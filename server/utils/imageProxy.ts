import { Buffer } from 'node:buffer'
import { createError } from 'h3'

export type MediaSigner = (
  request: string,
  options: { params: Record<string, unknown> },
) => Promise<{ url: string }>

export type MediaFetcher = (url: string) => Promise<Pick<Response, 'ok' | 'status' | 'headers' | 'arrayBuffer'>>

export interface ProxiedMediaResponse {
  body: Buffer
  contentType: string | null
  cacheControl: string | null
}

export async function fetchSignedMediaBody(
  path: string | undefined,
  query: Record<string, unknown>,
  signer: MediaSigner,
  mediaFetcher: MediaFetcher,
): Promise<ProxiedMediaResponse> {
  const signedUrl = await signer('/v1/media/sign', {
    params: { path, ...query },
  })

  const response = await mediaFetcher(signedUrl.url)
  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Unable to fetch signed media',
    })
  }

  return {
    body: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type'),
    cacheControl: response.headers.get('cache-control'),
  }
}
