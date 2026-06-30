export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('appear', {
    mounted(el, {value}) {

      el.classList.add('before-enter--appear')
      
      if (Number(value)) {
       el.style.transitionDuration = value + 'ms' 
      }

      const animateOnScrollObserver = new IntersectionObserver(
        (entries, animateOnScrollObserver) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('enter--appear')
              animateOnScrollObserver.unobserve(entry.target)
            }
          })
        },
      )
      animateOnScrollObserver.observe(el)
    },
    getSSRProps(binding, vnode) {
      // you can provide SSR-specific props here
      return {
        id: binding.value,
      }
    },
  })
})