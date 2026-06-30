/**
 * narratives-dev scroll motion controls.
 *
 * Phase 0: GSAP off, natural vertical scroll (static layout).
 * Phase 1+: CSS motion via `.narrative-page--css-motion` + narratives-dev-motion.css
 */
export const STORY_DEV_GSAP_SCROLL_ENABLED = false

export const STORY_DEV_CSS_MOTION_ENABLED = true

export type StoryDevCssMotionStrategy
  = | 'panel-pin'
    | 'stack-hold'
    | 'stack-peel'
    | 'stack-peel-video'
    | 'scroll-reveal'

/** CSS motion strategies enabled on narratives-dev (rollout phases). */
export const STORY_DEV_CSS_MOTION_ACTIVE_STRATEGIES = new Set<StoryDevCssMotionStrategy>([
  'panel-pin',
  'stack-hold',
  'stack-peel',
  'stack-peel-video',
  'scroll-reveal',
])

export function isStoryDevGsapScrollEnabled(): boolean {
  return STORY_DEV_GSAP_SCROLL_ENABLED
}

export function isStoryDevCssMotionEnabled(): boolean {
  return STORY_DEV_CSS_MOTION_ENABLED
}

export function isStoryDevCssMotionStrategyActive(strategy: StoryDevCssMotionStrategy): boolean {
  return STORY_DEV_CSS_MOTION_ENABLED
    && STORY_DEV_CSS_MOTION_ACTIVE_STRATEGIES.has(strategy)
}
