declare module 'vue-vimeo-player' {
  import type { Component, Plugin } from 'vue'

  /** Options API Vimeo embed component (no upstream types). */
  export const vueVimeoPlayer: Component

  const plugin: Plugin
  export default plugin
}
