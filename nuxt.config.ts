// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-06-28',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: [
    '~/assets/css/main.css'
  ],
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.PUBLIC_FIREBASE_APP_ID,
    }
  },
  app: {
    // GitHub Pages custom domain → baseURL stays '/' (default)
    // GitHub Pages subdirectory (e.g. username.github.io/eonechomedia/) →
    //   add NUXT_APP_BASE_URL=/eonechomedia/ as a GitHub Actions secret
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap' }
      ]
    }
  },
  nitro: {
    prerender: {
      routes: ['/sitemap.xml']
    }
  }
})
