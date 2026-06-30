/**
 * Logo-only overrides for the global app header on narrative pages.
 * Nav buttons still follow `HeaderLayoutTheme` (Dark/Light).
 *
 * Keys: lowercase slug or plain title (case-insensitive match).
 * Value: true = white logo, false = default dark logo.
 */
export const STORY_APP_HEADER_LOGO_INVERT_BY_SLUG: Record<string, boolean> = {
  'the-teaching-of-artistic-anatomy-in-the-contemporary-period': false,
}

export const STORY_APP_HEADER_LOGO_INVERT_BY_TITLE: Record<string, boolean> = {
  // example: 'Painting, Music and Melodrama': true,
}
