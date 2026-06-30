const TRAILING_SLASH_RE = /\/?$/

type MatomoCommand = [string, ...unknown[]]

type WindowWithPaq = Window & {
  _paq?: MatomoCommand[]
}

const BOT_USER_AGENT_RE = /Googlebot|Google-InspectionTool|AdsBot-Google|Mediapartners-Google|APIs-Google|bingbot|DuckDuckBot|YandexBot|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot/i

function isBotUserAgent(userAgent: string): boolean {
  return BOT_USER_AGENT_RE.test(userAgent)
}

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) {
    return
  }

  const config = useRuntimeConfig()
  const enabled = config.public.waiEnabled === true || config.public.waiEnabled === 'true'
  const siteId = String(config.public.waiSiteId || '').trim()

  if (!enabled || !siteId) {
    return
  }

  if (isBotUserAgent(navigator.userAgent)) {
    return
  }

  const trackerBaseUrl = String(
    config.public.waiTrackerUrl || 'https://ingestion.webanalytics.italia.it/',
  ).replace(TRAILING_SLASH_RE, '/')

  const domains = String(config.public.waiDomains || '')
    .split(',')
    .map(domain => domain.trim())
    .filter(Boolean)

  const win = window as WindowWithPaq

  win._paq = win._paq || []

  if (domains.length > 0) {
    win._paq.push(['setDomains', domains])
  }

  win._paq.push(['setTrackerUrl', `${trackerBaseUrl}matomo.php`])
  win._paq.push(['setSiteId', siteId])
  win._paq.push(['trackPageView'])
  win._paq.push(['enableLinkTracking'])

  const existingScript = document.querySelector('script[data-wai-matomo="true"]')

  if (!existingScript) {
    const script = document.createElement('script')
    const firstScript = document.getElementsByTagName('script')[0]

    script.async = true
    script.defer = true
    script.src = `${trackerBaseUrl}matomo.js`
    script.setAttribute('data-wai-matomo', 'true')

    firstScript?.parentNode?.insertBefore(script, firstScript)
  }

  let lastTrackedUrl = window.location.href

  nuxtApp.$router.afterEach(() => {
    window.setTimeout(() => {
      const currentUrl = window.location.href

      if (currentUrl === lastTrackedUrl) {
        return
      }

      lastTrackedUrl = currentUrl

      win._paq = win._paq || []
      win._paq.push(['setCustomUrl', currentUrl])
      win._paq.push(['setDocumentTitle', document.title])
      win._paq.push(['trackPageView'])
    }, 0)
  })
})
