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
      // SEO: Core meta tags
      title: 'Dani Banoi Photography - Verona, Valpolicella, Lago di Garda | Travel & Documentary',
      htmlAttrs: {
        lang: 'it' // Primary language Italian for Verona-based photographer
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Fotografo professionista a Verona, Italia. Portfolio di travel e documentary photography da Valpolicella, Lago di Garda. Ritratti, fotografia di strada e progetti personali.' },
        { name: 'keywords', content: 'fotografo Verona, photography Valpolicella, Lago di Garda, travel photography Italia, documentary photographer, ritratti Verona, Dani Banoi, fotografia artistica' },
        { name: 'author', content: 'Dani Banoi' },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'geo.region', content: 'IT-VR' },
        { name: 'geo.placename', content: 'Verona, Valpolicella, Lago di Garda' },
        { name: 'geo.position', content: '45.4384;10.9916' },
        
        // SEO: Open Graph meta tags for social media sharing
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Dani Banoi Photography - Verona, Valpolicella, Lago di Garda' },
        { property: 'og:description', content: 'Fotografo professionista a Verona. Travel e documentary photography da Valpolicella e Lago di Garda, Italia.' },
        { property: 'og:site_name', content: 'Dani Banoi Photography' },
        { property: 'og:locale', content: 'it_IT' },
        { property: 'og:locale:alternate', content: 'en_US' },
        
        // SEO: Twitter Card meta tags for Twitter sharing
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Dani Banoi Photography - Verona, Italia' },
        { name: 'twitter:description', content: 'Travel e documentary photography da Verona, Valpolicella, Lago di Garda. Portfolio fotografico professionale.' },
        
        // SEO: Additional meta tags for better indexing
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      
      // SEO: Font preconnect and stylesheet links
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
