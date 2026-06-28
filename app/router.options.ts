import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp()

    // Wait for the Nuxt page transition to finish before scrolling to ensure the DOM is ready
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce('page:finish', () => {
        if (to.hash) {
          resolve({
            el: to.hash,
            behavior: 'smooth',
            top: 80 // Offset for the sticky header
          })
        } else if (savedPosition) {
          resolve(savedPosition)
        } else {
          resolve({ top: 0, left: 0 })
        }
      })
    })
  }
}
