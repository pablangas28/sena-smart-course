// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
compatibilityDate: "2025-07-15",
devtools: { enabled: true },
css: ['vuetify/styles'],
modules: ["@pinia/nuxt", "@vueuse/nuxt", "vuetify-nuxt-module", "@nuxt/icon"],
  // Variables de entorno publicas
  runtimeConfig: {
    public: {
      apiBase: 'https://sena-smart-course-back-production.up.railway.app/api',
    },
  },
  // Diseño
  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: "smart",
        themes: {
          smart: {
            dark: false,
            colors: {
              primary: "#39A900",
              secondary: "#0A1628",     
              background: "#F5F7FA",
              surface: "#FFFFFF",
              accent: "#3F6378",
              error: "#FF5252",
              info: "#2196F3",
              success: "#4CAF50",
              warning: "#FFC107"
            }
          }
        }
      }
    }
  }
});
