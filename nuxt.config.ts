import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2026-02-10',
  srcDir: 'src',
  // при srcDir путь public считается от src/ → указываем корневую папку
  dir: {
    public: '../public',
  },
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
    // Disable in Docker builds via NUXT_TYPECHECK=false
    typeCheck: process.env.NUXT_TYPECHECK !== 'false',
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['import', 'global-builtin'],
        },
      },
    },
  },
  runtimeConfig: {
    public: {
      apiBase: '',
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    },
  },
});
