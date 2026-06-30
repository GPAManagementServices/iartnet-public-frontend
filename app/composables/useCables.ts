export interface CablesApi {
  CABLES: {
    Patch: {
      new (options?: {
        prefixAssetPath: string
        jsPath: string
        glCanvasId: string
        glCanvasResizeToWindow: boolean
        canvas: { alpha: boolean, premultipliedAlpha: boolean }
        variables: object
      }): any
    }
    exportedPatch: any
    patch: any
  }
}

declare global {
  interface Window extends CablesApi {}
}

export function useCables() {
  return useScript({
    src: '/header-patch/js/patch.js',
    async: true,
    defer: true,
  }, {
    use() {
      return { CABLES: window.CABLES }
    },
  })
}
