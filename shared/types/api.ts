import type { PixelRect } from '#shared/utils/pixelRect'

export interface Category {
  id: number
  name: string
  slug: string
  type: 'activity' | 'research_catalogue' | 'institution' | 'people' // TODO
}

export interface Institution {
  id: number
  name: string
  slug: string
  /** Slug EN (API grouped / Filament); ordinamento slug_en → slug_it lato backend. */
  slug_en?: string
  slug_it?: string
  /** Chiave ordinamento display lato API (grouped=1). */
  display_sort_key?: string
  status: 'published' | 'draft' | 'archived'
  website?: string
  description?: string

  logo_image_id: unknown | null // TODO
  opengraph_picture_id: unknown | null // TODO

  categories: Category[]

  meta: {
    title: string
    description: string
    opengraph_title: string
    opengraph_description: string
    opengraph_picture_alt: string
  }

  media: {
    logo: Media | null
    cover_image: Media | null
  }

  created_at: unknown // TODO
  updated_at: unknown | null // TODO

  translations: {
    name: { en: string, it: string }
    slug: { en: string, it: string }

    description: Array<unknown> // TODO

    meta_title: Array<unknown> // TODO
    meta_description: Array<unknown> // TODO
    opengraph_title: Array<unknown> // TODO
    opengraph_description: Array<unknown> // TODO
    opengraph_picture_alt: Array<unknown> // TODO
  }
}

export interface Person {
  id: number
  first_name: string
  last_name: string
  slug: string
  status: 'published' | 'draft' | 'private'
  role?: string
  /** Chiave ruolo stabile da API (es. research_unit_lead). Preferire per matching oltre alla label localizzata. */
  role_key?: string
  /** Indica se esiste una scheda dettaglio pubblica (API grouped/light). */
  has_detail_page?: boolean
  shortbio?: string | null
  website?: string | null
  email?: string | null
  image_id: number | null
  opengraph_picture_id: number | null

  media: {
    image: Media | null
  }

  /** Istituzioni collegate; in API possono includere role_key / role_label_en sul pivot. */
  institutions: Array<Institution & { role_key?: string, role_label_en?: string | null }>

  // institutions: Institution[] // TODO: Remove, old API
  institution_roles: Array<{ institution_id: number, role: { en: string, it: string } }>

  meta: {
    title: string
    description: string
    opengraph_title: string
    opengraph_description: string
    opengraph_picture_alt: string
  }

  created_at: unknown // TODO
  updated_at: unknown | null // TODO

  translations: {
    first_name: { en: string, it: string }
    last_name: { en: string, it: string }
    slug: { en: string, it: string }
    role: { en: string, it: string }

    shortbio: Array<unknown> // TODO

    meta_title: Array<unknown> // TODO
    meta_description: Array<unknown> // TODO
    opengraph_title: Array<unknown> // TODO
    opengraph_description: Array<unknown> // TODO
    opengraph_picture_alt: Array<unknown> // TODO
  }
}

/** Allegato activity (API v1). Il frontend usa solo `attachments`; `attachment` stringa legacy resta nel payload ma non è usato in UI. */
export interface ActivityAttachment {
  id: number
  url: string
  path: string
  title: string | null
  mimeType: string
}

export interface Activity {
  id: number
  title: string
  slug: string
  subtitle: string
  description: string
  status: 'published' | 'draft' | 'archived'

  start_date: unknown | null // TODO
  start_hour: unknown | null // TODO
  end_date: string | null
  end_hour: string | null

  location: string
  /** Ordine editoriale dal CMS; in risposta API sempre presente come array (anche vuoto). */
  video_urls?: string[]
  /** Legacy: equivalente a `video_urls[0] ?? null`. */
  video_url: string | null
  /** Legacy Laravel path string; non usato dal frontend — usare `attachments`. */
  attachment?: string | null
  attachments?: ActivityAttachment[]

  abstract_text?: string

  media: {
    cover_image: Media | null
    opengraph_picture: Media | null
    gallery: Media[]
  }

  categories: Category[]

  people_groups: Array<{
    label: string | null
    label_translations: { en: string | null, it: string | null }
    people: Person[]
  }>

  institutions: Institution[]

  meta: {
    title: string
    description: string
    opengraph_title: string
    opengraph_description: string
    opengraph_picture_alt: string
  }

  created_at: unknown // TODO
  updated_at: unknown | null // TODO

  translations: {
    title: { en: string, it: string }
    slug: { en: string, it: string }

    subtitle: Array<unknown> // TODO
    description: Array<unknown> // TODO
    location: Array<unknown> // TODO

    meta_title: Array<unknown> // TODO
    meta_description: Array<unknown> // TODO
    opengraph_title: Array<unknown> // TODO
    opengraph_description: Array<unknown> // TODO
    opengraph_picture_alt: Array<unknown> // TODO
  }
}

export interface TCardStat {
  id_institution: string
  code: string
  name: string
  tot_cards: number
}

export interface CardsStat {
  cardsStat: Array<TCardStat>
}

export interface Media {
  id: number
  url: string
  /** Path per Curator/Laravel (signature); usato dal proxy /api/image per thumbnail. */
  path?: string
  alt: string | null
  title: string
  caption?: string
  captions?: {
    en?: string | null
    it?: string | null
  }
  description?: string
  width: number
  height: number
  size: number
  type?: string | null
}

export interface PressDestinationFile {
  type: 'file'
  url: string
  mimeType: string
  fileName: string
  fileSize: number
}

export interface PressDestinationExternal {
  type: 'external'
  url: string
}

export type PressDestination = PressDestinationFile | PressDestinationExternal

export interface PressContact {
  id: string
  label: string
  email: string
}

export interface PressRelease {
  id: string
  title: string
  description: string | null
  cover: Media | null
  destination: PressDestination | null
}

export interface PressDocument {
  id: string
  category: string | null
  title: string
  date: string | null
  destination: PressDestination | null
}

export interface PressPage {
  title: string
  intro: string | null
  seo: {
    title: string
    description: string | null
  }
  contacts: PressContact[]
  pressReleases: PressRelease[]
  documents: PressDocument[]
}

export interface Page {
  id: number
  title: string
  slug: string
  status: 'published' | 'draft' | 'archived'
  description: string

  media: {
    cover_image: Media | null
    opengraph_picture: Media | null
  }

  meta: {
    title: string
    description: string
    opengraph_title: string
    opengraph_description: string
    opengraph_picture_alt: string
  }

  created_at: unknown // TODO
  updated_at: unknown | null // TODO

  translations: {
    title: { en: string, it: string }
    slug: { en: string, it: string }
    description: { en: string, it: string }

    meta_title: { en: string, it: string }
    meta_description: { en: string, it: string }
    opengraph_title: { en: string, it: string }
    opengraph_description: { en: string, it: string }
    opengraph_picture_alt: { en: string, it: string }
    cover_image_alt: { en: string, it: string }
  }
}

export interface ResearchCatalogue {
  id: number
  created_at: string
  updated_at: string
  created_by: number
  updated_by: number
  title: string
  description: string
  external_link: string
  author: string
  slug_it: string
  slug_en: string
  categories: Category[]
  media: {
    cover_image: {
      url: string
      alt: string
    }
    opengraph_picture?: {
      url: string
      alt: string
    }
  }
}

export interface Project {
  id: number
  title: string
  slug: string
  subtitle: string
  description: string
  abstract_text?: string | null
  status: 'published' | 'draft' | 'archived'
  location?: string | null
  start_date?: string | null
  start_hour?: string | null
  end_date?: string | null
  end_hour?: string | null
  /** Ordine editoriale dal CMS (come Activity); se assente, usare `video_url`. */
  video_urls?: string[]
  video_url?: string | null
  attachments?: ActivityAttachment[]
  media?: {
    cover_image: Media | null
    opengraph_picture?: Media | null
    gallery?: Media[]
  }
  cover_image: Media | null

  // media: {
  //   cover_image: Media | null
  //   opengraph_picture: Media | null
  // }

  categories: Category[]

  people_groups?: Array<{
    label: string | null
    label_translations: { en: string | null, it: string | null }
    people: Person[]
  }>

  institutions?: Institution[]

  meta: {
    title: string
    description: string
    opengraph_title: string
    opengraph_description: string
    opengraph_picture_alt: string
  }

  created_at: unknown // TODO
  updated_at: unknown | null // TODO

  slug_translations: {
    en: string
    it: string
  }

  translations: {
    title: { en: string, it: string }
    slug: { en: string, it: string }

    subtitle: Array<unknown> // TODO
    description: Array<unknown> // TODO
    location: Array<unknown> // TODO

    meta_title: Array<unknown> // TODO
    meta_description: Array<unknown> // TODO
    opengraph_title: Array<unknown> // TODO
    opengraph_description: Array<unknown> // TODO
    opengraph_picture_alt: Array<unknown> // TODO
  }
}

export interface CardList {
  success: boolean
  data: Array<
    {
      record_id: string
      dc_identifier: string
      edm_type: string
      dc_title: string
      dc_description: string
      dc_type: string | null
      dc_subject: string
      dc_creator: string
      dc_spatial: string
      dc_date: string
      publish_state: string
      created_at: string
      updated_at: string
    }
  >
}

export interface CardDetail {
  record_id: string
  stable_id: string
  record_json: string
}

export interface SearchResultItem {
  stable_id: string
  used_lang: string
  score_total: number
  snippet: string
  record_id: string
  title_en: string
  score_fts: number
  score_fuzzy: number
}

export interface SearchResult {
  q: string
  mode: string
  limit: number
  offset: number
  count: number
  results: Array<SearchResultItem>
}

export interface SuggestedTermsResultItem {
  term: string
  lang: string
  freq: number
  score: number
}

export interface SuggestedTermsResult {
  q: string
  langMode: string
  limit: number
  suggestions: Array<SuggestedTermsResultItem>

}

export interface TAcknowledgementType {
  title: string
  description: string
}

// =============================================================================
// Region Stories
// =============================================================================

export interface TStoryLinkSchedaType {
  Layout: 'TopLeft' | 'TopRight'
  URL: string
}

export interface TStoryImageType {
  URL: string
  Caption?: string | null
  bgColor?: string | null
}

export const STORY_HEADER_LAYOUTS = [
  'ImageRight',
  'ImageLeft',
  'ImageBackground Text Left',
  'ImageBackground Text Right',
  'None',
] as const

export type TStoryHeaderLayout = (typeof STORY_HEADER_LAYOUTS)[number]

export const STORY_HEADER_LAYOUT_THEMES = ['Light', 'Dark'] as const

export type TStoryHeaderLayoutTheme = (typeof STORY_HEADER_LAYOUT_THEMES)[number]

export interface TStoryHeaderSEOType {
  slug: string
}

export interface TStoryHeaderType {
  Layout: TStoryHeaderLayout
  Title?: string | null
  SubTitle?: string | null
  SEO?: TStoryHeaderSEOType | null
  FontColor?: string | null
  Chip?: string | null
  Image?: TStoryImageType | null
  IndexImage?: TStoryImageType | null
  HeaderLayoutTheme?: TStoryHeaderLayoutTheme | null
  margin?: TStorySectionMargin | null
  padding?: TStorySectionPadding | null
}

/** Kind per UI: TextIntro e InlineText hanno stessa forma JSON ({ Text }). */
export type SectionKind
  = | 'TextIntro'
    | 'InlineText'
    | 'SplitContent'
    | 'SplitImage'
    | 'ScrollReveal'
    | 'InlineImage'
    | 'ImageFullScreen'
    | 'IIFAnnotationsGroup'

export interface TStoryAnimazione {
  Effetto: string
}

export interface TStoryRectEdges {
  top: number
  right: number
  bottom: number
  left: number
}

export type TStorySectionMargin = TStoryRectEdges
export type TStorySectionPadding = TStoryRectEdges

export interface TStorySectionBase {
  Kind: SectionKind
  published?: boolean
  animazione: TStoryAnimazione
  foreColor?: string | null
  bgColor?: string | null
  bgImage?: TStoryImageType | null
  margin?: TStorySectionMargin | null
  padding?: TStorySectionPadding | null
}

export interface TStoryTextIntroType extends TStorySectionBase {
  Kind: 'TextIntro'
  Text: string
}

export interface TStoryInlineTextType extends TStorySectionBase {
  Kind: 'InlineText'
  Text: string
}

export interface TStorySplitContentType extends TStorySectionBase {
  Kind: 'SplitContent'
  LeftText: string
  RightText: string
}

export const STORY_SPLIT_MEDIA_TYPES = ['Image', 'Video'] as const

export type TStorySplitMediaType = (typeof STORY_SPLIT_MEDIA_TYPES)[number]

export interface TStorySplitImageType extends TStorySectionBase {
  Kind: 'SplitImage'
  Layout:
    | 'Right'
    | 'Left'
    | 'RightInline'
    | 'LeftInline'
    | 'RightInlineVertical'
    | 'LeftInlineVertical'
  Text: string
  LinkScheda?: TStoryLinkSchedaType
  Image: TStoryImageType
  MediaType: TStorySplitMediaType
}

export interface TStoryScrollRevealParagraphType {
  Text: string
  Image: TStoryImageType
  LinkScheda?: TStoryLinkSchedaType
}

export interface TStoryScrollRevealType extends TStorySectionBase {
  Kind: 'ScrollReveal'
  Paragraphs: TStoryScrollRevealParagraphType[]
}

export interface TStoryInlineImageType extends TStorySectionBase {
  Kind: 'InlineImage'
  LinkScheda?: TStoryLinkSchedaType
  Image: TStoryImageType
}

export interface TStoryImageFullScreenType extends TStorySectionBase {
  Kind: 'ImageFullScreen'
  Position: 'BottomLeft' | 'BottomRight' | 'TopRight' | 'TopLeft'
  Fit: 'Cover' | 'Contain'
  LinkScheda?: TStoryLinkSchedaType
  Image: TStoryImageType
}

export interface TStoryIIFAnnotationType {
  Text: string
  Rect: PixelRect
}

/**
 * Immagine IIIF Image API 2 per sezioni annotazioni.
 * BaseURI = @id del servizio; Width/Height = canvas full image (info.json).
 */
export interface TStoryIIFImageType {
  BaseURI: string
  Width: number | null
  Height: number | null
  bgColor?: string | null
}

export interface TStoryIIFAnnotationsGroupType extends TStorySectionBase {
  Kind: 'IIFAnnotationsGroup'
  Image: TStoryIIFImageType
  Caption: string | null
  Annotations: TStoryIIFAnnotationType[]
}

export interface TStoryBibliographyType {
  Title: string
  Description: string
}

export interface TStorySitographyType {
  Title: string
  Description: string
}

export interface TStoryCreditsType {
  Title: string
  Description: string
}

export interface TStoryCatalogoOpereCitateType {
  Image: TStoryImageType
  Title: string
  Author: string
  Tags: string[]
  LinkScheda?: TStoryLinkSchedaType
}

export type TStorySection
  = | TStoryTextIntroType
    | TStoryInlineTextType
    | TStorySplitContentType
    | TStorySplitImageType
    | TStoryScrollRevealType
    | TStoryInlineImageType
    | TStoryImageFullScreenType
    | TStoryIIFAnnotationsGroupType

export interface TStoriesExtJson {
  Header: TStoryHeaderType
  sections: TStorySection[]
  bibliography?: Array<TStoryBibliographyType>
  sitography?: Array<TStorySitographyType>
  credits?: Array<TStoryCreditsType>
  catalogoOpereCitate?: Array<TStoryCatalogoOpereCitateType>
}

export interface TStoriesTypeData {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  publish_state: string
  ext_json: TStoriesExtJson
}

// =============================================================================
// End Region Stories
// =============================================================================

export interface TStoriesTypeList {
  success: boolean
  data: Array<TStoriesTypeData>
}
