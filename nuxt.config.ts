import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2026-02-10',
  srcDir: 'src',
  css: ['~/assets/scss/index.scss'],
  modules: ['@pinia/nuxt'],
  pinia: {
    storesDirs: ['~/store'],
  },
  routeRules: {
    '/admin/**': { ssr: false },
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
  runtimeConfig: {
    public: {
      apiBase: '',
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    },
  },
});


