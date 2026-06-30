import type { SectionKind } from '#shared/types/api'

/** Etichetta editoriale / commento CSS per tipologia sezione narrative. */
export const STORY_SECTION_KIND_LABEL: Record<SectionKind, string> = {
  TextIntro: 'Text Intro',
  InlineText: 'InlineText',
  SplitContent: 'SplitContent',
  SplitImage: 'SplitImage',
  ScrollReveal: 'ScrollReveal',
  InlineImage: 'InlineImage',
  ImageFullScreen: 'ImageFullScreen',
  IIFAnnotationsGroup: 'IIFAnnotationsGroup',
}

/** Classe BEM sul wrapper di ogni componente sezione. */
export const STORY_SECTION_CLASS: Record<SectionKind, string> = {
  TextIntro: 'story-section--text-intro',
  InlineText: 'story-section--inline-text',
  SplitContent: 'story-section--split-content',
  SplitImage: 'story-section--split-image',
  ScrollReveal: 'story-section--scroll-reveal',
  InlineImage: 'story-section--inline-image',
  ImageFullScreen: 'story-section--image-full-screen',
  IIFAnnotationsGroup: 'story-section--iif-annotations',
}
