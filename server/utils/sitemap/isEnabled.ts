/** Allineato a `runtimeConfig.public.sitemapEnabled` (build-time: `NUXT_PUBLIC_SITEMAP_ENABLED=true`). */
export function isSitemapEnabled(config: {
  public: { sitemapEnabled?: boolean | string }
}): boolean {
  return config.public.sitemapEnabled === true || config.public.sitemapEnabled === 'true'
}
