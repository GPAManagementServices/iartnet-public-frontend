import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  components: {
    dirs: [
      { path: join(currentDir, './app/components'), pathPrefix: false, prefix: 'Ui' },
    ],
  },
  app: {
    head: {
      noscript: [{ innerHTML: 'JavaScript is required' }],
    },
    rootAttrs: {
      // id: 'app',
      style: 'isolation: isolate;',
    },
  },
  css: [
    join(currentDir, './app/assets/styles/preflight.css'),
    join(currentDir, './app/assets/styles/variables.css'),
    join(currentDir, './app/assets/styles/utilities.css'),
    join(currentDir, './app/assets/styles/animations.css'),
  ],
  icon: {
    class: 'ui-icon',
    customCollections: [
      { prefix: 'ui', dir: join(currentDir, './app/assets/icons') },
    ],
  },
})
