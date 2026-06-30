import { createOperationsGenerator, defineProvider } from '@nuxt/image/runtime'
import { encodeQueryItem } from 'ufo'

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    width: 'w',
    height: 'h',
    fit: 'fit',
    path: 'path',
  },
  valueMap: {
    fit: {
      contain: 'contain',
      max: 'max',
      fill: 'fill',
      outside: 'crop',
      stretch: 'stretch',
    },
  },
  joinWith: '&',
  formatter: (key, value) => encodeQueryItem(key, value),
})

interface GPAOptions {
  baseURL?: string
}

export default defineProvider<GPAOptions>({
  getImage(url, { modifiers }) {
    // 1. get modifiers
    const operations = operationsGenerator(modifiers)
    // return url
    return { url: `/api/image${url}${operations ? `?${operations}` : ''}` }
  },
})
