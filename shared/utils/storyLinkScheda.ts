import type { TStoryLinkSchedaType } from '#shared/types/api'

export function storyLinkHref(linkScheda?: TStoryLinkSchedaType | null): string | null {
  const url = linkScheda?.URL?.trim()
  if (!url || url === '#')
    return null

  if (url.startsWith('/'))
    return `/digital-object${url}`

  return url
}

export function storyLinkSchedaLayoutClass(
  layout: TStoryLinkSchedaType['Layout'],
): 'story-link-scheda--top-left' | 'story-link-scheda--top-right' {
  return layout === 'TopRight' ? 'story-link-scheda--top-right' : 'story-link-scheda--top-left'
}
