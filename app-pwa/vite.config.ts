import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    injectRegister: false,

    strategies: 'injectManifest',
    srcDir: 'src',
    filename: 'sw.ts',

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'Sprechender Blumentopf [giesbert]',
      short_name: 'giesbert',
      description: 'A smart plant project.',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#bad7de',
      theme_color: '#bad7de',
      lang: 'de',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icon.svg',
          type: 'image/svg+xml',
          purpose: 'maskable',
        },
        {
          src: '/icon.svg',
          type: 'image/svg+xml',
          purpose: 'any',
        },
      ],
    },

    injectManifest: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
    },

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
})