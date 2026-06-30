// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu(
    {
      // @antfu/eslint-config options
      // Vue ESLint rules: https://eslint.vuejs.org/rules/
      formatters: { css: true },
      rules: {
        'no-console': 'off',
        'antfu/top-level-function': 'off',
        'node/prefer-global/process': 'off',
      },
    },
    {
      ignores: [
        'public/header-patch/js/patch.js',
      ],
    },
    {
      name: 'iartnet/vue-rules',
      files: ['**/*.vue'],
      rules: {
        'vue/block-order': ['error', {
          order: ['template', 'script', 'style'],
        }],

        'vue/max-attributes-per-line': ['warn', {
          singleline: { max: 3 },
          multiline: { max: 1 },
        }],
      },
    },
  ),
)