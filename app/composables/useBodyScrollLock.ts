export function useBodyScrollLock(isOpen: Ref<boolean>) {
  const lock = () => {
    if (!import.meta.client)
      return

    // Get the current scroll position
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop

    // Set the scroll position as a style to prevent jump
    document.body.style.top = `-${scrollY}px`
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'

    // Store scroll position for restoration
    document.body.dataset.scrollY = scrollY.toString()
  }

  const unlock = () => {
    if (!import.meta.client)
      return

    // Restore body styles
    document.body.style.top = ''
    document.body.style.position = ''
    document.body.style.width = ''
    document.body.style.overflow = ''

    // Restore scroll position
    const scrollY = document.body.dataset.scrollY || '0'
    window.scrollTo(0, Number.parseInt(scrollY, 10))

    // Clean up
    delete document.body.dataset.scrollY
  }

  watch(isOpen, (newValue) => {
    if (newValue)
      lock()

    else unlock()
  }, { immediate: true })

  // Cleanup on unmount
  onUnmounted(() => {
    unlock()
  })

  return {
    lock,
    unlock,
  }
}
