import { proxyActivityAttachmentPdf } from '../utils/activityAttachmentProxy'

export default defineEventHandler(async (event) => {
  const q = getQuery(event).src
  if (typeof q !== 'string' || !q.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or empty src',
    })
  }
  let decoded: string
  try {
    decoded = decodeURIComponent(q.trim())
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid src encoding' })
  }
  return proxyActivityAttachmentPdf(event, decoded)
})
