export type RecordMediaItem = {
  iiif_image_api?: string
  url?: string
  notes?: string
  publish_state?: string
}

export function getPublishedRecordMedia(recordJson: Record<string, unknown>): RecordMediaItem[] {
  const media = (recordJson.media as Array<RecordMediaItem>) || []
  return media.filter(m => m.publish_state === 'published')
}
