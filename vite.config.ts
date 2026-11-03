import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const oneYearInSeconds = 60 * 60 * 24 * 365;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // All progress lives in localStorage, so a silent update never loses user state.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'conjugo-logo.webp'],
      manifest: {
        name: 'ConjuGO Verb Trainer',
        short_name: 'ConjuGO',
        description: 'Practice English, French, Spanish, and Italian verb conjugations.',
        theme_color: '#f4f1e8',
        background_color: '#f4f1e8',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webp,svg,ico}'],
        // Cache the fonts linked from index.html for subsequent offline visits.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 30, maxAgeSeconds: oneYearInSeconds },
            },
          },
        ],
      },
    }),
  ],
});
