import type { SectionKind, TStorySection } from '#shared/types/api'
import { isStorySectionVisible } from '#shared/utils/storySectionPublished'
import { getStorySectionKind } from '#shared/utils/storySectionKind'

/** Sections that share the GAC-style pinned stack (hold + peel). */
export const PANEL_STACK_KINDS = new Set<SectionKind>([
  'ImageFullScreen',
  'SplitImage',
])

export type StorySectionBlock
  = | { type: 'section', section: TStorySection, index: number }
    | { type: 'fullscreen-stack', sections: TStorySection[], indices: number[] }

export function isPanelStackKind(kind: SectionKind | null): kind is SectionKind {
  return kind != null && PANEL_STACK_KINDS.has(kind)
}

export function buildStorySectionBlocks(
  sections: TStorySection[],
): StorySectionBlock[] {
  const blocks: StorySectionBlock[] = []
  let index = 0

  while (index < sections.length) {
    const section = sections[index]!
    if (!isStorySectionVisible(section)) {
      index++
      continue
    }

    const kind = getStorySectionKind(section)

    if (kind === 'IIFAnnotationsGroup') {
      blocks.push({ type: 'section', section, index })
      index++
      continue
    }

    if (isPanelStackKind(kind)) {
      const indices = [index]
      let next = index + 1

      while (next < sections.length) {
        const nextSection = sections[next]!
        if (!isStorySectionVisible(nextSection)) {
          next++
          continue
        }
        const nextKind = getStorySectionKind(nextSection)
        if (nextKind === 'IIFAnnotationsGroup' || !isPanelStackKind(nextKind))
          break
        indices.push(next)
        next++
      }

      blocks.push({
        type: 'fullscreen-stack',
        sections: indices.map(i => sections[i]!),
        indices,
      })
      index = next
      continue
    }

    blocks.push({ type: 'section', section, index })
    index++
  }

  return blocks
}

export function blockListKey(block: StorySectionBlock): string {
  if (block.type === 'section')
    return `section-${block.index}`
  return `stack-${block.indices.join('-')}`
}
