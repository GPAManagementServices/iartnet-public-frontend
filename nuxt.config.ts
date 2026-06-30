// https://nuxt.com/docs/api/configuration/nuxt-config

/** Origine pubblica del sito (Schema.org / canonical / i18n SEO). Obbligatorio per @nuxtjs/seo. */
const siteUrl = process.env.NUXT_SITE_URL || process.env.NUXT_PUBLIC_SITE_URL || 'https://iartnet.it'

/** Default spento (STG/CI): abilitare solo in build PROD con `NUXT_PUBLIC_SITEMAP_ENABLED=true`. */
const sitemapEnabled = process.env.NUXT_PUBLIC_SITEMAP_ENABLED === 'true'

export default defineNuxtConfig({

  modules: [
    '@nuxt/a11y',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
    '@vueuse/nuxt',
    'reka-ui/nuxt',
  ],
  devtools: {
    enabled: true,
  },
  app: {
    pageTransition: { name: 'fade-slow' },
  },
  css: [
    './app/assets/styles/variables.css',
    './app/assets/styles/story-sections.css',
    './app/assets/styles/app.css',
    './app/assets/styles/rich-text.css',
    './app/assets/styles/appear.css',
  ],
  site: {
    url: siteUrl,
    name: 'iArtNET',
  },
  runtimeConfig: {
    public: {
      /** Base URL del backend (admin/staging/prod). Es: https://admin.iartnet-staging.it */
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'https://cms.iartnet.it',
      /** Versione build (da CI/deploy o NUXT_PUBLIC_APP_VERSION). Es: 1.0.0-12-gabc1234 */
      version: process.env.NUXT_PUBLIC_APP_VERSION || '0.0.0-dev',

      baseIIIFUrl: process.env.NUXT_PUBLIC_BASEIIIF_URL || 'https://iiif.iartnet.it',
      baseDataUrl: process.env.NUXT_PUBLIC_BASE_DATA_URL || 'https://ingestion.iartnet.it',

      /** Mostra dati nascosti (raw data, sezione backup People, …). Default disattivato: impostare NUXT_PUBLIC_SHOW_HIDDEN_DATA=true in .env. */
      showHiddenData: process.env.NUXT_PUBLIC_SHOW_HIDDEN_DATA === 'true' ? 'true' : 'false',

      pianoSampleBaseUrl: process.env.NUXT_PUBLIC_PIANO_SAMPLE_BASE_URL ||
      'https://tonejs.github.io/audio/salamander/',

      /** Web Analytics Italia (Matomo-compatible). siteId from official WAI snippet only. */
      waiEnabled: process.env.NUXT_PUBLIC_WAI_ENABLED === 'true',
      waiSiteId: process.env.NUXT_PUBLIC_WAI_SITE_ID || '',
      waiTrackerUrl: process.env.NUXT_PUBLIC_WAI_TRACKER_URL || 'https://ingestion.webanalytics.italia.it/',
      waiDomains: process.env.NUXT_PUBLIC_WAI_DOMAINS || '',

      /** Sitemap SEO (@nuxtjs/seo): default false; true solo in build PROD esplicita. */
      sitemapEnabled,

      showNarratives: process.env.NUXT_PUBLIC_SHOW_NARRATIVES === 'true' ? 'true' : 'false',

    },
  },
  future: {
    compatibilityVersion: 5,
  },
  experimental: {
    typedPages: true,
  },
  compatibilityDate: '2026-03-01',
  routeRules: {
    '/digitalObject/**': { redirect: '/digital-object/**' },
    '/it/digitalObject/**': { redirect: '/it/digital-object/**' },
    '/outputs': { redirect: { to: '/output', statusCode: 301 } },
  },
  postcss: {
    plugins: {
      'postcss-nested': {},
    },
  },
  telemetry: {
    enabled: false,
  },
  eslint: {
    config: {
      autoInit: false,
      standalone: false,
      stylistic: false,
    },
  },
  fonts: {
    defaults: {
      weights: [400, 500, 700],
      subsets: [
        // 'latin-ext',
        'latin',
      ],
    },
    families: [
      { name: 'Satoshi', provider: 'fontshare' },
    ],
  },
  i18n: {
    /** Usato da Site Config + hreflang; evita URL base assente (errori Schema.org tipo webSiteResolver). */
    baseUrl: siteUrl,
    defaultLocale: 'en',
    /** EN senza prefisso URL; `it` sotto `/it/...` — allineato al middleware `lock-locale-en`. */
    strategy: 'prefix_except_default',
    /** Nessun redirect da Accept-Language / cookie: esperienza pubblica sempre EN (it resta in config per messaggi/SEO futuri). */
    detectBrowserLanguage: false,
    locales: [
      { code: 'en', name: 'English', file: 'en.json', dir: 'ltr' },
      { code: 'it', name: 'Italian', file: 'it.json', dir: 'ltr' },
    ],
  },
  icon: {
    customCollections: [
      { prefix: 'app', dir: './app/assets/icons' },
      /** Allineato alle icone `UiIcon` (collection `ui`): `layers/ui` non estende `nuxt.config` del root. */
      { prefix: 'ui', dir: './layers/ui/app/assets/icons' },
    ],
  },
  image: {
    providers: {
      GPA: {
        provider: '~/providers/GPA.ts',
      },
    },
  },
  robots: sitemapEnabled
    ? {
        blockNonSeoBots: true,
        blockAiBots: true,
      }
    : {
        /** STG / build senza sitemap: non indicizzare (vedi anche blocco Nginx opzionale in IARTNET_ENVIRONMENTS.md). */
        disallow: ['/'],
        blockNonSeoBots: true,
        blockAiBots: true,
      },
  sitemap: {
    enabled: sitemapEnabled,
    ...(sitemapEnabled
      ? {
          /** IT nascosto: niente hreflang/alternate verso /it/ nella sitemap CMS. */
          autoI18n: false,
          cacheMaxAgeSeconds: 60 * 60,
          exclude: [
            '/search',
            '/search/**',
          ],
          sitemaps: {
            pages: {
              sources: ['/api/__sitemap__/pages'],
              excludeAppSources: true,
            },
            cms: {
              sources: ['/api/__sitemap__/cms'],
              excludeAppSources: true,
            },
            'ingestion-digital-objects': {
              sources: ['/api/__sitemap__/ingestion-digital-objects'],
              excludeAppSources: true,
            },
            'ingestion-narratives': {
              sources: ['/api/__sitemap__/ingestion-narratives'],
              excludeAppSources: true,
            },
          },
        }
      : {}),
  },
  /** Verovio: import dinamici `verovio/wasm` + `verovio/esm`; con pnpm aiuta Vite a pre-bundle e risoluzione. */
  vite: {
    optimizeDeps: {
      include: ['verovio/wasm', 'verovio/esm'],
    },
  },
})
