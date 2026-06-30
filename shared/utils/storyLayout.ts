import type { TStorySplitImageType } from '#shared/types/api'

export function splitImageStickyLayout(layout: TStorySplitImageType['Layout']): 'left' | 'right' {
  return layout.startsWith('Left') ? 'left' : 'right'
}
