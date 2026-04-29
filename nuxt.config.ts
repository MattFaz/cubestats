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
  vite: {
    // cubing.js ships its own search worker; Vite's dep optimizer mangles it
    // and serves text/html instead of JS, breaking scramble generation in dev.
    optimizeDeps: {
      exclude: ['cubing', 'cubing/scramble', 'cubing/twisty'],
    },
    // Vite's __vite_preload__ helper accesses document/window. When cubing's
    // worker entry chunk imports it, the worker crashes with ReferenceError
    // and all of cubing's worker fallbacks fail. Disabling modulePreload
    // strips the helper; we lose <link rel="modulepreload"> hints but for a
    // self-hosted SPA the perf impact is negligible.
    build: {
      modulePreload: false,
    },
  },
  runtimeConfig: {
    databasePath: 'data/cubestats.db',
    authPass: 'changeme',
    authSecret: 'dev-secret-change-me',
  },
})