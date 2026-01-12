// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  css: ['~/assets/styles/fonts.css'],
  
  // Auto-import Vue composables and utilities
  imports: {
    autoImport: true
  },

  // i18n configuration for multilingual support
  i18n: {
    locales: [
      { code: 'it', name: 'Italiano', file: 'it.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'it',
    langDir: 'locales/',
    strategy: 'prefix_except_default'
  },
  
  // SEO: Global head configuration for optimal search engine optimization
  app: {
    head: {
      // Minimal global head; page-specific, localized meta are set in components/pages via useHead
      title: 'Dani Banoi Photography',
      htmlAttrs: { lang: 'it' },
      meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap'
        },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
