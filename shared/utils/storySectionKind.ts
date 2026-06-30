import type { SectionKind, TStorySection } from '#shared/types/api'

export function getStorySectionKind(section: TStorySection): SectionKind {
  return section.Kind
}
