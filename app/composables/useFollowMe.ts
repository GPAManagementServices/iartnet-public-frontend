import { useMouseInElement, useRafFn } from '@vueuse/core'

interface FollowState {
  xPos: number,
  yPos: number,
  dX: number,
  dY: number
}

export function useFollowMe(el: any) {
  // const el = ref(null)
  const { elementX, elementY, isOutside } = useMouseInElement(el)
  const xOffset = 0
  const yOffset = -100


  const state: FollowState = reactive({
    xPos: 0,
    yPos: 0,
    dX: computed(() => elementX.value - state.xPos + xOffset),
    dY: computed(() => elementY.value - state.yPos + yOffset),
  })



  function updatePosition() {
    state.xPos += Math.floor(state.dX / 10)
    state.yPos += Math.floor(state.dY / 10)

  }

  const { pause, resume } = useRafFn(() => {
    updatePosition()
  })

  watch(isOutside, (newValue) => {
    (newValue === true)
      ? pause()
      : resume()
  })

  return {
    pause,
    resume,
    isOutside,
    ...toRefs(state),
  }
}