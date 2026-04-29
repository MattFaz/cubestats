// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('twisty-'),
    },
  },
  runtimeConfig: {
    databasePath: 'data/cubestats.db',
    authUser: 'admin',
    authPass: 'changeme',
    authSecret: 'dev-secret-change-me',
  },
})