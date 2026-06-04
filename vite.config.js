import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineConfig({
  base: '/Remakeplace-Comparing-Tools/',
  server: {
    proxy: {
      '/universalis-proxy': {
        target: 'https://universalis.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/universalis-proxy/, '')
      }
    }
  },
  plugins: [
    vue({
      template: {
        transformAssetUrls
      }
    }),
    vuetify({
      autoImport: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
