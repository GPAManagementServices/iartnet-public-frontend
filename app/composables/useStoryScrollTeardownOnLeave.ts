/** Rimuove pin/spacer GSAP quando si lascia una pagina narrative (evita layout vuoto al back). */
export async function killAllStoryScrollTriggers(): Promise<void> {
  if (!import.meta.client)
    return

  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  ScrollTrigger.getAll().forEach(trigger => trigger.kill())
}

export function useStoryScrollTeardownOnLeave(): void {
  onBeforeRouteLeave(() => {
    void killAllStoryScrollTriggers()
    window.scrollTo(0, 0)
  })
}
